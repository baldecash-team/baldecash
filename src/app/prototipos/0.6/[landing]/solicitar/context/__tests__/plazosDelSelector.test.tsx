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
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'family-farms-baldecash-c' }),
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

function plazosDe(plans: ReturnType<typeof plan>[], frecuencia?: string): string {
  render(
    <ProductProvider landingSlug="family-farms-baldecash-c">
      <Probe plans={plans} frecuencia={frecuencia} />
    </ProductProvider>
  );
  act(() => { screen.getByText('cargar').click(); });
  return screen.getByTestId('plazos').textContent ?? '';
}

afterEach(() => localStorage.clear());

it('los seis planes de Family Farms son dos plazos, no seis', () => {
  const plazos = plazosDe([
    plan(6, 4), plan(8, 2), plan(10, 1),
    plan(13, 4), plan(15, 2), plan(17, 1),
  ]);

  expect(plazos).toBe('10,17');
});

it('sin armadas el plazo total es el term y la lista no cambia', () => {
  // El caso de todo el resto del catálogo: la agrupación es la identidad.
  const plazos = plazosDe([plan(12, 1), plan(18, 1), plan(24, 1)], 'mensual');

  expect(plazos).toBe('12,18,24');
});
