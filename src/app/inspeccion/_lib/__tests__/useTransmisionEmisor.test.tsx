/**
 * `useTransmisionEmisor` — el lado cámara de la transmisión en vivo.
 *
 * Los tests que más importan: que se cuelgue del MISMO track que graba (no
 * de un `getUserMedia` nuevo), que el sender salga limitado, y que cuando el
 * escáner se va del canal el teléfono deje de codificar — el modo de falla
 * que nadie ve.
 */
import { renderHook, waitFor } from '@testing-library/react';
import type { RefObject } from 'react';
import { useTransmisionEmisor, PREVIEW_BITRATE_MAX } from '../useTransmisionEmisor';
import { SENAL_EVENT, type SenalChannel } from '../senalizacion';
import {
  FakeRTCPeerConnection,
  FakeRTCRtpSender,
  instalarFakeRTC,
  ultimoPeer,
} from '../../_test-support/fakeRTC';

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

/**
 * Track de cámara con listeners de verdad: el hook se engancha a `ended`
 * para enterarse del rearme, así que un objeto literal con solo
 * `getSettings` no alcanzaría.
 */
class FakeTrack {
  private oyentes: Record<string, Array<() => void>> = {};

  constructor(
    private ancho = 1920,
    private alto = 1080
  ) {}

  getSettings() {
    return { width: this.ancho, height: this.alto };
  }

  addEventListener(evento: string, cb: () => void): void {
    (this.oyentes[evento] ??= []).push(cb);
  }

  removeEventListener(evento: string, cb: () => void): void {
    this.oyentes[evento] = (this.oyentes[evento] ?? []).filter((o) => o !== cb);
  }

  /** Lo que hace `useKioskRecorder.armar()` con los tracks viejos: los
   * detiene y emite `ended` a mano sobre cada uno — `stop()` solo no lo
   * emite (spec de Media Capture). */
  terminar(): void {
    (this.oyentes.ended ?? []).forEach((cb) => cb());
  }
}

function fakeTrack(ancho = 1920, alto = 1080): FakeTrack {
  return new FakeTrack(ancho, alto);
}

function fakeStream(track: FakeTrack): MediaStream {
  return { getVideoTracks: () => [track] } as unknown as MediaStream;
}

const OFERTA = {
  origen_device_id: 'dev-esc-01',
  destino_device_id: 'dev-cam-01',
  tipo: 'offer' as const,
  sdp: 'SDP-OFERTA',
};

function montar(stream: MediaStream | null) {
  const channel = new FakeChannel();
  // Objeto literal y no `createRef()`: en los tipos nuevos de React el
  // `current` de un `RefObject` es readonly y no se puede sembrar.
  const streamRef: RefObject<MediaStream | null> = { current: stream };
  const vista = renderHook(() =>
    useTransmisionEmisor({ channel, deviceId: 'dev-cam-01', token: 'tok', streamRef })
  );
  return { channel, streamRef, vista };
}

function cuerposEnviados(): Array<Record<string, string>> {
  return (global.fetch as jest.Mock).mock.calls.map((c) => JSON.parse(c[1].body));
}

