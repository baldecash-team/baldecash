'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Hook de captura de una CÁMARA de estación de inspección (kiosco).
 *
 * Deliberadamente NO es `useRecorder.ts` (admisión, `prototipos/0.6`): ese
 * hook sirve a una persona grabando su propio video, que libera la cámara al
 * terminar. Acá el stream lo vive el teléfono durante horas y la grabación
 * la comanda otro dispositivo (el escáner, por Pusher — eso llega en F3).
 * Forzar los dos usos en un solo hook lo vuelve ilegible; ver spec §9.1 y el
 * plan de F2, Task 1.
 *
 * Tres reglas no negociables (spec §7):
 *
 * 1. El stream de `getUserMedia` se pide UNA sola vez, en `armar()`, y nunca
 *    se libera (`track.stop()` no se llama jamás) MIENTRAS LA CÁMARA ESTÁ
 *    ARMADA Y EN USO. Por cada grabación se crea un `MediaRecorder` nuevo
 *    sobre el mismo stream. Liberar el stream fuerza un gesto humano para
 *    rearmar en cada equipo, que es justo lo que este diseño evita.
 *    (La excepción es el REARME desde "caída" — ver el comentario de C2
 *    dentro de `armar()`: ahí el stream viejo ya está muerto, no violar la
 *    regla es justamente lo que exige limpiarlo.)
 * 2. Tras `detener()` el estado vuelve a `armada`, no a `inactiva` — es el
 *    rearme automático: la cámara queda lista para la próxima orden sin que
 *    nadie la toque. Salvo que la cámara haya caído en el medio (ver C3):
 *    ahí "caída" no se pisa con una mentira de "armada".
 * 3. El `mimeType` se negocia con `MediaRecorder.isTypeSupported()`, nunca se
 *    hardcodea. Android/Chrome (plataforma primaria) graba WebM; iOS graba
 *    MP4. Asumir `video/mp4` rompe la grabación en Chrome. El valor negociado
 *    se expone en el retorno: F4 lo necesita para la extensión de la key en
 *    S3 y el `content_type`.
 *
 * Revisión de F2 (C1/C2/C3/I4): tres defectos Critical encontrados
 * ejecutando probes, no leyendo — documentados en cada punto del código
 * donde se corrigieron.
 */
export type EstadoCaptura = 'inactiva' | 'armando' | 'armada' | 'grabando' | 'caida';

export interface ResultadoDetener {
  blob: Blob;
  mimeType: string;
  duracionMs: number;
}

export interface UseKioskRecorderReturn {
  estado: EstadoCaptura;
  error: string | null;
  /** El mimeType negociado en `armar()`, p.ej. `'video/webm;codecs=vp9'`. */
  mimeType: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Pide `getUserMedia`. El único gesto humano de todo el flujo. */
  armar: () => Promise<void>;
  grabar: () => void;
  detener: () => Promise<ResultadoDetener>;
}

/** Cap de calidad, igual criterio que `useRecorder.ts` (admisión): clips
 * livianos y suficientes para validar evidencia, sin tope de 1080p. */
const VIDEO_CONSTRAINTS = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  // La cámara de la estación queda fija mirando el equipo (pared/techo), no
  // a una persona: la trasera es la que sirve. "ideal" degrada en vez de
  // fallar en un desktop de prueba sin cámara trasera.
  facingMode: { ideal: 'environment' },
} as const;
const VIDEO_BITS_PER_SECOND = 2_000_000;

/**
 * C3: cuánto esperar a que `onstop`/`onerror` disparen tras `recorder.stop()`
 * antes de rendirse. Un `MediaRecorder` real flushea en milisegundos; si a
 * los 5s no dijo nada es un encoder trabado, no una encodeada lenta. Sin
 * este timeout, la promesa de `detener()` queda colgada para siempre — y F4
 * la va a esperar para subir el video.
 */
const DETENER_TIMEOUT_MS = 5_000;

