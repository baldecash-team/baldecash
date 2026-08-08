/**
 * Los plazos que el selector ofrece de verdad, sobre el contexto real.
 *
 * `plazoTotalDelPlan.test.ts` cubre la fórmula con una réplica; esto ejercita
 * `getAvailableTerms` tal como la llama `SelectedProductBar`. Family Farms trae
 * seis planes que son dos plazos con tres modalidades de inicial cada uno
 * —6+4, 8+2 y 10+1 son las tres «10 semanas»—, así que agrupar sin deduplicar
 * dejaba el mismo plazo repetido tres veces en la lista.
 */
import { render, screen, act } from '@testing-library/react';
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
const mockLanding = jest.fn(() => 'family-farms-baldecash-c');

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: mockLanding() }),
}));

/** Un plan tal como lo deja `transformPaymentPlan`: las armadas van en la opción. */
function plan(term: number, armadas: number) {
  return {
    term,
    termMonths: null,
    paymentFrequency: 'semanal',
    options: [{
      initialPercent: 25,
      initialAmount: 134,
      monthlyQuota: 32.2,
      initialInstallments: armadas,
      totalTerm: armadas > 1 ? term + armadas : term,
    }],
  };
}

function producto(plans: ReturnType<typeof plan>[], frecuencia = 'semanal') {
  return {
    id: '1042',
    slug: 'tablet-tab-one-4g-1042',
    name: 'Tab One 4G',
    price: 536,
    monthlyPayment: 25,
    months: 17,
    term: 17,
    initialPercent: 25,
    initialAmount: 134,
    paymentFrequency: frecuencia,
    paymentPlans: plans,
  };
}

function Probe({ plans, frecuencia }: { plans: ReturnType<typeof plan>[]; frecuencia?: string }) {
  const { setSelectedProduct, getAvailableTerms } = useProduct();
  return (
    <div>
      <span data-testid="plazos">{getAvailableTerms().join(',')}</span>
      <button onClick={() => setSelectedProduct(producto(plans, frecuencia) as never)}>cargar</button>
    </div>
  );
}

function plazosDe(
  plans: ReturnType<typeof plan>[],
  frecuencia?: string,
  landingSlug = 'family-farms-baldecash-c',
): string {
  mockLanding.mockReturnValue(landingSlug);
  render(
    <ProductProvider landingSlug={landingSlug}>
      <Probe plans={plans} frecuencia={frecuencia} />
    </ProductProvider>
  );
  act(() => { screen.getByText('cargar').click(); });
  return screen.getByTestId('plazos').textContent ?? '';
}

afterEach(() => localStorage.clear());

it('los seis planes de Family Farms son dos plazos, no seis', () => {
  // En el convenio la inicial ocupa un periodo aunque se pague de una sola vez,
  // asi que la celda de pago unico es 9+1 y 16+1 — no 10+1 y 17+1.
  const plazos = plazosDe([
    plan(6, 4), plan(8, 2), plan(9, 1),
    plan(13, 4), plan(15, 2), plan(16, 1),
  ]);

  expect(plazos).toBe('10,17');
});

it('fuera del convenio la inicial NO ocupa periodo: los plazos no cambian', () => {
  // Todo producto del catalogo con inicial tiene 1 armada. Si la regla del
  // convenio se aplicara global, estos plazos publicados pasarian a 13, 19 y 25.
  const plazos = plazosDe([plan(12, 1), plan(18, 1), plan(24, 1)], 'mensual', 'copia-home');

  expect(plazos).toBe('12,18,24');
});

it('en el convenio, un plan sin inicial arranca en la cuota 1', () => {
  const sinInicial = { ...plan(17, 1) };
  sinInicial.options[0].initialAmount = 0;
  sinInicial.options[0].initialPercent = 0;

  expect(plazosDe([sinInicial])).toBe('17');
});
