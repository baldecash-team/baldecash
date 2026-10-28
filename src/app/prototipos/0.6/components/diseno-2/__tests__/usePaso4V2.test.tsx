/**
 * BAL-5204 · el Paso 4 de Diseño 2 vuelve a tener la pantalla de seguros
 * aparte: `vista` ('datos' | 'seguros') y cuándo existe esa pantalla.
 */
import { renderHook, act } from '@testing-library/react';
import { usePaso4V2 } from '../paso4/usePaso4V2';

const PLAN = { id: '14', monthlyPrice: 20, name: 'Garantía Extendida' };

type EstadoPlanes = { cargado: boolean; planes: unknown[]; error: boolean };
let mockEstado: EstadoPlanes = { cargado: true, planes: [], error: false };
const mockElegidos: { lista: { id: string }[] } = { lista: [] };

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/usePlanesDeSeguro', () => ({
  usePlanesDeSeguro: () => ({
    ...mockEstado,
    cargando: !mockEstado.cargado && !mockEstado.error,
    reintentar: jest.fn(),
    elegidos: mockElegidos.lista.map((s) => s.id),
    alternar: jest.fn(),
    tipoDeEquipo: 'Laptop',
  }),
}));

const mockClear = jest.fn();
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext', () => ({
  useProduct: () => ({ selectedInsurances: mockElegidos.lista, clearInsurance: mockClear }),
}));

function mockPlanes(e: EstadoPlanes) {
  mockEstado = e;
}

beforeEach(() => {
  mockElegidos.lista = [];
  mockClear.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

it('con planes arranca en «datos» y pasa a «seguros»', () => {
  mockPlanes({ cargado: true, planes: [PLAN], error: false });
  const { result } = renderHook(() => usePaso4V2({ activo: true, conSeguros: true }));
  expect(result.current.conPantallaDeSeguros).toBe(true);
  expect(result.current.vista).toBe('datos');
  act(() => result.current.irASeguros());
  expect(result.current.vista).toBe('seguros');
  act(() => result.current.volverADatos());
  expect(result.current.vista).toBe('datos');
});

it('mientras cargan los planes ya hay pantalla de seguros (sale el esqueleto ahí)', () => {
  mockPlanes({ cargado: false, planes: [], error: false });
  const { result } = renderHook(() => usePaso4V2({ activo: true, conSeguros: true }));
  expect(result.current.conPantallaDeSeguros).toBe(true);
});

it('sin planes no hay pantalla de seguros', () => {
  mockPlanes({ cargado: true, planes: [], error: false });
  const { result } = renderHook(() => usePaso4V2({ activo: true, conSeguros: true }));
  expect(result.current.conPantallaDeSeguros).toBe(false);
  // Aunque se pida, la vista queda en «datos»: no hay a dónde ir.
  act(() => result.current.irASeguros());
  expect(result.current.vista).toBe('datos');
});

it('con seguros apagados no hay pantalla de seguros', () => {
  mockPlanes({ cargado: false, planes: [], error: false });
  const { result } = renderHook(() => usePaso4V2({ activo: true, conSeguros: false }));
  expect(result.current.conPantallaDeSeguros).toBe(false);
});

it('fuera del resumen de Diseño 2 (inactivo) no hay pantalla de seguros', () => {
  mockPlanes({ cargado: true, planes: [PLAN], error: false });
  const { result } = renderHook(() => usePaso4V2({ activo: false, conSeguros: true }));
  expect(result.current.conPantallaDeSeguros).toBe(false);
});

it('error de carga sin elegidos: una sola pantalla; con elegidos: se mantiene la de seguros', () => {
  mockPlanes({ cargado: false, planes: [], error: true });
  const sin = renderHook(() => usePaso4V2({ activo: true, conSeguros: true }));
  expect(sin.result.current.conPantallaDeSeguros).toBe(false);

  mockElegidos.lista = [{ id: '14' }];
  const con = renderHook(() => usePaso4V2({ activo: true, conSeguros: true }));
  expect(con.result.current.conPantallaDeSeguros).toBe(true);
});

it('solicitud creada antes (envío anticipado): sin pantalla de seguros', () => {
  mockPlanes({ cargado: true, planes: [PLAN], error: false });
  const { result } = renderHook(() => usePaso4V2({ activo: true, conSeguros: true, creadaAntes: true }));
  expect(result.current.conPantallaDeSeguros).toBe(false);
});

it('volverAlCampo desde «seguros» regresa a «datos»', () => {
  jest.useFakeTimers();
  mockPlanes({ cargado: true, planes: [PLAN], error: false });
  const { result } = renderHook(() => usePaso4V2({ activo: true, conSeguros: true }));
  act(() => result.current.irASeguros());
  act(() => result.current.volverAlCampo('payment_day'));
  expect(result.current.vista).toBe('datos');
});
