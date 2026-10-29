/**
 * S3/R7: con combo, el paso de seguros pide con combo_id, separa los
 * incluidos (fijos, S/0) de los que se compran y suelta un elegido que el
 * combo ya trae (mismo plan o mismo tipo).
 */
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePlanesDeSeguro } from '../usePlanesDeSeguro';

jest.mock('next/navigation', () => ({ useParams: () => ({ landing: 'home' }) }));
jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }));
const mockObtener = jest.fn();
jest.mock('@/app/prototipos/0.6/services/landingApi', () => ({
  obtenerPlanesDeSeguro: (...a: unknown[]) => mockObtener(...a),
}));
jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/SessionContext', () => ({
  useSessionOptional: () => null,
}));
const mockTrack = jest.fn();
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ trackInsuranceToggle: mockTrack }),
}));
jest.mock('@/app/prototipos/0.6/components/RefurbishedWarningModal', () => ({
  isRefurbishedCondition: () => false,
}));

const mockRemove = jest.fn();
const mockToggle = jest.fn();
const mockClear = jest.fn();
const mockSetMa = jest.fn();
const mockEstado: { elegidos: { id: string; insuranceType?: string }[]; producto?: Record<string, unknown> } = { elegidos: [] };
const PRODUCTO = { id: '491', name: 'Lenovo V15', shortName: 'Lenovo V15', price: 2202, months: 24, type: 'laptop', condition: 'nueva', comboId: 52 };
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext', () => ({
  useProduct: () => ({
    selectedInsurances: mockEstado.elegidos,
    toggleInsurance: mockToggle,
    removeInsurances: mockRemove,
    clearInsurance: mockClear,
    selectedProduct: mockEstado.producto ?? PRODUCTO,
    cartProducts: [],
    setAvailableMultiasistencia: mockSetMa,
  }),
}));

const plan = (id: string, insuranceType: string, includedInCombo: boolean, monthlyPrice: number) => ({
  id, code: `C-${id}`, name: `Plan ${id}`, description: '', monthlyPrice, totalPrice: monthlyPrice * 24,
  paymentMonths: 24, insuranceType, tier: 'basic', isRecommended: false, isMandatory: false,
  coverage: [], exclusions: [], durationMonths: 24, waitingPeriodDays: 0, termsUrl: null, includedInCombo,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockEstado.elegidos = [];
  mockEstado.producto = undefined;
  mockObtener.mockResolvedValue([
    plan('16', 'seguro_robo', true, 0),
    plan('14', 'garantia_extendida', true, 0),
    plan('23', 'multiasistencia', false, 10),
  ]);
});

it('pide con combo_id y separa incluidos de los que se compran', async () => {
  const { result } = renderHook(() => usePlanesDeSeguro(true));
  await waitFor(() => expect(result.current.cargado).toBe(true));
  expect(mockObtener).toHaveBeenCalledWith('home', 'Laptop', 2202, 24, null, null, 52);
  expect(result.current.incluidos.map((p) => p.id)).toEqual(['16', '14']);
  expect(result.current.planes.map((p) => p.id)).toEqual(['23']);
  // La Multiasistencia disponible sale de los que se compran.
  expect(mockSetMa).toHaveBeenLastCalledWith(expect.objectContaining({ id: '23' }));
});

it('un incluido no se puede alternar', async () => {
  const { result } = renderHook(() => usePlanesDeSeguro(true));
  await waitFor(() => expect(result.current.cargado).toBe(true));
  act(() => result.current.alternar('16'));
  expect(mockToggle).not.toHaveBeenCalled();
  act(() => result.current.alternar('23'));
  expect(mockToggle).toHaveBeenCalledWith(expect.objectContaining({ id: '23' }));
});

it('suelta un elegido que el combo ya trae (mismo plan o mismo tipo)', async () => {
  mockEstado.elegidos = [
    { id: '16', insuranceType: 'seguro_robo' },
    { id: '99', insuranceType: 'seguro_robo' },
    { id: '23', insuranceType: 'multiasistencia' },
  ];
  renderHook(() => usePlanesDeSeguro(true));
  await waitFor(() => expect(mockRemove).toHaveBeenCalledWith(['16', '99']));
});

it('D7: en quincenal igual pide con combo_id y separa los incluidos (plazo en meses)', async () => {
  mockEstado.producto = { ...PRODUCTO, months: 12, paymentFrequency: 'quincenal', term: 24 };
  mockObtener.mockResolvedValue([plan('15', 'seguro_robo', true, 0)]);
  const { result } = renderHook(() => usePlanesDeSeguro(true));
  await waitFor(() => expect(result.current.cargado).toBe(true));
  expect(mockObtener).toHaveBeenCalledWith('home', 'Laptop', 2202, 12, null, null, 52);
  expect(result.current.incluidos.map((p) => p.id)).toEqual(['15']);
  expect(result.current.planes).toEqual([]);
});

it.each([
  ['quincenal', 24],
  ['semanal', 48],
])('I-1: producto copia-home %s (months = term en cuotas) pide con el plazo en meses', async (frecuencia, cuotas) => {
  mockEstado.producto = { ...PRODUCTO, months: cuotas, term: cuotas, paymentFrequency: frecuencia };
  mockObtener.mockResolvedValue([plan('15', 'seguro_robo', true, 0)]);
  const { result } = renderHook(() => usePlanesDeSeguro(true));
  await waitFor(() => expect(result.current.cargado).toBe(true));
  expect(mockObtener).toHaveBeenCalledWith('home', 'Laptop', 2202, 12, null, null, 52);
});
