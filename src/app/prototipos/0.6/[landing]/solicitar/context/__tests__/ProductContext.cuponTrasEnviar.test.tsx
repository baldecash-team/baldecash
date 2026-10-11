import { render, screen, act, waitFor } from '@testing-library/react';
import { ProductProvider, useProduct } from '../ProductContext';

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

const CLAVE_APLICADO = 'baldecash-home-solicitar-applied-coupon';
const CLAVE_PENDIENTE = 'baldecash-home-pending-coupon';

// Cupón que llegó por link: `lockedFromUrl` es el candado que impide quitarlo
// a mano mientras se llena el formulario.
const cuponDelLink = {
  code: 'BALDEFINDE',
  discount: 50,
  label: '50% de descuento en tu primera cuota',
  lockedFromUrl: true,
};

function Probe() {
  const { appliedCoupon, clearCoupon, clearCouponAfterSubmit } = useProduct();
  return (
    <div>
      <span data-testid="cupon">{appliedCoupon?.code ?? 'sin-cupon'}</span>
      <button onClick={clearCoupon}>quitar-a-mano</button>
      <button onClick={clearCouponAfterSubmit}>tras-enviar</button>
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
  localStorage.setItem(CLAVE_APLICADO, JSON.stringify(cuponDelLink));
});

test('el cupón del link no se puede quitar a mano mientras se llena el formulario', async () => {
  montar();
  await waitFor(() => expect(screen.getByTestId('cupon')).toHaveTextContent('BALDEFINDE'));

  act(() => {
    screen.getByText('quitar-a-mano').click();
  });

  expect(screen.getByTestId('cupon')).toHaveTextContent('BALDEFINDE');
  expect(localStorage.getItem(CLAVE_APLICADO)).not.toBeNull();
});

test('tras enviar la solicitud el cupón del link se borra del navegador', async () => {
  localStorage.setItem(CLAVE_PENDIENTE, 'BALDEFINDE');
  montar();
  await waitFor(() => expect(screen.getByTestId('cupon')).toHaveTextContent('BALDEFINDE'));

  act(() => {
    screen.getByText('tras-enviar').click();
  });

  expect(screen.getByTestId('cupon')).toHaveTextContent('sin-cupon');
  expect(localStorage.getItem(CLAVE_APLICADO)).toBeNull();
  expect(localStorage.getItem(CLAVE_PENDIENTE)).toBeNull();
});
