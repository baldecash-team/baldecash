/**
 * Los plazos que el selector ofrece de verdad, sobre el contexto real.
 *
 * `etiquetaDePlazo.test.ts` cubre el rótulo; esto ejercita `getAvailableTerms`
 * tal como la llama `SelectedProductBar`. Los valores son los `term` de cada
 * celda —las cuotas—, no el plazo total: el total vive en el rótulo, porque el
 * term es lo que identifica la celda y lo que viaja al backend.
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

it('los seis planes de Family Farms son seis opciones, una por celda', () => {
  // Dos plazos con tres modalidades cada uno: 6+4, 8+2 y 10+1 son las tres
  // «10 semanas». Se ofrecen las seis porque en el pricing el plazo y la
  // modalidad de inicial son la misma celda; el rótulo las agrupa a la vista.
  const plazos = plazosDe([
    plan(6, 4), plan(8, 2), plan(10, 1),
    plan(13, 4), plan(15, 2), plan(17, 1),
  ]);

  expect(plazos).toBe('6,8,10,13,15,17');
});

it('sin armadas la lista es la de siempre', () => {
  // El caso de todo el resto del catálogo.
  const plazos = plazosDe([plan(12, 1), plan(18, 1), plan(24, 1)], 'mensual');

  expect(plazos).toBe('12,18,24');
});
