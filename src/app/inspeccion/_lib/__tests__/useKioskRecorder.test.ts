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

  /** Capacidades de zoom del "hardware". `null` simula un dispositivo que no
   * expone zoom — una webcam de laptop, el caso más común en desarrollo. */
  zoomCapability: { min: number; max: number; step: number } | null = null;
  appliedConstraints: MediaTrackConstraints[] = [];
  /** Hace fallar `applyConstraints`, como cuando el valor queda fuera de rango
   * o el track ya terminó. */
  applyConstraintsFalla = false;

  getCapabilities() {
    return this.zoomCapability ? { zoom: this.zoomCapability } : {};
  }

  /** Lo que la cámara entrega DE VERDAD. Es lo que manda el bitrate — y lo
   * que en producción salió distinto de lo pedido en los tres videos
   * medidos (1280×1280, 1058×1280, 720×1280 pidiendo 1280). */
  resolucion: { width?: number; height?: number; frameRate?: number } | null = {
    width: 1920,
    height: 1920,
    frameRate: 30,
  };

  getSettings() {
    return {
      ...(this.resolucion ?? {}),
      ...(this.zoomCapability ? { zoom: this.zoomCapability.min } : {}),
    };
  }

  applyConstraints(c: MediaTrackConstraints) {
    if (this.applyConstraintsFalla) return Promise.reject(new Error('OverconstrainedError'));
    this.appliedConstraints.push(c);
    return Promise.resolve();
  }

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

  describe('calidad de la grabación', () => {
    it('pide 1920 de lado como "ideal" — el techo viejo de 1280 hacía ilegible una etiqueta', async () => {
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });

      const constraints = getUserMedia.mock.calls[0][0].video;
      expect(constraints.width).toEqual({ ideal: 1920 });
      expect(constraints.height).toEqual({ ideal: 1920 });
    });

    it('deriva el bitrate de la resolución REAL, no de la pedida', async () => {
      // La cámara degrada a 720×1280 — pasó en producción pidiendo 1280.
      videoTrack.resolucion = { width: 720, height: 1280, frameRate: 30 };
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });

      // 720*1280*30*0.12 = 3.32 Mbps, no los 8 que corresponderían a 1920².
      expect(result.current.ajustes).toEqual({
        ancho: 720,
        alto: 1280,
        fps: 30,
        bitrate: 3_317_760,
      });

      act(() => {
        result.current.grabar();
      });
      expect(FakeMediaRecorder.instances[0].options?.videoBitsPerSecond).toBe(3_317_760);
    });

    it('sube el bitrate muy por encima de los 2 Mbps viejos cuando la cámara da resolución', async () => {
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });
      act(() => {
        result.current.grabar();
      });

      // 1920² a 30 fps pide 13.3 Mbps: se recorta al techo de 8, que es lo que
      // paga la subida por equipo. Lo que importa del test: nunca vuelve a 2.
      const bitrate = FakeMediaRecorder.instances[0].options?.videoBitsPerSecond ?? 0;
      expect(bitrate).toBe(8_000_000);
      expect(bitrate).toBeGreaterThan(2_000_000);
    });

    it('sin resolución informada usa el fallback y graba igual', async () => {
      videoTrack.resolucion = null;
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });

      expect(result.current.estado).toBe('armada');
      expect(result.current.ajustes).toEqual({
        ancho: null,
        alto: null,
        fps: null,
        bitrate: 6_000_000,
      });
    });

    it('respeta el piso: una cámara pobre no baja de 2.5 Mbps', async () => {
      videoTrack.resolucion = { width: 640, height: 480, frameRate: 15 };
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });
      // 640*480*15*0.12 = 553 kbps → se levanta al piso.
      expect(result.current.ajustes?.bitrate).toBe(2_500_000);
    });
  });

  describe('encuadre y zoom', () => {
    it('pide la relación de aspecto 1:1 como "ideal", nunca "exact"', async () => {
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });

      const constraints = getUserMedia.mock.calls[0][0].video;
      expect(constraints.aspectRatio).toEqual({ ideal: 1 });
      // Cuadrado: alto y ancho salen del mismo número.
      expect(constraints.height.ideal).toBe(constraints.width.ideal);
      // Con `exact`, un dispositivo que no soporte esa relación falla el
      // getUserMedia entero y la cámara queda SIN ARMAR. Degradar el encuadre
      // es aceptable; no poder grabar, no.
      expect(constraints.aspectRatio.exact).toBeUndefined();
    });

    it('sin zoom en el hardware no expone rango — el control no se muestra', async () => {
      videoTrack.zoomCapability = null;
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });
      expect(result.current.zoomRango).toBeNull();
    });

    it('lee el rango real del hardware al armar', async () => {
      videoTrack.zoomCapability = { min: 1, max: 8, step: 0.5 };
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });
      expect(result.current.zoomRango).toEqual({ min: 1, max: 8, step: 0.5 });
      expect(result.current.zoom).toBe(1);
    });

    it('el zoom va al SENSOR con applyConstraints, no a un scale del preview', async () => {
      videoTrack.zoomCapability = { min: 1, max: 8, step: 0.5 };
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });

      await act(async () => {
        await result.current.aplicarZoom(3);
      });

      // Esta es la diferencia que importa: `applyConstraints` cambia lo que el
      // sensor entrega, así que el acercamiento QUEDA EN EL VIDEO. Un
      // `transform: scale()` se vería igual en pantalla y subiría la toma
      // lejos — la etiqueta seguiría ilegible en la evidencia.
      expect(videoTrack.appliedConstraints).toEqual([{ advanced: [{ zoom: 3 }] }]);
      expect(result.current.zoom).toBe(3);
    });

    it('acota el valor al rango en vez de mandar algo que el hardware rechace', async () => {
      videoTrack.zoomCapability = { min: 1, max: 4, step: 0.5 };
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });

      await act(async () => {
        await result.current.aplicarZoom(99);
      });
      expect(result.current.zoom).toBe(4);

      await act(async () => {
        await result.current.aplicarZoom(-5);
      });
      expect(result.current.zoom).toBe(1);
    });

    it('si `advanced` falla, reintenta con la forma plana antes de rendirse', async () => {
      // Algunas implementaciones aceptan `{zoom}` en el nivel superior y no
      // dentro de `advanced`. Sin este segundo intento, el slider se movía y
      // volvía solo en esos dispositivos.
      videoTrack.zoomCapability = { min: 1, max: 8, step: 0.5 };
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });

      let primeraLlamada = true;
      videoTrack.applyConstraints = (c: MediaTrackConstraints) => {
        if (primeraLlamada) {
          primeraLlamada = false;
          return Promise.reject(new Error('OverconstrainedError'));
        }
        videoTrack.appliedConstraints.push(c);
        return Promise.resolve();
      };

      await act(async () => {
        await result.current.aplicarZoom(3);
      });

      expect(result.current.zoom).toBe(3);
      expect(result.current.zoomError).toBeNull();
      expect(videoTrack.appliedConstraints).toEqual([{ zoom: 3 }]);
    });

    it('si el hardware rechaza las dos formas, lo AVISA en vez de callarse', async () => {
      videoTrack.zoomCapability = { min: 1, max: 8, step: 0.5 };
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });

      videoTrack.applyConstraintsFalla = true;
      await act(async () => {
        await result.current.aplicarZoom(5);
      });

      // Un control que no responde y tampoco explica por qué se lee como que
      // la app está colgada, y el operador lo sigue arrastrando.
      expect(result.current.zoomError).toMatch(/no acepta el zoom/i);
    });

    it('si applyConstraints falla, el zoom mostrado NO se mueve', async () => {
      videoTrack.zoomCapability = { min: 1, max: 8, step: 0.5 };
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });

      videoTrack.applyConstraintsFalla = true;
      await act(async () => {
        await result.current.aplicarZoom(5);
      });

      // Mostrar un zoom que la cámara no aplicó es peor que no moverlo: el
      // operador cree que encuadró el detalle y graba el equipo entero.
      expect(result.current.zoom).toBe(1);
    });

    it('se puede cambiar el zoom MIENTRAS graba, sin cortar la toma', async () => {
      videoTrack.zoomCapability = { min: 1, max: 8, step: 0.5 };
      const { result } = renderHook(() => useKioskRecorder());
      await act(async () => {
        await result.current.armar();
      });
      act(() => {
        result.current.grabar();
      });

      await act(async () => {
        await result.current.aplicarZoom(2.5);
      });

      // Acercarse a un detalle sin cortar es el caso normal de una inspección
      // — y es lo que hace útil el video como evidencia de un rayón puntual.
      expect(result.current.estado).toBe('grabando');
      expect(FakeMediaRecorder.instances[0].state).toBe('recording');
      expect(result.current.zoom).toBe(2.5);
    });
  });
});

