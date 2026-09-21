/**
 * `senalizacion.ts` — el transporte de la negociación WebRTC.
 *
 * Los dos tests que más importan: que un dispositivo NO reaccione a señales
 * que no son para él (el evento viaja a todo el canal), y que
 * `esperarIceCompleto` corte solo a los 2s en vez de colgarse para siempre
 * si un STUN no contesta.
 */
import {
  bindSenales,
  esperarIceCompleto,
  mandarSenal,
  SENAL_EVENT,
  type SenalChannel,
  type SenalPayload,
} from '../senalizacion';
import { FakeRTCPeerConnection, instalarFakeRTC } from '../../_test-support/fakeRTC';

class FakeChannel implements SenalChannel {
  private handlers: Record<string, Array<(data: unknown) => void>> = {};

  bind(event: string, cb: (data: unknown) => void): void {
    (this.handlers[event] ??= []).push(cb);
  }

  unbind(event: string, cb: (data: unknown) => void): void {
    this.handlers[event] = (this.handlers[event] ?? []).filter((h) => h !== cb);
  }

  emit(event: string, data: unknown): void {
    (this.handlers[event] ?? []).forEach((cb) => cb(data));
  }
}

const OFERTA: SenalPayload = {
  origen_device_id: 'dev-esc-01',
  destino_device_id: 'dev-cam-01',
  tipo: 'offer',
  sdp: 'SDP-OFERTA',
};

describe('mandarSenal', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  it('postea la señal con el device token en el header', async () => {
    await mandarSenal('tok-123', 'dev-cam-01', 'offer', 'SDP-OFERTA');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opciones] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/inspections/devices/senal');
    expect(opciones.headers['X-Device-Token']).toBe('tok-123');
    expect(JSON.parse(opciones.body)).toEqual({
      destino_device_id: 'dev-cam-01',
      tipo: 'offer',
      sdp: 'SDP-OFERTA',
    });
  });

  it('el bye viaja con sdp vacío', async () => {
    await mandarSenal('tok-123', 'dev-cam-01', 'bye');

    const [, opciones] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(opciones.body).sdp).toBe('');
  });

  it('un fallo de red no lanza: la transmisión es best-effort', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('sin red'));

    await expect(mandarSenal('tok-123', 'dev-cam-01', 'offer', 'X')).resolves.toBeUndefined();
  });
});

describe('bindSenales', () => {
  it('entrega las señales dirigidas a este dispositivo', () => {
    const channel = new FakeChannel();
    const onSenal = jest.fn();
    bindSenales(channel, 'dev-cam-01', onSenal);

    channel.emit(SENAL_EVENT, OFERTA);

    expect(onSenal).toHaveBeenCalledWith(OFERTA);
  });

  it('REGLA CRÍTICA: descarta las señales dirigidas a OTRO dispositivo', () => {
    const channel = new FakeChannel();
    const onSenal = jest.fn();
    bindSenales(channel, 'dev-cam-02', onSenal);

    channel.emit(SENAL_EVENT, OFERTA);

    expect(onSenal).not.toHaveBeenCalled();
  });

  it('descarta un payload sin forma de señal', () => {
    const channel = new FakeChannel();
    const onSenal = jest.fn();
    bindSenales(channel, 'dev-cam-01', onSenal);

    channel.emit(SENAL_EVENT, null);
    channel.emit(SENAL_EVENT, { tipo: 'offer' });

    expect(onSenal).not.toHaveBeenCalled();
  });

  it('la función que devuelve desbindea', () => {
    const channel = new FakeChannel();
    const onSenal = jest.fn();
    const desbindear = bindSenales(channel, 'dev-cam-01', onSenal);

    desbindear();
    channel.emit(SENAL_EVENT, OFERTA);

    expect(onSenal).not.toHaveBeenCalled();
  });

  it('con channel null no rompe y devuelve un no-op', () => {
    expect(() => bindSenales(null, 'dev-cam-01', jest.fn())()).not.toThrow();
  });
});

describe('esperarIceCompleto', () => {
  beforeEach(() => {
    instalarFakeRTC();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resuelve en cuanto el gathering termina', async () => {
    const pc = new FakeRTCPeerConnection();
    let resuelto = false;
    const promesa = esperarIceCompleto(pc as unknown as RTCPeerConnection).then(() => {
      resuelto = true;
    });

    expect(resuelto).toBe(false);
    // Deja correr los microtasks pendientes SIN tocar los timers falsos: si
    // la implementación resolviera de una (ignorando el estado del peer),
    // acá ya se vería — a diferencia de solo chequear justo después de
    // crear la promesa, que no distingue "espera de verdad" de "resuelve
    // ya pero el .then todavía no corrió".
    await Promise.resolve();
    expect(resuelto).toBe(false);

    pc.completarIce();
    await promesa;

    expect(resuelto).toBe(true);
  });

  it('resuelve de inmediato si ya estaba completo', async () => {
    const pc = new FakeRTCPeerConnection();
    pc.iceGatheringState = 'complete';

    await expect(esperarIceCompleto(pc as unknown as RTCPeerConnection)).resolves.toBeUndefined();
  });

  it('REGLA CRÍTICA: corta a los 2s y manda lo que juntó, en vez de colgarse', async () => {
    const pc = new FakeRTCPeerConnection();
    let resuelto = false;
    const promesa = esperarIceCompleto(pc as unknown as RTCPeerConnection).then(() => {
      resuelto = true;
    });

    // Un milisegundo antes del corte todavía no debe resolver: si esto no
    // se chequea, un timeout más corto (o ausente) pasaría este test igual.
    jest.advanceTimersByTime(1999);
    await Promise.resolve();
    expect(resuelto).toBe(false);

    jest.advanceTimersByTime(1);
    await promesa;

    expect(resuelto).toBe(true);
  });
});
