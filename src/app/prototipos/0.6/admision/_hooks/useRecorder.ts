'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { baseContentType } from '../_lib/videoTypes';
import { MAX_RECORDING_SECONDS } from '../_lib/recordingLimits';

/** Cap de calidad para mantener los clips livianos (subida rápida, calidad
 * suficiente para validación): 720p e ~2 Mbps. Reduce el peso ~4-8× vs 1080p sin
 * tope. Constraints "ideal": si el device no puede, degrada en vez de fallar. */
const VIDEO_CONSTRAINTS = { width: { ideal: 1280 }, height: { ideal: 720 } } as const;
const VIDEO_BITS_PER_SECOND = 2_000_000;

export function detectRecordingSupport(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window !== 'undefined' &&
    'MediaRecorder' in window
  );
}

export type FacingMode = 'user' | 'environment';

/** Heurística de dispositivo móvil (para ofrecer el cambio de cámara). */
export function detectMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
  // iPadOS 13+ se reporta como "Macintosh"; detectar por soporte táctil.
  return /Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document;
}

export function pickRecorderMime(): string {
  const prefs = ['video/mp4', 'video/webm'] as const;
  for (const m of prefs) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return 'video/webm';
}

export interface RecorderState {
  canRecord: boolean;
  requesting: boolean;
  stream: MediaStream | null;
  isRecording: boolean;
  recSeconds: number;
  previewUrl: string | null;
  previewBlob: Blob | null;
  playing: boolean;
  /** Cámara actual (frontal / principal). */
  facingMode: FacingMode;
  /** true en móviles → se ofrece cambiar de cámara. */
  isMobile: boolean;
  /** true si hay >1 cámara (o es móvil) → se muestra el botón de cambio. */
  canSwitchCamera: boolean;
  /** true cuando el feed en vivo está efectivamente reproduciéndose. En iOS con
   *  Low Power Mode el autoplay se bloquea y esto queda false → el UI muestra el
   *  overlay "toca para activar". */
  liveActive: boolean;
}

export interface RecorderActions {
  requestCamera: (mode?: FacingMode, opts?: { audio?: boolean }) => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  reRecord: () => void;
  /** Limpia preview/blob/timer para la siguiente toma pero DEJA el stream abierto. */
  resetForNext: () => void;
  /** Alterna frontal/principal reabriendo el stream (solo si no está grabando). */
  switchCamera: () => Promise<void>;
  getFile: (index: number) => File | null;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  stopStream: () => void;
  /** Fuerza play() del feed en vivo desde un gesto del usuario (fallback iOS LPM). */
  playLive: () => void;
}

