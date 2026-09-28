/**
 * `diagnosticoTransmision` — la bitácora que se manda a Sentry cuando una toma
 * o el visor salen negros.
 *
 * Lo que importa: que una estación sana no mande nada, que una anomalía mande
 * UN evento con todo adentro, y que nada de acá pueda lanzar hacia la
 * grabación.
 */
const scope = {
  setLevel: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
  addAttachment: jest.fn(),
};
jest.mock('@sentry/nextjs', () => ({
  withScope: jest.fn((cb: (s: typeof scope) => void) => cb(scope)),
  captureMessage: jest.fn(),
}));

import * as Sentry from '@sentry/nextjs';
import {
  _bitacora,
  _reiniciarDiagnostico,
  anotar,
  esNegro,
  fijarContexto,
  medirLuma,
  registrarStats,
  reportar,
} from '../diagnosticoTransmision';

function adjunto(): Record<string, unknown> {
  const [[{ data }]] = scope.addAttachment.mock.calls;
  return JSON.parse(data as string);
}

beforeEach(() => {
  jest.clearAllMocks();
  _reiniciarDiagnostico();
});

describe('diagnosticoTransmision', () => {
  it('anotar solo guarda en memoria: una estación sana no manda nada a Sentry', () => {
    anotar('grabar', { muted: false });
    anotar('muestra', { kbps: 7800 });

    expect(_bitacora()).toHaveLength(2);
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it('la bitácora no crece sin límite', () => {
    for (let i = 0; i < 1000; i += 1) anotar('muestra', { i });

    expect(_bitacora().length).toBeLessThanOrEqual(300);
    // Se quedan las ÚLTIMAS: son las que rodean a la anomalía.
    expect(_bitacora().at(-1)?.datos).toEqual({ i: 999 });
  });

  it('un reporte manda un evento con contexto, bitácora y stats de WebRTC', async () => {
    fijarContexto({ rol: 'camara', camara: 'iphone pamela', estacion: 'st-1' });
    fijarContexto({ inspeccion: 77, toma: 2 });
    anotar('grabar', { muted: false });
    registrarStats('emisor', async () => ({ 'outbound-rtp': { framesEncoded: 90 } }));

    await reportar('grabacion_casi_sin_bytes', '77:2', { kbps: 270 });

    expect(Sentry.captureMessage).toHaveBeenCalledWith('inspeccion: grabacion_casi_sin_bytes');
    expect(scope.setTag).toHaveBeenCalledWith('camara', 'iphone pamela');
    expect(scope.setContext).toHaveBeenCalledWith(
      'diagnostico',
      expect.objectContaining({ inspeccion: 77, toma: 2, kbps: 270 })
    );
    const json = adjunto();
    expect(json.stats).toEqual({ emisor: { 'outbound-rtp': { framesEncoded: 90 } } });
    expect((json.bitacora as Array<{ tipo: string }>).map((e) => e.tipo)).toEqual([
      'grabar',
      'reporte:grabacion_casi_sin_bytes',
    ]);
  });

  it('el mismo motivo y clave se reporta una sola vez', async () => {
    await reportar('visor_negro', 'cam-1');
    await reportar('visor_negro', 'cam-1');
    await reportar('visor_negro', 'cam-2');

    expect(Sentry.captureMessage).toHaveBeenCalledTimes(2);
  });

  it('un proveedor de stats que explota no impide el reporte', async () => {
    registrarStats('emisor', async () => {
      throw new Error('pc cerrada');
    });

    await expect(reportar('toma_sin_imagen', 'x')).resolves.toBeUndefined();

    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    expect(adjunto().stats).toEqual({ emisor: 'error: pc cerrada' });
  });

  it('un proveedor que no contesta no cuelga el reporte', async () => {
    jest.useFakeTimers();
    registrarStats('receptor', () => new Promise(() => {}));

    const promesa = reportar('visor_negro', 'cam-1');
    await jest.advanceTimersByTimeAsync(2_000);
    await promesa;
    jest.useRealTimers();

    expect(adjunto().stats).toEqual({ receptor: 'timeout' });
  });

  it('si Sentry explota, reportar no lanza', async () => {
    (Sentry.withScope as jest.Mock).mockImplementationOnce(() => {
      throw new Error('sentry caido');
    });

    await expect(reportar('toma_sin_imagen', 'y')).resolves.toBeUndefined();
  });

  it('desregistrar un proveedor lo saca de los reportes', async () => {
    const quitar = registrarStats('emisor', async () => 'x');
    quitar();

    await reportar('toma_sin_imagen', 'z');

    expect(adjunto().stats).toEqual({});
  });

  it('medirLuma sin cuadro devuelve null en vez de lanzar', () => {
    expect(medirLuma(null)).toBeNull();
    expect(medirLuma(document.createElement('video'))).toBeNull();
  });

  it('esNegro distingue un cuadro negro del fondo blanco de la estación', () => {
    expect(esNegro({ media: 3 })).toBe(true);
    expect(esNegro({ media: 180 })).toBe(false);
    expect(esNegro(null)).toBe(false);
  });
});
