'use client';

import { useCallback, useRef, useState, type RefObject } from 'react';

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
 *    se libera (`track.stop()` no se llama jamás). Por cada grabación se crea
 *    un `MediaRecorder` nuevo sobre el mismo stream. Liberar el stream fuerza
 *    un gesto humano para rearmar en cada equipo, que es justo lo que este
 *    diseño evita.
 * 2. Tras `detener()` el estado vuelve a `armada`, no a `inactiva` — es el
 *    rearme automático: la cámara queda lista para la próxima orden sin que
 *    nadie la toque.
 * 3. El `mimeType` se negocia con `MediaRecorder.isTypeSupported()`, nunca se
 *    hardcodea. Android/Chrome (plataforma primaria) graba WebM; iOS graba
 *    MP4. Asumir `video/mp4` rompe la grabación en Chrome. El valor negociado
 *    se expone en el retorno: F4 lo necesita para la extensión de la key en
 *    S3 y el `content_type`.
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

export function useKioskRecorder(): UseKioskRecorderReturn {
  const [estado, setEstado] = useState<EstadoCaptura>('inactiva');
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
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
    if (!stream || estado !== 'armada') return;

    chunksRef.current = [];
    const options: MediaRecorderOptions = { videoBitsPerSecond: VIDEO_BITS_PER_SECOND };
    if (mimeTypeRef.current) options.mimeType = mimeTypeRef.current;

    // Nuevo `MediaRecorder` por grabación, SIEMPRE sobre el mismo `stream` —
    // ver regla 1 del doc-comment del módulo. Nunca se toca `streamRef` acá.
    const recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.start(200);
    recorderRef.current = recorder;
    startedAtRef.current = Date.now();
    setEstado('grabando');
  }, [estado]);

  const detener = useCallback((): Promise<ResultadoDetener> => {
    return new Promise((resolve, reject) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        reject(new Error('No hay una grabación en curso.'));
        return;
      }
      const duracionMs = Date.now() - startedAtRef.current;

      recorder.onstop = () => {
        const usedMimeType = recorder.mimeType || mimeTypeRef.current || 'video/webm';
        const blob = new Blob(chunksRef.current, { type: usedMimeType });
        chunksRef.current = [];
        recorderRef.current = null;
        // Rearme automático: NUNCA 'inactiva'. La cámara queda lista para la
        // próxima orden sin que nadie la toque (spec §7, regla 2).
        setEstado('armada');
        resolve({ blob, mimeType: usedMimeType, duracionMs });
      };

      // Deliberadamente solo `recorder.stop()`. Jamás
      // `streamRef.current?.getTracks().forEach(t => t.stop())` acá: eso es
      // exactamente lo que este hook existe para evitar (regla 1).
      recorder.stop();
    });
  }, []);

  return { estado, error, mimeType, videoRef, armar, grabar, detener };
}
