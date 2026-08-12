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
  onerror: ((e: Event) => void) | null = null;

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

  // Revisión de F2: tres defectos Critical encontrados ejecutando probes
  // sobre el hook, no leyéndolo. Los cinco tests de acá abajo son esos
  // probes convertidos en regresión permanente.

  it('C1 — REGRESIÓN: dos grabar() en el mismo tick no crean dos MediaRecorder ni contaminan el blob', async () => {
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });

    // Ambas llamadas ven el mismo `estado` capturado en el closure (no hubo
    // re-render entre medio) — con la guardia vieja (`estado !== 'armada'`)
    // esto creaba DOS MediaRecorder sobre el mismo stream: el primero
    // quedaba huérfano (nadie lo detiene nunca) y, al compartir `chunksRef`,
    // sus datos se mezclaban con los de la grabación "buena". Hoy la UI no
    // lo dispara así (React repinta entre clicks), pero F3 llama grabar()
    // desde un handler de Pusher, donde dos entregas en el mismo tick sí se
    // batchean — y Pusher entrega duplicados al reconectar.
    act(() => {
      result.current.grabar();
      result.current.grabar();
    });

    expect(FakeMediaRecorder.instances).toHaveLength(1);

    let resultado: { blob: Blob; mimeType: string; duracionMs: number } | undefined;
    await act(async () => {
      resultado = await result.current.detener();
    });

    // El único recorder que existió puso un solo chunk ('x', 1 byte) — sin
    // contaminación de un segundo recorder huérfano escribiendo al mismo
    // array. Con el bug viejo, el `chunksRef` compartido habría acumulado
    // chunks de ambos recorders y el blob final pesaría más.
    expect(resultado!.blob.size).toBe(1);
  });

  it('C2 — REGRESIÓN: armar() tras una "caida" detiene el recorder viejo y libera el stream viejo antes de pedir uno nuevo', async () => {
    const streams: Array<{ video: FakeMediaStreamTrack; audio: FakeMediaStreamTrack }> = [];
    // Override local: cada getUserMedia() da tracks NUEVOS (el fake global
    // del beforeEach reusa los mismos objetos entre llamadas, lo cual acá
    // ocultaría el bug — necesitamos poder distinguir "el stream viejo" del
    // "stream nuevo" por identidad).
    getUserMedia.mockImplementation(() => {
      const video = new FakeMediaStreamTrack('video');
      const audio = new FakeMediaStreamTrack('audio');
      streams.push({ video, audio });
      return Promise.resolve(new FakeMediaStream([video, audio]));
    });

    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    act(() => {
      result.current.grabar();
    });

    const recorderViejo = FakeMediaRecorder.instances[0];
    const streamViejo = streams[0];

    // Llamada entrante a mitad de la grabación: el track de VIDEO muere y
    // dispara "caida", pero (como en la realidad) el de AUDIO del mismo
    // stream sigue "live" — nadie lo tocó todavía.
    act(() => {
      streamViejo.video.simulateEnded();
    });
    expect(result.current.estado).toBe('caida');
    expect(recorderViejo.state).toBe('recording');
    expect(streamViejo.audio.readyState).toBe('live');

    await act(async () => {
      await result.current.armar();
    });

    // El rearme detuvo el recorder viejo (ya no queda huérfano en
    // 'recording' para siempre) y liberó el track de audio que seguía vivo
    // — sin esto, medido: una sesión de captura fantasma sigue viva por
    // cada caída, y el próximo blob se arma intercalando chunks de los dos
    // streams (evidencia corrupta, un WebM que no reproduce).
    expect(recorderViejo.state).toBe('inactive');
    expect(streamViejo.audio.stop).toHaveBeenCalled();
    expect(result.current.estado).toBe('armada');
    expect(streams).toHaveLength(2);
    expect(getUserMedia).toHaveBeenCalledTimes(2);
  });

  it('C3a — REGRESIÓN: detener() con la camara ya "caida" no la vuelve a poner "armada"', async () => {
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    act(() => {
      result.current.grabar();
    });

    act(() => {
      videoTrack.simulateEnded(); // "caida" a mitad de la grabación
    });
    expect(result.current.estado).toBe('caida');

    // El `MediaRecorder` real puede terminar de encodear igual aunque la
    // cámara ya esté muerta — `detener()` puede seguir resolviendo. Lo que
    // NO puede pasar es que el estado vuelva a "armada": eso deja al
    // teléfono en la pared mostrando "ARMADA" en tipografía enorme sobre un
    // preview congelado, con la cámara muerta — la próxima orden no graba
    // nada y recién se descubre en F4 por un video ausente.
    await act(async () => {
      await result.current.detener();
    });

    expect(result.current.estado).toBe('caida');
  });

  it('C3b — REGRESIÓN: si el encoder nunca dispara onstop/onerror, detener() rechaza por timeout en vez de quedar colgada', async () => {
    jest.useFakeTimers();
    try {
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });
      act(() => {
        result.current.grabar();
      });

      // Encoder trabado: `stop()` no dispara ni `ondataavailable` ni
      // `onstop` ni `onerror`. Sin timeout, la promesa de `detener()` queda
      // colgada para siempre — y F4 la va a esperar para subir el video.
      const recorder = FakeMediaRecorder.instances[0];
      recorder.stop = jest.fn();

      let detenerPromise!: Promise<unknown>;
      act(() => {
        detenerPromise = result.current.detener();
      });
      // El handler se engancha ANTES de avanzar los timers, para no generar
      // un "unhandled rejection" real mientras se dispara el timeout.
      const assertion = expect(detenerPromise).rejects.toThrow(/no terminó a tiempo/i);

      act(() => {
        jest.advanceTimersByTime(10_000);
      });

      await assertion;
    } finally {
      jest.useRealTimers();
    }
  });

  it('I4 — REGRESIÓN: un error del encoder A MITAD de la grabación saca a la UI de "grabando" en vez de dejarla clavada', async () => {
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    act(() => {
      result.current.grabar();
    });
    expect(result.current.estado).toBe('grabando');

    const recorder = FakeMediaRecorder.instances[0];
    // Nadie llamó a detener() todavía: esto simula un fallo espontáneo del
    // encoder. Antes de este fix, la única salida era recargar la página —
    // inaceptable en un teléfono atornillado a una pared.
    act(() => {
      recorder.onerror?.(new Event('error'));
    });

    expect(result.current.estado).toBe('armada');
  });

  it('I6 — REGRESIÓN: al desmontar con una grabación activa, detiene el encoder pero NO el stream', async () => {
    const { result, unmount } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    act(() => {
      result.current.grabar();
    });

    const recorder = FakeMediaRecorder.instances[0];
    expect(recorder.state).toBe('recording');

    unmount();

    // El encoder no puede seguir corriendo — escribiría chunks en el
    // closure de un hook que ya nadie puede leer, trabajo de CPU/batería
    // tirado y un blob que nunca se sube.
    expect(recorder.state).toBe('inactive');
    // Pero el STREAM sí sobrevive — esa es la regla 1, y desmontar el
    // componente de React no es el gesto humano que la justifica romper.
    expect(videoTrack.stop).not.toHaveBeenCalled();
    expect(audioTrack.stop).not.toHaveBeenCalled();
  });
});
