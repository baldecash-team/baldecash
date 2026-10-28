/**
 * BAL-5204/BAL-5237 · cuándo existe la pantalla de seguros del Paso 4 de
 * Diseño 2 (desde BAL-5237 es su propia página, `/solicitar/complementos`) y
 * si los planes todavía cargan (el Resumen espera para decidir).
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

it('con planes hay pantalla de seguros (la página propia) y ya no hay «vista» interna', () => {
  mockPlanes({ cargado: true, planes: [PLAN], error: false });
  const { result } = renderHook(() => usePaso4V2({ activo: true, conSeguros: true }));
  expect(result.current.conPantallaDeSeguros).toBe(true);
  expect(result.current.cargandoPlanes).toBe(false);
  expect(result.current).not.toHaveProperty('vista');
  expect(result.current).not.toHaveProperty('irASeguros');
  expect(result.current).not.toHaveProperty('volverADatos');
});

it('mientras cargan los planes: `cargandoPlanes` (el Resumen espera para decidir)', () => {
  mockPlanes({ cargado: false, planes: [], error: false });
  const { result } = renderHook(() => usePaso4V2({ activo: true, conSeguros: true }));
  expect(result.current.cargandoPlanes).toBe(true);
});

it('sin seguros o inactivo, nunca está «cargando planes»', () => {
  mockPlanes({ cargado: false, planes: [], error: false });
  expect(renderHook(() => usePaso4V2({ activo: true, conSeguros: false })).result.current.cargandoPlanes).toBe(false);
  expect(renderHook(() => usePaso4V2({ activo: false, conSeguros: true })).result.current.cargandoPlanes).toBe(false);
  expect(renderHook(() => usePaso4V2({ activo: true, conSeguros: true, creadaAntes: true })).result.current.cargandoPlanes).toBe(false);
});

it('con error de carga ya no está «cargando planes»', () => {
  mockPlanes({ cargado: false, planes: [], error: true });
  expect(renderHook(() => usePaso4V2({ activo: true, conSeguros: true })).result.current.cargandoPlanes).toBe(false);
});

it('sin planes no hay pantalla de seguros', () => {
  mockPlanes({ cargado: true, planes: [], error: false });
  const { result } = renderHook(() => usePaso4V2({ activo: true, conSeguros: true }));
  expect(result.current.conPantallaDeSeguros).toBe(false);
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

it('volverAlCampo baja al campo y lo resalta', () => {
  jest.useFakeTimers();
  mockPlanes({ cargado: true, planes: [PLAN], error: false });
  const campo = document.createElement('div');
  campo.setAttribute('data-campo', 'payment_day');
  document.body.appendChild(campo);
  window.scrollBy = jest.fn();
  try {
    const { result } = renderHook(() => usePaso4V2({ activo: true, conSeguros: true }));
    act(() => result.current.volverAlCampo('payment_day'));
    expect(campo.getAttribute('data-guia')).toBe('brillo');
  } finally {
    campo.remove();
  }
});
