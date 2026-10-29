/**
 * E2E de integración, bug 3 (S3/R7): un seguro guardado en localStorage SIN
 * `insuranceType` (p. ej. `{id:'16', monthlyPrice:11}`) y que el combo ya
 * incluye se quedaba elegido: la barra decía «+1 seguro» y la cuota S/149,
 * mientras el backend lo descarta y cobra S/138. Con el contexto REAL: al
 * cargar el paso de seguros se suelta y la cuota vuelve a la del equipo.
 */
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { ProductProvider, useProduct } from '../../../../context/ProductContext';
import { usePlanesDeSeguro } from '../usePlanesDeSeguro';

jest.mock('next/navigation', () => ({ useParams: () => ({ landing: 'copia-home' }) }));
jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }));
const mockObtener = jest.fn();
jest.mock('@/app/prototipos/0.6/services/landingApi', () => ({
  ...jest.requireActual('@/app/prototipos/0.6/services/landingApi'),
  obtenerPlanesDeSeguro: (...a: unknown[]) => mockObtener(...a),
  getLandingInsurances: (...a: unknown[]) => mockObtener(...a),
}));
jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/SessionContext', () => ({
  useSessionOptional: () => null,
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ layoutData: null }),
}));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ trackInsuranceToggle: jest.fn() }),
}));

const LANDING = 'copia-home';
const CLAVE_PRODUCTO = `baldecash-${LANDING}-solicitar-selected-product`;
const CLAVE_SEGUROS = `baldecash-${LANDING}-solicitar-selected-insurance`;

const PRODUCTO = {
  id: '491', name: 'Lenovo V15', shortName: 'Lenovo V15', price: 2202, monthlyPayment: 138,
  months: 24, term: 24, paymentFrequency: 'mensual', type: 'laptop', condition: 'nueva', comboId: 296,
};

const plan = (id: string, insuranceType: string, includedInCombo: boolean, monthlyPrice: number) => ({
  id, code: `C-${id}`, name: `Plan ${id}`, description: '', monthlyPrice, totalPrice: monthlyPrice * 24,
  paymentMonths: 24, insuranceType, tier: 'basic', isRecommended: false, isMandatory: false,
  coverage: [], exclusions: [], durationMonths: 24, waitingPeriodDays: 0, termsUrl: null, includedInCombo,
});

function usar() {
  return { planes: usePlanesDeSeguro(true), contexto: useProduct() };
}

const envoltorio = ({ children }: { children: React.ReactNode }) => (
  <ProductProvider landingSlug={LANDING}>{children}</ProductProvider>
);

beforeEach(() => {
  localStorage.clear();
  mockObtener.mockReset();
  localStorage.setItem(CLAVE_PRODUCTO, JSON.stringify(PRODUCTO));
});

it.each([
  ['el mismo plan que trae el combo', '16'],
  ['otro robo que R7 ya no ofrece', '99'],
])('suelta un seguro guardado sin tipo (%s): «+0 seguros» y la cuota del equipo', async (_caso, id) => {
  localStorage.setItem(CLAVE_SEGUROS, JSON.stringify([{ id, monthlyPrice: 11 }]));
  mockObtener.mockResolvedValue([
    plan('16', 'seguro_robo', true, 0),
    plan('23', 'multiasistencia', false, 8),
  ]);

  const { result } = renderHook(usar, { wrapper: envoltorio });
  // Antes de cargar se ve lo guardado (así lo vio el E2E: S/149).
  expect(result.current.contexto.getTotalMonthlyPayment()).toBe(149);

  await waitFor(() => expect(result.current.contexto.selectedInsurances).toHaveLength(0));
  expect(result.current.contexto.getTotalMonthlyPayment()).toBe(138);
  expect(JSON.parse(localStorage.getItem(CLAVE_SEGUROS) ?? '[]')).toEqual([]);
});

it('un seguro guardado sin tipo que SÍ se vende (otro tipo) se queda', async () => {
  localStorage.setItem(CLAVE_SEGUROS, JSON.stringify([{ id: '23', monthlyPrice: 8 }]));
  mockObtener.mockResolvedValue([
    plan('16', 'seguro_robo', true, 0),
    plan('23', 'multiasistencia', false, 8),
  ]);

  const { result } = renderHook(usar, { wrapper: envoltorio });
  await waitFor(() => expect(result.current.planes.cargado).toBe(true));
  expect(result.current.contexto.selectedInsurances.map((i) => i.id)).toEqual(['23']);
  expect(result.current.contexto.getTotalMonthlyPayment()).toBe(146);
});