describe('useKioskRecorder — capturarFoto()', () => {
  let drawImage: jest.Mock;
  let takePhoto: jest.Mock;
  /** Los canvas que el hook creó, en orden: primero la miniatura, después la
   * foto. Sirven para mirar el TAMAÑO con el que salió cada imagen. */
  let canvases: HTMLCanvasElement[];
  /** Lo que devuelve `createImageBitmap` sobre la foto del sensor. */
  let bitmap: { width: number; height: number; close: jest.Mock };

  /** Elemento de video "vivo": lo que el canvas dibuja. En la vista real lo
   * monta `CamaraPageContent`; acá se ata al ref a mano. */
  function atarVideo(
    result: { current: { videoRef: { current: unknown } } },
    videoWidth = 1920,
    videoHeight = 1920
  ) {
    result.current.videoRef.current = {
      videoWidth,
      videoHeight,
    } as unknown as HTMLVideoElement;
  }

  beforeEach(() => {
    drawImage = jest.fn();
    canvases = [];
    Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: jest.fn(function (this: HTMLCanvasElement) {
        canvases.push(this);
        return { drawImage };
      }),
    });
    Object.defineProperty(window.HTMLCanvasElement.prototype, 'toBlob', {
      configurable: true,
      value: jest.fn((cb: (b: Blob) => void, type?: string) => {
        cb(new Blob(['img'], { type: type ?? 'image/jpeg' }));
      }),
    });

    takePhoto = jest.fn().mockResolvedValue(new Blob(['sensor'], { type: 'image/jpeg' }));
    (global as unknown as { ImageCapture: unknown }).ImageCapture = jest
      .fn()
      .mockImplementation(() => ({ takePhoto }));
    bitmap = { width: 3024, height: 3024, close: jest.fn() };
    (global as unknown as { createImageBitmap: unknown }).createImageBitmap = jest
      .fn()
      .mockImplementation(() => Promise.resolve(bitmap));
  });

  afterEach(() => {
    delete (global as unknown as { createImageBitmap?: unknown }).createImageBitmap;
  });

  it('mientras GRABA saca la foto del canvas, sin tocar el MediaRecorder', async () => {
    // Es la regla que protege la evidencia: `ImageCapture.takePhoto()`
    // reconfigura el track y glitchea el video que se esta grabando — y ese
    // video no se puede volver a grabar.
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    atarVideo(result as never);
    act(() => {
      result.current.grabar();
    });
    const recorder = FakeMediaRecorder.instances.at(-1)!;

    let foto!: { blob: Blob; thumbBlob: Blob };
    await act(async () => {
      foto = await result.current.capturarFoto();
    });

    expect(takePhoto).not.toHaveBeenCalled();
    expect(drawImage).toHaveBeenCalled();
    expect(foto.blob.size).toBeGreaterThan(0);
    expect(foto.thumbBlob.size).toBeGreaterThan(0);
    // El video sigue grabando: sacar una foto no detiene la toma.
    expect(recorder.state).toBe('recording');
    expect(recorder.stop).not.toHaveBeenCalled();
    expect(result.current.estado).toBe('grabando');
  });

  it('en modo foto (ARMADA) usa el sensor a resolucion plena', async () => {
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    atarVideo(result as never);

    let foto!: { blob: Blob };
    await act(async () => {
      foto = await result.current.capturarFoto();
    });

    expect(takePhoto).toHaveBeenCalled();
    expect(foto.blob.size).toBeGreaterThan(0);
  });

  it('recorta la foto del canvas a 1:1 aunque la camara entregue un cuadro alargado', async () => {
    // El preview es cuadrado (`aspectRatio: 1/1` en la vista), pero la camara
    // NO garantiza 1:1 — en produccion salieron 1058×1280 y 720×1280 pidiendo
    // el cuadrado. Sin recorte, lo que se subia tenia otra forma que lo que el
    // operador vio al encuadrar.
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    atarVideo(result as never, 1058, 1280);
    act(() => {
      result.current.grabar();
    });

    let foto!: { blob: Blob; ancho: number; alto: number };
    await act(async () => {
      foto = await result.current.capturarFoto();
    });

    // Primero la miniatura, despues la foto: las dos cuadradas.
    const [canvasThumb, canvasFoto] = canvases;
    expect(canvasThumb.width).toBe(canvasThumb.height);
    expect(canvasFoto.width).toBe(1058);
    expect(canvasFoto.height).toBe(1058);
    // Recorte CENTRADO: se descartan 111px arriba y 111px abajo.
    expect(drawImage).toHaveBeenLastCalledWith(
      result.current.videoRef.current,
      0,
      111,
      1058,
      1058,
      0,
      0,
      1058,
      1058
    );
    expect(foto.ancho).toBe(1058);
    expect(foto.alto).toBe(1058);
  });

  it('recorta a 1:1 la foto del sensor, que llega en el formato de la camara', async () => {
    // `ImageCapture.takePhoto()` da el sensor completo (4:3 tipico), no el
    // encuadre del preview: sin recortar, la foto de "modo foto" se subia
    // apaisada mientras la de "modo video" salia cuadrada.
    bitmap = { width: 4032, height: 3024, close: jest.fn() };
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    atarVideo(result as never);

    let foto!: { blob: Blob; ancho: number; alto: number };
    await act(async () => {
      foto = await result.current.capturarFoto();
    });

    expect(takePhoto).toHaveBeenCalled();
    const canvasFoto = canvases.at(-1)!;
    expect(canvasFoto.width).toBe(3024);
    expect(canvasFoto.height).toBe(3024);
    expect(drawImage).toHaveBeenLastCalledWith(bitmap, 504, 0, 3024, 3024, 0, 0, 3024, 3024);
    expect(foto.ancho).toBe(3024);
    expect(foto.alto).toBe(3024);
    // El bitmap decodificado ocupa memoria hasta que se cierra, y en un
    // kiosco que saca fotos todo el dia eso se acumula.
    expect(bitmap.close).toHaveBeenCalled();
  });

  it('si no se puede recortar la foto del sensor, cae al canvas (que ya es cuadrado)', async () => {
    // iOS Safari viejo no trae `createImageBitmap`. Antes que subir una foto
    // con otra forma que la del encuadre, se prefiere la del canvas.
    delete (global as unknown as { createImageBitmap?: unknown }).createImageBitmap;
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    atarVideo(result as never, 1058, 1280);

    let foto!: { blob: Blob; ancho: number; alto: number };
    await act(async () => {
      foto = await result.current.capturarFoto();
    });

    expect(takePhoto).toHaveBeenCalled();
    expect(canvases.at(-1)!.width).toBe(1058);
    expect(canvases.at(-1)!.height).toBe(1058);
    expect(foto.ancho).toBe(1058);
    expect(foto.alto).toBe(1058);
  });

  it('si el sensor falla, la foto sale igual por canvas', async () => {
    // iOS Safari no tiene `ImageCapture`, y en Android puede rechazar. Una
    // foto degradada es aceptable; quedarse sin foto no.
    takePhoto.mockRejectedValue(new Error('NotSupportedError'));
    const { result } = renderHook(() => useKioskRecorder());
    await act(async () => {
      await result.current.armar();
    });
    atarVideo(result as never);

    let foto!: { blob: Blob };
    await act(async () => {
      foto = await result.current.capturarFoto();
    });

    expect(drawImage).toHaveBeenCalled();
    expect(foto.blob.size).toBeGreaterThan(0);
    expect(result.current.estado).toBe('armada');
  });
});
