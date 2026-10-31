/**
 * BAL-5407: el panel «Tu solicitud» de Diseño 2 (cabecera de celular y panel
 * de escritorio) mostraba el `shortName` —el `product.name` interno,
 * «PM1503CDA»— antes que el nombre de la card del catálogo («Laptop PM1503CDA
 * R5 16GB 512GB»), que las entradas guardan en `name`.
 */
import { renderHook } from '@testing-library/react';
import { useDatosDelPanel } from '../PanelSolicitudV2';

const mockProductos: { current: Array<Record<string, unknown>> } = { current: [] };

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext', () => ({
  useProduct: () => ({
    getAllProducts: () => mockProductos.current,
    getInitialOptionsForProduct: () => [],
    getTotalMonthlyPayment: () => 199,
    selectedAccessories: [],
    selectedInsurances: [],
  }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ puedeCambiarPlazo: false, deferredPayment: { enabled: false } }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/useCondicionesDelPlan', () => ({
  useCondicionesDelPlan: () => ({ congelada: false, termOptions: [], landingSlug: 'prueba-formulario' }),
}));

jest.mock('@/app/prototipos/0.6/components/lo-quiero/useMesPrimeraCuota', () => ({
  useMesPrimeraCuota: () => null,
}));

const PM1503 = {
  id: '1501',
  name: 'Laptop PM1503CDA R5 16GB 512GB',
  shortName: 'PM1503CDA',
  term: 24,
  months: 24,
  paymentFrequency: 'mensual',
  initialAmount: 0,
};

describe('useDatosDelPanel — nombre del equipo (BAL-5407)', () => {
  it('es el nombre de la card, no el nombre corto', () => {
    mockProductos.current = [PM1503];
    const { result } = renderHook(() => useDatosDelPanel(false));
    expect(result.current.nombre).toBe('Laptop PM1503CDA R5 16GB 512GB');
  });

  it('sin `name` (sesión vieja) cae al nombre corto', () => {
    mockProductos.current = [{ ...PM1503, name: '' }];
    const { result } = renderHook(() => useDatosDelPanel(false));
    expect(result.current.nombre).toBe('PM1503CDA');
  });

  it('con varios equipos sigue diciendo «N equipos»', () => {
    mockProductos.current = [PM1503, { ...PM1503, id: '2' }];
    const { result } = renderHook(() => useDatosDelPanel(false));
    expect(result.current.nombre).toBe('2 equipos');
  });
});
