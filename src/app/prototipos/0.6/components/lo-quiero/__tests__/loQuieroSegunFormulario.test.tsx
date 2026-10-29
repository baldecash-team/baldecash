import { renderHook, act } from '@testing-library/react';
import { useLoQuieroSegunFormulario } from '../useLoQuieroSegunFormulario';

/**
 * BAL-5296 (D1): con `diseno_por_formulario`, «Lo quiero» asigna el formulario
 * (GET /diseno) y abre el modal de Diseño 2 solo si ese formulario está en 2.
 * Sin el flag no se llama a nada: todo igual que hoy.
 */

const pedirMock = jest.fn();
jest.mock('@/app/prototipos/0.6/services/disenoApi', () => ({
  pedirDisenoDeLaSesion: (...a: unknown[]) => pedirMock(...a),
}));

const trackMock = jest.fn();
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ track: trackMock }),
}));

let sessionUuid: string | null = 'u-1';
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/SessionContext', () => ({
  useSessionOptional: () => ({ sessionUuid }),
}));

const fijarMock = jest.fn();
let layout: Record<string, unknown> = {};
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayoutOptional: () => layout,
}));

function montar() {
  return renderHook(() => useLoQuieroSegunFormulario());
}

describe('useLoQuieroSegunFormulario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionUuid = 'u-1';
    layout = { landing: 'home', loQuieroModal: false, disenoSolicitud: 1, disenoPorFormulario: true, fijarDisenoDeLaSesion: fijarMock };
  });

  it('con el flag pide /diseno con el productId del equipo', async () => {
    pedirMock.mockResolvedValue({ formId: 19, disenoSolicitud: 2 });
    const { result } = montar();
    await act(async () => { await result.current.resolverAbreModal('5'); });
    expect(pedirMock).toHaveBeenCalledWith('home', 'u-1', 5);
  });

  it('responde 2 → abre el modal, fija la sesión y mide origen formulario', async () => {
    pedirMock.mockResolvedValue({ formId: 19, disenoSolicitud: 2 });
    const { result } = montar();
    let abre: boolean | undefined;
    await act(async () => { abre = await result.current.resolverAbreModal(5); });
    expect(abre).toBe(true);
    expect(fijarMock).toHaveBeenCalledWith(2);
    expect(trackMock).toHaveBeenCalledWith('lo_quiero_diseno_resuelto', { diseno: 2, origen: 'formulario' });
  });

  it('responde 1 con la landing en 2 → no abre el modal (entra en D1)', async () => {
    layout = { ...layout, loQuieroModal: true, disenoSolicitud: 2 };
    pedirMock.mockResolvedValue({ formId: 1, disenoSolicitud: 1 });
    const { result } = montar();
    let abre: boolean | undefined;
    await act(async () => { abre = await result.current.resolverAbreModal(5); });
    expect(abre).toBe(false);
    expect(fijarMock).toHaveBeenCalledWith(1);
  });

  it('responde null → usa el diseño de la landing, no fija nada y mide origen landing', async () => {
    layout = { ...layout, loQuieroModal: true, disenoSolicitud: 2 };
    pedirMock.mockResolvedValue(null);
    const { result } = montar();
    let abre: boolean | undefined;
    await act(async () => { abre = await result.current.resolverAbreModal(5); });
    expect(abre).toBe(true);
    expect(fijarMock).not.toHaveBeenCalled();
    expect(trackMock).toHaveBeenCalledWith('lo_quiero_diseno_resuelto', { diseno: 2, origen: 'landing' });
  });

  it('zona gamer: el formulario en 2 no abre el modal', async () => {
    layout = { ...layout, landing: 'zona-gamer' };
    pedirMock.mockResolvedValue({ formId: 19, disenoSolicitud: 2 });
    const { result } = montar();
    let abre: boolean | undefined;
    await act(async () => { abre = await result.current.resolverAbreModal(5); });
    expect(abre).toBe(false);
  });

  it('sin session_uuid no pide nada y usa el de la landing', async () => {
    sessionUuid = null;
    const { result } = montar();
    let abre: boolean | undefined;
    await act(async () => { abre = await result.current.resolverAbreModal(5); });
    expect(pedirMock).not.toHaveBeenCalled();
    expect(abre).toBe(false);
    expect(trackMock).toHaveBeenCalledWith('lo_quiero_diseno_resuelto', { diseno: 1, origen: 'landing' });
  });

  it('resolviendo vale true mientras espera', async () => {
    let soltar: (v: unknown) => void = () => {};
    pedirMock.mockReturnValue(new Promise((r) => { soltar = r; }));
    const { result } = montar();
    let p: Promise<boolean> | undefined;
    act(() => { p = result.current.resolverAbreModal(5); });
    expect(result.current.resolviendo).toBe(true);
    await act(async () => { soltar({ formId: 1, disenoSolicitud: 1 }); await p; });
    expect(result.current.resolviendo).toBe(false);
  });

  it('sin LayoutProvider (oferta) porFormulario es false', () => {
    layout = null as unknown as Record<string, unknown>;
    const { result } = montar();
    expect(result.current.porFormulario).toBe(false);
  });

  it('no-regresión: sin el flag porFormulario es false y resolver no llama a nada', async () => {
    layout = { landing: 'home', loQuieroModal: true, disenoSolicitud: 2 };
    const { result } = montar();
    expect(result.current.porFormulario).toBe(false);
    let abre: boolean | undefined;
    await act(async () => { abre = await result.current.resolverAbreModal(5); });
    expect(abre).toBe(true);
    expect(pedirMock).not.toHaveBeenCalled();
    expect(trackMock).not.toHaveBeenCalled();
  });
});

describe('alApretarLoQuiero', () => {
  // Import diferido para no cambiar el orden de los mocks de arriba.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { alApretarLoQuiero } = require('../useLoQuieroSegunFormulario');

  it('no-regresión: sin el flag sigue SÍNCRONO con el diseño de hoy y no resuelve nada', () => {
    const resolver = jest.fn();
    const seguir = jest.fn();
    alApretarLoQuiero({ porFormulario: false, resolviendo: false, resolverAbreModal: resolver }, true, 5, seguir);
    expect(seguir).toHaveBeenCalledTimes(1);
    expect(seguir).toHaveBeenCalledWith(true);
    expect(resolver).not.toHaveBeenCalled();
  });

  it('con el flag espera a ws2 y sigue con lo que dijo el formulario', async () => {
    const resolver = jest.fn().mockResolvedValue(false);
    const seguir = jest.fn();
    alApretarLoQuiero({ porFormulario: true, resolviendo: false, resolverAbreModal: resolver }, true, 5, seguir);
    expect(seguir).not.toHaveBeenCalled();
    await Promise.resolve();
    await Promise.resolve();
    expect(resolver).toHaveBeenCalledWith(5);
    expect(seguir).toHaveBeenCalledWith(false);
  });

  it('con el flag y un clic mientras resuelve, no hace nada', () => {
    const resolver = jest.fn();
    const seguir = jest.fn();
    alApretarLoQuiero({ porFormulario: true, resolviendo: true, resolverAbreModal: resolver }, true, 5, seguir);
    expect(resolver).not.toHaveBeenCalled();
    expect(seguir).not.toHaveBeenCalled();
  });
});