describe('useTransmisionEmisor', () => {
  beforeEach(() => {
    instalarFakeRTC();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  // Varios tests espían `console.warn` o el prototipo del sender. Si uno
  // falla antes de su `mockRestore()`, el espía queda puesto y el test
  // SIGUIENTE hereda un doble que no pidió — así un test puede fallar (o
  // pasar) por culpa del anterior y no por lo que mide.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ante una oferta crea un peer y contesta con una answer', async () => {
    const { channel } = montar(fakeStream(fakeTrack()));

    channel.emit(SENAL_EVENT, OFERTA);

    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc = ultimoPeer();
    pc.completarIce();

    await waitFor(() => {
      const cuerpos = (global.fetch as jest.Mock).mock.calls.map((c) => JSON.parse(c[1].body));
      expect(cuerpos).toContainEqual({
        destino_device_id: 'dev-esc-01',
        tipo: 'answer',
        sdp: 'SDP-ANSWER',
      });
    });
    expect(pc.remoteDescription).toEqual({ type: 'offer', sdp: 'SDP-OFERTA' });
  });

  it('se cuelga del MISMO track que graba, no de uno nuevo', async () => {
    const track = fakeTrack();
    const { channel } = montar(fakeStream(track));

    channel.emit(SENAL_EVENT, OFERTA);

    await waitFor(() => expect(ultimoPeer().senders).toHaveLength(1));
    expect(ultimoPeer().senders[0].track).toBe(track);
  });

  it('limita el sender: bitrate, escala y preferencia de degradación', async () => {
    // Spy sobre el PROTOTIPO, no lectura de `getParameters()` después del
    // hecho: en el fake, `getParameters()` devuelve el mismo objeto interno
    // que se está mutando en el lugar, así que leerlo al final "ve" los
    // cambios aunque `setParameters` nunca se hubiera llamado. Lo que
    // protege al sender real es la LLAMADA a `setParameters` — eso es lo que
    // hay que espiar.
    const setParametersSpy = jest.spyOn(FakeRTCRtpSender.prototype, 'setParameters');
    const { channel } = montar(fakeStream(fakeTrack(1920, 1080)));

    channel.emit(SENAL_EVENT, OFERTA);

    await waitFor(() => expect(ultimoPeer().senders).toHaveLength(1));
    await waitFor(() => expect(setParametersSpy).toHaveBeenCalledTimes(2));

    const [primeraLlamada, segundaLlamada] = setParametersSpy.mock.calls.map((c) => c[0]);
    expect(primeraLlamada.encodings[0].maxBitrate).toBe(PREVIEW_BITRATE_MAX);
    expect(primeraLlamada.encodings[0].scaleResolutionDownBy).toBeCloseTo(1920 / 480);
    expect(
      (segundaLlamada as { degradationPreference?: string }).degradationPreference
    ).toBe('maintain-framerate');

    setParametersSpy.mockRestore();
  });

  it('sin cámara armada no abre ningún peer', () => {
    const { channel } = montar(null);

    channel.emit(SENAL_EVENT, OFERTA);

    expect(FakeRTCPeerConnection.instances).toHaveLength(0);
  });

  it('un bye cierra el peer', async () => {
    const { channel } = montar(fakeStream(fakeTrack()));
    channel.emit(SENAL_EVENT, OFERTA);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc = ultimoPeer();

    channel.emit(SENAL_EVENT, { ...OFERTA, tipo: 'bye', sdp: '' });

    expect(pc.cerrada).toBe(true);
  });

  it('REGLA CRÍTICA: si el escáner se va del canal, el teléfono deja de codificar', async () => {
    const { channel } = montar(fakeStream(fakeTrack()));
    channel.emit(SENAL_EVENT, OFERTA);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc = ultimoPeer();

    channel.emit('pusher:member_removed', { id: 'dev-esc-01' });

    expect(pc.cerrada).toBe(true);
  });

  it('ICE caída cierra el peer', async () => {
    const { channel } = montar(fakeStream(fakeTrack()));
    channel.emit(SENAL_EVENT, OFERTA);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc = ultimoPeer();

    pc.cambiarIce('failed');

    expect(pc.cerrada).toBe(true);
  });

  it('al desmontar cierra todo', async () => {
    const { channel, vista } = montar(fakeStream(fakeTrack()));
    channel.emit(SENAL_EVENT, OFERTA);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc = ultimoPeer();

    vista.unmount();

    expect(pc.cerrada).toBe(true);
  });

  it('REGLA CRÍTICA: una segunda oferta mientras la primera junta ICE no mata a la segunda', async () => {
    // El modo de falla: `responder` se suspende en `await limitarSender`
    // con pc1 a medio armar; llega la oferta 2 (el escáner reintentando),
    // que cierra pc1 y registra pc2; pc1 reanuda y su
    // `setRemoteDescription` tira `InvalidStateError` porque su peer está
    // cerrado. Si el manejo de ese error cerrara POR CLAVE en vez de por
    // identidad, se llevaría puesto a pc2 — los dos peers cerrados, ninguna
    // answer mandada, y el escáner reintentando contra una cámara que se
    // suicida en cada intento. Tile permanentemente muerto.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const realSetParameters = FakeRTCRtpSender.prototype.setParameters;
    let liberarPrimera = () => {};
    const primeraSuspendida = new Promise<void>((resolve) => {
      liberarPrimera = resolve;
    });
    let llamadas = 0;
    const spy = jest
      .spyOn(FakeRTCRtpSender.prototype, 'setParameters')
      .mockImplementation(async function (
        this: FakeRTCRtpSender,
        p: Parameters<typeof realSetParameters>[0]
      ) {
        llamadas += 1;
        // Solo la primera negociación queda colgada: es la que tiene que
        // reanudar tarde, después de que la segunda ya se registró.
        if (llamadas === 1) await primeraSuspendida;
        return realSetParameters.call(this, p);
      });

    const { channel } = montar(fakeStream(fakeTrack()));

    channel.emit(SENAL_EVENT, OFERTA);
    await waitFor(() => expect(llamadas).toBe(1));
    const pc1 = ultimoPeer();

    // La oferta 2 entra con pc1 todavía suspendido.
    channel.emit(SENAL_EVENT, OFERTA);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(2));
    const pc2 = ultimoPeer();
    expect(pc2).not.toBe(pc1);
    expect(pc1.cerrada).toBe(true);

    // pc1 reanuda y explota contra su propio peer cerrado.
    liberarPrimera();
    await waitFor(() => expect(warnSpy).toHaveBeenCalled());

    // Lo que importa: pc2 sigue vivo y SÍ contesta.
    expect(pc2.cerrada).toBe(false);
    pc2.completarIce();
    await waitFor(() =>
      expect(cuerposEnviados()).toContainEqual({
        destino_device_id: 'dev-esc-01',
        tipo: 'answer',
        sdp: 'SDP-ANSWER',
      })
    );
    expect(pc2.cerrada).toBe(false);

    spy.mockRestore();
    warnSpy.mockRestore();
  });

  it('la ICE del peer viejo cayéndose no cierra al peer que lo reemplazó', async () => {
    // El otro lugar con el mismo defecto que el catch: el handler de
    // `iceconnectionstatechange` de una negociación ya reemplazada sigue
    // bindeado y se dispara igual. Si cerrara por clave, el estertor del
    // peer viejo mataría al nuevo.
    const { channel } = montar(fakeStream(fakeTrack()));
    channel.emit(SENAL_EVENT, OFERTA);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc1 = ultimoPeer();

    channel.emit(SENAL_EVENT, OFERTA);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(2));
    const pc2 = ultimoPeer();
    expect(pc1.cerrada).toBe(true);

    pc1.cambiarIce('failed');

    expect(pc2.cerrada).toBe(false);
    pc2.completarIce();
    await waitFor(() =>
      expect(cuerposEnviados()).toContainEqual({
        destino_device_id: 'dev-esc-01',
        tipo: 'answer',
        sdp: 'SDP-ANSWER',
      })
    );
  });

  it('REGLA CRÍTICA: si la cámara se rearma, el visor no se queda con un frame congelado', async () => {
    // `useKioskRecorder.armar()` detiene los tracks viejos. El peer queda
    // abierto con un sender cuyo track está muerto y ICE NO se cae, así que
    // sin este corte el escáner conserva "viendo" y muestra un frame
    // congelado para siempre — un monitor que miente, que es peor que uno
    // que dice "Sin transmisión".
    const track = fakeTrack();
    const { channel } = montar(fakeStream(track));
    channel.emit(SENAL_EVENT, OFERTA);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc = ultimoPeer();
    pc.completarIce();
    await waitFor(() =>
      expect(cuerposEnviados()).toContainEqual({
        destino_device_id: 'dev-esc-01',
        tipo: 'answer',
        sdp: 'SDP-ANSWER',
      })
    );

    track.terminar();

    expect(pc.cerrada).toBe(true);
    await waitFor(() =>
      expect(cuerposEnviados()).toContainEqual({
        destino_device_id: 'dev-esc-01',
        tipo: 'bye',
        sdp: '',
      })
    );
  });

  it('descarta las ofertas dirigidas a otra cámara', () => {
    const { channel } = montar(fakeStream(fakeTrack()));

    channel.emit(SENAL_EVENT, { ...OFERTA, destino_device_id: 'dev-cam-99' });

    expect(FakeRTCPeerConnection.instances).toHaveLength(0);
  });

  it('sobrevive al fake de WebKit: muta en el lugar, no reemplaza el array de encodings', async () => {
    // El fake ahora imita el `InvalidModificationError` real de WebKit (ver
    // doc-comment de `FakeRTCRtpSender.setParameters`): si `limitarSender`
    // alguna vez volviera a reemplazar `encodings` en vez de mutarlo, esta
    // llamada tiraría, `responder()` caería en el `.catch` de `alRecibir`,
    // el peer se cerraría y nunca saldría una `answer`. Por eso alcanza con
    // comprobar que la negociación llega a buen puerto y que no se logueó
    // nada por el `console.warn` del catch-all.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { channel } = montar(fakeStream(fakeTrack(1920, 1080)));

    channel.emit(SENAL_EVENT, OFERTA);

    await waitFor(() => expect(ultimoPeer().senders).toHaveLength(1));
    const pc = ultimoPeer();
    pc.completarIce();

    await waitFor(() => {
      const cuerpos = (global.fetch as jest.Mock).mock.calls.map((c) => JSON.parse(c[1].body));
      expect(cuerpos).toContainEqual({
        destino_device_id: 'dev-esc-01',
        tipo: 'answer',
        sdp: 'SDP-ANSWER',
      });
    });
    expect(pc.cerrada).toBe(false);
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('si el escáner se va mientras se junta ICE, la answer tardía no se manda', async () => {
    // Cubre el guard de `responder()` después de `esperarIceCompleto`: "El
    // escáner pudo haberse ido mientras juntábamos candidatos." El gathering
    // de ICE no está atado al cierre del peer, así que puede terminar
    // DESPUÉS de que el `bye` ya lo cerró — sin el guard, se mandaría una
    // `answer` para una negociación que ya nadie espera.
    const { channel } = montar(fakeStream(fakeTrack()));
    channel.emit(SENAL_EVENT, OFERTA);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc = ultimoPeer();

    channel.emit(SENAL_EVENT, { ...OFERTA, tipo: 'bye', sdp: '' });
    expect(pc.cerrada).toBe(true);

    // El gathering, que ya estaba en curso, termina recién ahora.
    pc.completarIce();
    await new Promise((resolve) => setTimeout(resolve, 10));

    const cuerpos = (global.fetch as jest.Mock).mock.calls.map((c) => JSON.parse(c[1].body));
    expect(cuerpos).not.toContainEqual(expect.objectContaining({ tipo: 'answer' }));
  });
});
