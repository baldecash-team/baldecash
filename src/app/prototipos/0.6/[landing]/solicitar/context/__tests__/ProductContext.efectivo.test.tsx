import { render, screen, act, waitFor } from '@testing-library/react';
import { ProductProvider, useProduct, type SelectedProduct } from '../ProductContext';

jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('../SessionContext', () => ({
  useSessionOptional: () => null,
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ settings: null, landingId: null }),
}));
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'home' }),
}));

// fetchProductsByIds — el guion crítico #2: nunca debe llamarse con el id de
// un producto efectivo, porque el catálogo público de ws2 no lo incluye
// (allowlist excluye EFECTIVO por diseño) y lo marcaría como "no disponible".
const fetchProductsByIdsMock = jest.fn().mockResolvedValue([]);
jest.mock('@/app/prototipos/0.6/services/catalogApi', () => ({
  fetchProductsByIds: (...args: unknown[]) => fetchProductsByIdsMock(...args),
}));

jest.mock('@/app/prototipos/0.6/[landing]/producto/api/productDetailApi', () => ({
  fetchProductPaymentPlans: jest.fn().mockResolvedValue(null),
}));
jest.mock('@/app/prototipos/0.6/services/landingApi', () => ({
  getLandingAccessories: jest.fn().mockResolvedValue([]),
  getLandingInsurances: jest.fn().mockResolvedValue([]),
  resolveEcosistema: jest.fn().mockReturnValue(undefined),
}));
jest.mock('@/app/prototipos/0.6/utils/couponApi', () => ({
  validateCoupon: jest.fn().mockResolvedValue({ ok: false }),
}));

const efectivoProduct: SelectedProduct = {
  id: '999',
  name: 'Préstamo en efectivo',
  shortName: 'Efectivo',
  brand: 'BaldeCash',
  price: 3000,
  monthlyPayment: 350,
  months: 12,
  term: 12,
  initialPercent: 0,
  initialAmount: 0,
  image: '/images/products/placeholder.jpg',
  type: 'efectivo',
  paymentFrequency: 'mensual',
};

function Probe() {
  const {
    selectedProduct,
    setSelectedProduct,
    updateAllProductsToTerm,
    updateProductInitial,
    getAvailableTerms,
    getInitialOptionsForProduct,
    unavailableProductIds,
    isValidatingAvailability,
  } = useProduct();

  return (
    <div>
      <span data-testid="monthly">{selectedProduct?.monthlyPayment}</span>
      <span data-testid="initial">{selectedProduct?.initialAmount}</span>
      <span data-testid="months">{selectedProduct?.months}</span>
      <span data-testid="terms">{JSON.stringify(getAvailableTerms())}</span>
      <span data-testid="initial-options">{JSON.stringify(selectedProduct ? getInitialOptionsForProduct(selectedProduct.id) : [])}</span>
      <span data-testid="unavailable">{JSON.stringify(unavailableProductIds)}</span>
      <span data-testid="validating">{String(isValidatingAvailability)}</span>
      <button onClick={() => setSelectedProduct(efectivoProduct)}>seed-efectivo</button>
      <button onClick={() => updateAllProductsToTerm(36)}>change-term</button>
      <button onClick={() => updateProductInitial('999', 20)}>change-initial</button>
    </div>
  );
}

test('un producto efectivo no es re-derivado por updateAllProductsToTerm / updateProductInitial', () => {
  render(
    <ProductProvider landingSlug="home">
      <Probe />
    </ProductProvider>
  );

  act(() => {
    screen.getByText('seed-efectivo').click();
  });

  expect(screen.getByTestId('monthly')).toHaveTextContent('350');
  expect(screen.getByTestId('initial')).toHaveTextContent('0');

  // getAvailableTerms() sólo debe exponer el plazo ya sembrado (12), nunca el
  // fallback [12,18,24,36] de productos de catálogo sin paymentPlans.
  expect(screen.getByTestId('terms')).toHaveTextContent('[12]');

  // El selector de inicial se autooculta igual que para catálogo sin planes.
  expect(screen.getByTestId('initial-options')).toHaveTextContent('[]');

  act(() => {
    screen.getByText('change-term').click();
  });
  // La cuota/plazo NO cambia — ws2 es la única fuente, el FE nunca recalcula.
  expect(screen.getByTestId('monthly')).toHaveTextContent('350');
  expect(screen.getByTestId('months')).toHaveTextContent('12');

  act(() => {
    screen.getByText('change-initial').click();
  });
  expect(screen.getByTestId('monthly')).toHaveTextContent('350');
  expect(screen.getByTestId('initial')).toHaveTextContent('0');
});

test('validateProductsAvailability nunca marca un producto efectivo como no disponible', async () => {
  render(
    <ProductProvider landingSlug="home">
      <Probe />
    </ProductProvider>
  );

  act(() => {
    screen.getByText('seed-efectivo').click();
  });

  await waitFor(() => expect(screen.getByTestId('validating')).toHaveTextContent('false'));

  expect(screen.getByTestId('unavailable')).toHaveTextContent('[]');
  // fetchProductsByIds nunca debe ser invocado con el id del producto efectivo
  // (ni en general, ya que es el único producto seleccionado).
  const calledWithEfectivoId = fetchProductsByIdsMock.mock.calls.some(
    ([, ids]: [string, string[]]) => Array.isArray(ids) && ids.includes('999')
  );
  expect(calledWithEfectivoId).toBe(false);
});