export interface RecorderRefs {
  liveVideoRef: React.RefObject<HTMLVideoElement | null>;
  playbackVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export type UseRecorderReturn = RecorderState & RecorderActions & RecorderRefs;

export function useRecorder(): UseRecorderReturn {
  const canRecord = detectRecordingSupport();

  const [requesting, setRequesting] = useState(false);
  const [stream, setStreamState] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>('user');
  const [isMobile, setIsMobile] = useState(false);
  const [canSwitchCamera, setCanSwitchCamera] = useState(false);
  const [liveActive, setLiveActive] = useState(false);

  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const playbackVideoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Se resuelve en cliente para evitar mismatch de hidratación.
  useEffect(() => {
    setIsMobile(detectMobile());
  }, []);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  // Reasignar el srcObject cada vez que se (re)monta la vista en vivo — no solo
  // cuando cambia `stream`. Al re-grabar, `stream` se mantiene pero el <video>
  // se desmonta/remonta, así que sin `previewBlob`/`requesting` en las deps el
  // elemento nuevo quedaba sin feed (cuadro sólido negro).
  //
  // iOS Safari NO auto-reproduce un MediaStream asignado por `srcObject` de forma
  // fiable —y con Low Power Mode el autoplay se bloquea del todo, aunque el <video>
  // tenga autoplay+muted+playsInline—: queda en plomo/negro. Por eso, tras asignar
  // el stream, forzamos `play()` (y de nuevo en `loadedmetadata`, que en iOS llega
  // con retraso). `liveActive` se enciende con el evento `playing`; si sigue en
  // false (LPM), el UI ofrece un overlay "toca para activar" con gesto fresco.
  useEffect(() => {
    const el = liveVideoRef.current;
    if (!el) return;
    el.srcObject = stream ?? null;
    setLiveActive(false);
    if (!stream) return;
    const tryPlay = () => { el.play().catch(() => {}); };
    const onPlaying = () => setLiveActive(true);
    tryPlay();
    el.addEventListener('loadedmetadata', tryPlay);
    el.addEventListener('playing', onPlaying);
    return () => {
      el.removeEventListener('loadedmetadata', tryPlay);
      el.removeEventListener('playing', onPlaying);
    };
  }, [stream, previewBlob, requesting]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const stopStream = useCallback(() => {
    setStreamState((s) => {
      if (s) s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return null;
    });
  }, []);

  // Fallback iOS Low Power Mode: reproducir el feed en vivo desde un gesto directo
  // del usuario (el play() del effect corre fuera del gesto y LPM lo bloquea).
  const playLive = useCallback(() => {
    liveVideoRef.current?.play().then(() => setLiveActive(true)).catch(() => {});
  }, []);

  const requestCamera = useCallback(
    async (mode?: FacingMode, opts?: { audio?: boolean }) => {
      const fm = mode ?? facingMode;
      const audioEnabled = opts?.audio ?? true;
      setRequesting(true);
      try {
        let s: MediaStream;
        try {
          // Ideal: cámara (con facingMode preferido) + micrófono (si se solicitó).
          s = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: fm }, ...VIDEO_CONSTRAINTS },
            audio: audioEnabled,
          });
        } catch (e) {
          const name = (e as { name?: string } | null)?.name ?? '';
          // Si falla por un problema del micrófono (no encontrado / en uso / restricción),
          // reintenta solo con cámara para no bloquear al usuario. Los bloqueos de permiso
          // (NotAllowedError) o de seguridad se propagan tal cual.
          if (audioEnabled && (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'NotReadableError' || name === 'TrackStartError' || name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError')) {
            s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: fm }, ...VIDEO_CONSTRAINTS } });
          } else {
            throw e;
          }
        }
        setStreamState(s);
        streamRef.current = s;
        // Detectar si hay más de una cámara para ofrecer el cambio (más fiable
        // que el user-agent). En móvil, aunque enumere 1, se permite por facingMode.
        try {
          const devs = await navigator.mediaDevices.enumerateDevices();
          const cams = devs.filter((d) => d.kind === 'videoinput').length;
          setCanSwitchCamera(cams >= 2 || detectMobile());
        } catch {
          setCanSwitchCamera(detectMobile());
        }
      } finally {
        setRequesting(false);
      }
    },
    [facingMode]
  );

  const startRecording = useCallback(() => {
    const currentStream = streamRef.current;
    if (!currentStream) return;
    chunksRef.current = [];
    const baseMime = pickRecorderMime();
    const mr = new MediaRecorder(currentStream, { mimeType: baseMime, videoBitsPerSecond: VIDEO_BITS_PER_SECOND });

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'video/webm' });
      setPlaying(false);
      setPreviewBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      previewUrlRef.current = url;
    };

    mr.start(200);
    recorderRef.current = mr;
    setIsRecording(true);
    setRecSeconds(0);
    timerRef.current = setInterval(() => setRecSeconds((n) => n + 1), 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    const mr = recorderRef.current;
    if (mr && mr.state !== 'inactive') mr.stop();
    recorderRef.current = null;
    setIsRecording(false);
  }, []);

  // Tope de duración: al llegar a los 5 min la grabación se detiene sola.
  useEffect(() => {
    if (isRecording && recSeconds >= MAX_RECORDING_SECONDS) {
      stopRecording();
    }
  }, [isRecording, recSeconds, stopRecording]);

  /**
   * Limpia el estado de la toma actual (preview, blob, timer, contador) pero
   * MANTIENE `stream` abierto. Se usa entre preguntas y en "re-grabar" para
   * reutilizar la cámara sin volver a pedir permiso ni reabrir el dispositivo.
   */
  const resetForNext = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setPreviewBlob(null);
    chunksRef.current = [];
    setPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    setIsRecording(false);
    setRecSeconds(0);
  }, []);

  const reRecord = useCallback(() => {
    resetForNext();
    stopStream();
  }, [resetForNext, stopStream]);

  /**
   * Alterna entre cámara frontal ('user') y principal ('environment'), reabriendo
   * el stream con el nuevo facingMode. Solo en pausa (no mientras se graba). Si la
   * cámara pedida no existe, revierte a la anterior.
   */
  const switchCamera = useCallback(async () => {
    if (isRecording) return;
    const prev = facingMode;
    const next: FacingMode = prev === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    // Liberar la cámara actual antes de abrir la otra (móvil no permite ambas).
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreamState(null);
    try {
      await requestCamera(next);
    } catch {
      setFacingMode(prev);
      try {
        await requestCamera(prev);
      } catch {
        /* sin cámara disponible: el UI muestra el botón para reintentar */
      }
    }
  }, [isRecording, facingMode, requestCamera]);

  const getFile = useCallback(
    (index: number): File | null => {
      if (!previewBlob) return null;
      const baseMime = baseContentType(previewBlob.type || 'video/webm');
      const ext = baseMime.includes('mp4') ? 'mp4' : 'webm';
      return new File([previewBlob], `clip-${index + 1}.${ext}`, { type: baseMime });
    },
    [previewBlob]
  );

  return {
    canRecord,
    requesting,
    stream,
    isRecording,
    recSeconds,
    previewUrl,
    previewBlob,
    playing,
    facingMode,
    isMobile,
    canSwitchCamera,
    liveActive,
    requestCamera,
    startRecording,
    stopRecording,
    reRecord,
    resetForNext,
    switchCamera,
    getFile,
    setPlaying,
    stopStream,
    playLive,
    liveVideoRef,
    playbackVideoRef,
  };
}
