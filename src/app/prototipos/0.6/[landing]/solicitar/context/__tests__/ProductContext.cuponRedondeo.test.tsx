import { render, screen, waitFor } from '@testing-library/react';
import { ProductProvider, useProduct, getStorageKey } from '../ProductContext';

/**
 * Desde el 22-oct-2026 la cuota rebajada por un cupón se cobra en soles
 * enteros (mitad hacia arriba): el descuento que anuncia el wizard tiene que
 * salir de esa MISMA cuenta — `cuota normal − cuota con cupón redondeada al
 * sol` — y no de `cuota normal × descuento%` sin redondear. Antes
 * `getDiscountAmount` calculaba el descuento crudo: 179 al 30 % daba 53.70 en
 * vez de 54 (179 − 125).
 */

jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('../SessionContext', () => ({
  useSessionOptional: () => null,
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ layoutData: null }),
}));
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'home' }),
}));

const CLAVE_PRODUCTO = getStorageKey('home');
const CLAVE_CUPON = 'baldecash-home-solicitar-applied-coupon';

function productoBase(monthlyPayment: number) {
  return {
    id: '1',
    name: 'Producto de prueba',
    shortName: 'Producto',
    brand: 'asus',
    price: 2000,
    monthlyPayment,
    months: 24,
    term: 24,
    initialPercent: 0,
    initialAmount: 0,
    image: 'https://cdn.example.com/producto.webp',
    // Fuera del catálogo: evita que el provider le pida planes de pago o
    // valide su disponibilidad contra la API (ver productoFueraDeCatalogo.ts).
    outOfCatalog: true,
  };
}

function Probe() {
  const { getDiscountAmount, getDiscountedMonthlyPayment } = useProduct();
  return (
    <div>
      <span data-testid="descuento">{getDiscountAmount()}</span>
      <span data-testid="cuota-con-cupon">{getDiscountedMonthlyPayment()}</span>
    </div>
  );
}

function montar() {
  render(
    <ProductProvider landingSlug="home">
      <Probe />
    </ProductProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

test('producto 179 + cupón 30 %: el descuento es 54 (179 - 125), no 53.70', async () => {
  localStorage.setItem(CLAVE_PRODUCTO, JSON.stringify(productoBase(179)));
  localStorage.setItem(
    CLAVE_CUPON,
    JSON.stringify({ code: 'PRUEBA30', discount: 30, label: '', couponType: 'percent_quotas' })
  );

  montar();

  await waitFor(() => expect(screen.getByTestId('descuento')).toHaveTextContent('54'));
  expect(screen.getByTestId('cuota-con-cupon')).toHaveTextContent('125');
});

test('producto 105 + cupón 10 %: el descuento es 10 (105 - 95), no 10.50', async () => {
  localStorage.setItem(CLAVE_PRODUCTO, JSON.stringify(productoBase(105)));
  localStorage.setItem(
    CLAVE_CUPON,
    JSON.stringify({ code: 'PRUEBA10', discount: 10, label: '', couponType: 'percent_quotas' })
  );

  montar();

  await waitFor(() => expect(screen.getByTestId('descuento')).toHaveTextContent('10'));
  expect(screen.getByTestId('cuota-con-cupon')).toHaveTextContent('95');
});
