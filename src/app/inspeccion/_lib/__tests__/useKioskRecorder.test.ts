/**
 * `useKioskRecorder` — hook de captura de la cámara de estación (kiosco).
 *
 * jsdom no trae `getUserMedia` ni `MediaRecorder`: se stubean acá con fakes
 * mínimos que dan control manual sobre cuándo "termina" una grabación
 * (`ondataavailable` + `onstop`) y sobre el evento `ended` de un track, para
 * poder simular una llamada entrante / otra app tomando la cámara.
 *
 * El test más importante de todos es el de "no llama a track.stop()": es la
 * regla que hace funcionar el rearme automático (spec §7) y es invisible en
 * cualquier prueba manual corta — solo se nota horas después, cuando el
 * teléfono empieza a pedir el permiso de nuevo en cada equipo.
 */
import { renderHook, act } from '@testing-library/react';
import { useKioskRecorder } from '../useKioskRecorder';

class FakeMediaStreamTrack extends EventTarget {
  readyState: 'live' | 'ended' = 'live';
  stop = jest.fn(() => {
    this.readyState = 'ended';
  });

  constructor(public kind: 'video' | 'audio') {
    super();
  }

  simulateEnded() {
    this.readyState = 'ended';
    this.dispatchEvent(new Event('ended'));
  }
}

class FakeMediaStream {
  private tracks: FakeMediaStreamTrack[];

  constructor(tracks: FakeMediaStreamTrack[]) {
    this.tracks = tracks;
  }

  getTracks() {
    return this.tracks;
  }

  getVideoTracks() {
    return this.tracks.filter((t) => t.kind === 'video');
  }

  getAudioTracks() {
    return this.tracks.filter((t) => t.kind === 'audio');
  }
}

class FakeMediaRecorder extends EventTarget {
  static instances: FakeMediaRecorder[] = [];
  static isTypeSupported = jest.fn(
    (type: string) => type === 'video/webm;codecs=vp9,opus' || type === 'video/webm'
  );

  state: 'inactive' | 'recording' = 'inactive';
  mimeType: string;
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor(
    public stream: FakeMediaStream,
    public options?: MediaRecorderOptions
  ) {
    super();
    this.mimeType = options?.mimeType ?? '';
    FakeMediaRecorder.instances.push(this);
  }

  start = jest.fn(() => {
    this.state = 'recording';
  });

  /** Simula el ciclo real: `stop()` dispara `ondataavailable` con el último
   * chunk y DESPUÉS `onstop`, tal cual hace el `MediaRecorder` real. */
  stop = jest.fn(() => {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['x'], { type: this.mimeType || 'video/webm' }) });
    this.onstop?.();
  });
}

let getUserMedia: jest.Mock;
let videoTrack: FakeMediaStreamTrack;
let audioTrack: FakeMediaStreamTrack;
let lastStream: FakeMediaStream;

beforeEach(() => {
  jest.clearAllMocks();
  FakeMediaRecorder.instances = [];

  videoTrack = new FakeMediaStreamTrack('video');
  audioTrack = new FakeMediaStreamTrack('audio');

  getUserMedia = jest.fn().mockImplementation(() => {
    lastStream = new FakeMediaStream([videoTrack, audioTrack]);
    return Promise.resolve(lastStream);
  });

  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });

  (global as unknown as { MediaRecorder: unknown }).MediaRecorder = FakeMediaRecorder;

  // jsdom no implementa `HTMLMediaElement.play`.
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: jest.fn().mockResolvedValue(undefined),
  });
});

describe('useKioskRecorder', () => {
  it('armar() pide getUserMedia una sola vez y pasa a "armada"', async () => {
    const { result } = renderHook(() => useKioskRecorder());

    expect(result.current.estado).toBe('inactiva');

    await act(async () => {
      await result.current.armar();
    });

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(result.current.estado).toBe('armada');
    expect(result.current.error).toBeNull();
  });

  it('negocia el mimeType con isTypeSupported y lo expone en el retorno', async () => {
    const { result } = renderHook(() => useKioskRecorder());

    await act(async () => {
      await result.current.armar();
    });

    // El fake solo soporta variantes de WebM: nunca debe caer en
    // 'video/mp4' — asumirlo rompería Chrome (regla 3 del hook).
    expect(result.current.mimeType).toBe('video/webm;codecs=vp9,opus');
    expect(FakeMediaRecorder.isTypeSupported).toHaveBeenCalled();
  });

  it('grabar() pasa a "grabando" y crea un MediaRecorder nuevo sobre el stream ya armado', async () => {
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });

    act(() => {
      result.current.grabar();
    });

    expect(result.current.estado).toBe('grabando');
    expect(FakeMediaRecorder.instances).toHaveLength(1);
    expect(FakeMediaRecorder.instances[0].stream).toBe(lastStream);
    expect(FakeMediaRecorder.instances[0].start).toHaveBeenCalled();
  });

  it('detener() devuelve un blob con el mimeType negociado y vuelve a "armada", NO a "inactiva"', async () => {
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    act(() => {
      result.current.grabar();
    });

    let resultado: { blob: Blob; mimeType: string; duracionMs: number } | undefined;
    await act(async () => {
      resultado = await result.current.detener();
    });

    expect(resultado?.blob).toBeInstanceOf(Blob);
    expect(resultado?.mimeType).toBe('video/webm;codecs=vp9,opus');
    expect(typeof resultado?.duracionMs).toBe('number');
    expect(result.current.estado).toBe('armada');
  });

  it('REGLA CRÍTICA: detener() nunca llama a track.stop() — el stream sigue vivo para la próxima grabación', async () => {
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    act(() => {
      result.current.grabar();
    });

    await act(async () => {
      await result.current.detener();
    });

    expect(videoTrack.stop).not.toHaveBeenCalled();
    expect(audioTrack.stop).not.toHaveBeenCalled();
    expect(videoTrack.readyState).toBe('live');

    // Y el stream armado sigue siendo el mismo para la siguiente toma: no se
    // vuelve a pedir getUserMedia sin que el operador vuelva a armar.
    act(() => {
      result.current.grabar();
    });
    expect(FakeMediaRecorder.instances).toHaveLength(2);
    expect(FakeMediaRecorder.instances[1].stream).toBe(lastStream);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('se pueden encadenar varias grabaciones seguidas sin volver a armar', async () => {
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });

    for (let i = 0; i < 3; i += 1) {
      act(() => {
        result.current.grabar();
      });
      expect(result.current.estado).toBe('grabando');
      await act(async () => {
        await result.current.detener();
      });
      expect(result.current.estado).toBe('armada');
    }

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(FakeMediaRecorder.instances).toHaveLength(3);
  });

  it('un track.ended externo (llamada entrante, otra app con la cámara) lleva a "caida"', async () => {
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });

    act(() => {
      videoTrack.simulateEnded();
    });

    expect(result.current.estado).toBe('caida');
  });

  it('track.ended también lleva a "caida" mientras está grabando', async () => {
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    act(() => {
      result.current.grabar();
    });

    act(() => {
      videoTrack.simulateEnded();
    });

    expect(result.current.estado).toBe('caida');
  });

  it('si getUserMedia rechaza, queda "inactiva" con el mensaje de error', async () => {
    getUserMedia.mockRejectedValueOnce(Object.assign(new Error('Permiso denegado'), { name: 'NotAllowedError' }));
    const { result } = renderHook(() => useKioskRecorder());

    await act(async () => {
      await result.current.armar();
    });

    expect(result.current.estado).toBe('inactiva');
    expect(result.current.error).toBe('Permiso denegado');
  });
});