/**
 * Candidatos de mimeType en orden de preferencia. WebM primero porque
 * Android/Chrome es la plataforma primaria (spec §7); los MP4 quedan de
 * fallback para iOS/Safari. `null` si ninguno matchea: el `MediaRecorder` se
 * crea sin `mimeType` y el navegador elige — nunca se fuerza un default.
 */
const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4;codecs=h264,aac',
  'video/mp4',
] as const;

function negotiateMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const candidate of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return null;
}

/** Nombres de error de `getUserMedia` que indican un problema puntual del
 * micrófono (no encontrado / en uso / restringido). Mismo criterio que
 * `useRecorder.ts`: se reintenta solo con video para no bloquear el armado
 * por un mic que falta o está ocupado. Bloqueos de permiso o de seguridad se
 * propagan tal cual. */
const MIC_FAILURE_ERROR_NAMES = new Set([
  'NotFoundError',
  'DevicesNotFoundError',
  'NotReadableError',
  'TrackStartError',
  'OverconstrainedError',
  'ConstraintNotSatisfiedError',
]);

/**
 * Una grabación activa: el `MediaRecorder` y SU PROPIO array de chunks,
 * capturado en el closure de `grabar()` — no un ref compartido a nivel de
 * hook. Ver C1: con un `chunksRef` único, dos `MediaRecorder` creados por
 * error terminan escribiendo chunks en el mismo array y el blob final queda
 * contaminado con datos de una grabación huérfana.
 */
interface ActiveRecording {
  recorder: MediaRecorder;
  chunks: Blob[];
}

export function useKioskRecorder(): UseKioskRecorderReturn {
  const [estado, setEstado] = useState<EstadoCaptura>('inactiva');
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRecordingRef = useRef<ActiveRecording | null>(null);
  // Mientras `detener()` está esperando a que termine el `MediaRecorder`
  // activo (`onstop`/`onerror`), guarda acá su callback de resolución. El
  // `onerror` que vive en el recorder desde `grabar()` (necesario para I4:
  // un fallo del encoder A MITAD de una grabación, no solo al detener) lo
  // consulta para no dejar la promesa de `detener()` colgada si el error
  // ocurre justo mientras se está deteniendo.
  const pendingStopRef = useRef<{ recorder: MediaRecorder; finalize: (err?: Error) => void } | null>(
    null
  );
  const startedAtRef = useRef<number>(0);
  const mimeTypeRef = useRef<string | null>(null);

  // Se dispara con un `track.ended` real (llamada entrante, otra app
  // tomando la cámara, Siri) — nunca lo llama este hook. Es la señal de que
  // el stream murió por fuera de nuestro control: pasa a "caída" sea cual
  // sea el estado de captura en ese momento (armada o grabando).
  const onTrackEnded = useCallback(() => {
    setEstado('caida');
  }, []);

  const armar = useCallback(async () => {
    setError(null);
    setEstado('armando');

    // C2 — rearme tras "caída": un `MediaRecorder` viejo puede seguir en
    // `'recording'` y el `stream` viejo puede tener tracks todavía `'live'`
    // (p.ej. entró una llamada a mitad de una grabación: el track de VIDEO
    // murió y disparó "caída", pero el track de AUDIO del mismo stream
    // puede seguir vivo). Sin esta limpieza quedan dos daños medidos: una
    // sesión de captura fantasma consumiendo batería/calor — y en varios
    // Android el siguiente `getUserMedia` empieza a fallar por eso — y
    // evidencia corrupta, porque el próximo blob se arma intercalando
    // chunks de dos streams (un WebM que no reproduce).
    //
    // Esto NO viola la regla 1 del doc-comment del módulo ("nunca
    // `track.stop()` mientras la cámara está armada y en uso"): esa regla
    // protege un stream VIVO y en servicio. Acá el stream ya está muerto
    // (por eso se llegó a "caída") y este `armar()` ES el gesto humano que
    // la regla exige para volver a pedir permiso — no es "entre
    // grabaciones", es un rearme completo. Si alguien "arregla" esto
    // quitando el `track.stop()` de abajo, vuelve el bug de C2.
    const staleRecording = activeRecordingRef.current;
    if (staleRecording) {
      activeRecordingRef.current = null;
      pendingStopRef.current = null;
      try {
        if (staleRecording.recorder.state !== 'inactive') staleRecording.recorder.stop();
      } catch {
        // El recorder puede quedar en un estado raro tras la caída — no hay
        // nada accionable si `stop()` tira acá, ya lo estamos descartando.
      }
    }
    const staleStream = streamRef.current;
    if (staleStream) {
      staleStream.getTracks().forEach((track) => {
        track.removeEventListener('ended', onTrackEnded);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: VIDEO_CONSTRAINTS,
          audio: true,
        });
      } catch (e) {
        const name = (e as { name?: string } | null)?.name ?? '';
        if (MIC_FAILURE_ERROR_NAMES.has(name)) {
          stream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS });
        } else {
          throw e;
        }
      }

      streamRef.current = stream;
      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', onTrackEnded);
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play?.().catch(() => {});
      }

      const negotiated = negotiateMimeType();
      mimeTypeRef.current = negotiated;
      setMimeType(negotiated);
      setEstado('armada');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo acceder a la cámara.';
      setError(message);
      setEstado('inactiva');
    }
  }, [onTrackEnded]);

  const grabar = useCallback(() => {
    const stream = streamRef.current;
    // C1 — guardia por REF, no por `estado` capturado en el closure: dos
    // llamadas a `grabar()` en el mismo tick (batch de React, sin re-render
    // entre medio) ven el MISMO `estado` capturado — ambas pasaban el
    // chequeo viejo (`estado !== 'armada'`) y creaban dos `MediaRecorder`
    // sobre el mismo stream. El primero quedaba huérfano (nadie lo detiene
    // nunca) y, en la versión vieja de este hook, sus chunks caían en un
    // `chunksRef` compartido a nivel de hook — contaminando el blob de la
    // grabación buena. Medido: 2 recorders creados, blob de 11 bytes en vez
    // de 3 limpios.
    //
    // Hoy la UI no lo dispara (React repinta entre clicks) pero F3 va a
    // llamar `grabar()` desde un handler de Pusher, donde dos entregas en
    // el mismo tick sí se batchean — y Pusher entrega duplicados al
    // reconectar. `activeRecordingRef` se muta SINCRÓNICAMENTE más abajo,
    // así que la segunda llamada en el mismo tick ya lo ve seteado.
    if (!stream || activeRecordingRef.current) return;

    // Chunks propios de ESTA grabación, capturados en el closure de
    // `ondataavailable` — no un ref a nivel de hook. Ver interfaz
    // `ActiveRecording` arriba.
    const chunks: Blob[] = [];
    const options: MediaRecorderOptions = { videoBitsPerSecond: VIDEO_BITS_PER_SECOND };
    if (mimeTypeRef.current) options.mimeType = mimeTypeRef.current;

    // Nuevo `MediaRecorder` por grabación, SIEMPRE sobre el mismo `stream` —
    // ver regla 1 del doc-comment del módulo. Nunca se toca `streamRef` acá.
    const recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = () => {
      // Si `detener()` está esperando a que ESTE recorder termine, que sea
      // su propio callback el que resuelva/rechace (ver C3 y
      // `pendingStopRef` más abajo) — no hacemos doble trabajo acá.
      if (pendingStopRef.current?.recorder === recorder) {
        pendingStopRef.current.finalize(new Error('Error del grabador.'));
        return;
      }
      // I4: un fallo del encoder A MITAD de una grabación (nadie llamó a
      // `detener()` todavía) dejaba la UI clavada en "GRABANDO" para
      // siempre — en un teléfono atornillado a una pared, la única salida
      // era recargar la página. Se corta la grabación acá mismo.
      if (activeRecordingRef.current?.recorder === recorder) {
        activeRecordingRef.current = null;
      }
      // C3: nunca pisar "caída" con "armada" — ver detener() más abajo.
      setEstado((prev) => (prev === 'caida' ? 'caida' : 'armada'));
    };

    activeRecordingRef.current = { recorder, chunks };
    recorder.start(200);
    startedAtRef.current = Date.now();
    setEstado('grabando');
  }, []);

  const detener = useCallback((): Promise<ResultadoDetener> => {
    return new Promise((resolve, reject) => {
      const active = activeRecordingRef.current;
      if (!active || active.recorder.state === 'inactive') {
        reject(new Error('No hay una grabación en curso.'));
        return;
      }
      const { recorder, chunks } = active;
      const duracionMs = Date.now() - startedAtRef.current;

      let settled = false;
      const finalize = (err?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        if (activeRecordingRef.current?.recorder === recorder) {
          activeRecordingRef.current = null;
        }
        if (pendingStopRef.current?.recorder === recorder) {
          pendingStopRef.current = null;
        }
        // C3: `setEstado('armada')` incondicional acá pisaba una cámara ya
        // "caída" (p.ej. entró una llamada JUSTO mientras se detenía). El
        // teléfono en la pared terminaba mostrando "ARMADA" en tipografía
        // enorme sobre un preview congelado con la cámara muerta — la
        // siguiente orden no graba nada, y recién se descubre en F4 por un
        // video ausente. El rearme automático (regla 2) sigue aplicando
        // para el camino feliz; "caída" es la única excepción.
        setEstado((prev) => (prev === 'caida' ? 'caida' : 'armada'));
        if (err) {
          reject(err);
          return;
        }
        const usedMimeType = recorder.mimeType || mimeTypeRef.current || 'video/webm';
        const blob = new Blob(chunks, { type: usedMimeType });
        resolve({ blob, mimeType: usedMimeType, duracionMs });
      };

      // C3 — salida por error/timeout: sin esto, si `onstop` nunca dispara
      // (encoder trabado — poco común pero posible) la promesa queda
      // colgada para siempre, y F4 la va a esperar para subir el video.
      const timeoutId = setTimeout(() => {
        finalize(new Error('La grabación no terminó a tiempo (posible falla del encoder).'));
      }, DETENER_TIMEOUT_MS);

      pendingStopRef.current = { recorder, finalize };
      recorder.onstop = () => finalize();
      // `onerror` ya está asignado desde `grabar()` y consulta
      // `pendingStopRef` — no hace falta reasignarlo acá.

      // Deliberadamente solo `recorder.stop()`. Jamás
      // `streamRef.current?.getTracks().forEach(t => t.stop())` acá: eso es
      // exactamente lo que este hook existe para evitar (regla 1).
      recorder.stop();
    });
  }, []);

  // I6 — limpieza al desmontar: este hook vive en una vista de kiosco que
  // en operación normal NUNCA se desmonta, pero puede pasar igual (hot
  // reload en dev, navegación de emergencia, un error boundary). Que el
  // STREAM sobreviva al desmontaje es la regla 1 y está bien — el gesto
  // humano de `armar()` es caro, no hay por qué pedirlo de nuevo. Que el
  // ENCODER (el `MediaRecorder` activo) siga corriendo es otra cosa: sigue
  // escribiendo chunks en el `chunks` de un closure que ya nadie va a leer
  // — trabajo de CPU/batería tirado, y ese blob nunca lo va a levantar
  // nadie. Se detiene el recorder sin tocar `streamRef`.
  useEffect(() => {
    return () => {
      const active = activeRecordingRef.current;
      if (active && active.recorder.state !== 'inactive') {
        try {
          active.recorder.stop();
        } catch {
          // Nada accionable si `stop()` tira acá — el hook ya se está yendo.
        }
      }
      activeRecordingRef.current = null;
      pendingStopRef.current = null;
    };
  }, []);

  return { estado, error, mimeType, videoRef, armar, grabar, detener };
}
