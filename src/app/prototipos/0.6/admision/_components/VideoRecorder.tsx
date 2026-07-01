'use client';

import { useState, useEffect, useRef } from 'react';
import { isAllowedVideoType, baseContentType } from '../_lib/videoTypes';
import { cameraErrorMessage } from '../_lib/cameraError';
import { useRecorder } from '../_hooks/useRecorder';
import { ExampleModal, type VideoExample } from './ExampleModal';
import { AdvisorButton } from './AdvisorButton';
import type { AdmissionEvents } from '../_lib/events';
import {
  MIN_RECORDING_SECONDS,
  RECORDING_LIMITS_HINT,
  isTooShort,
  tooShortMessage,
  remainingSeconds,
  formatMMSS,
} from '../_lib/recordingLimits';

export interface VideoRecorderProps {
  question: string;
  index: number;
  total: number;
  onCaptured: (file: File) => void;
  /** Notifica un error (o lo limpia con null) al contenedor; un solo error a la vez. */
  onError?: (msg: string | null, opts?: { icon?: 'alert' | 'camera' }) => void;
  /** Ejemplo guía para esta pregunta (mejora #8). */
  example?: VideoExample;
  /** Si el permiso de cámara ya se concedió, arranca directo en la vista de grabación. */
  autoStart?: boolean;
  /** Se llama cuando la cámara queda lista (permiso concedido). */
  onCameraReady?: () => void;
  /** Emisor de eventos de tracking del funnel (opcional). */
  events?: AdmissionEvents;
}

export function VideoRecorder({
  question,
  index,
  total,
  onCaptured,
  onError,
  example,
  autoStart,
  onCameraReady,
  events,
}: VideoRecorderProps) {
  const {
    canRecord,
    requesting,
    stream,
    isRecording,
    recSeconds,
    previewUrl,
    previewBlob,
    playing,
    requestCamera,
    startRecording,
    stopRecording,
    resetForNext,
    switchCamera,
    facingMode,
    canSwitchCamera,
    getFile,
    setPlaying,
    liveVideoRef,
    playbackVideoRef,
  } = useRecorder();

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showExample, setShowExample] = useState(false);

  async function handleRequestCamera() {
    setPermissionDenied(false);
    onError?.(null); // limpia cualquier error previo (un solo error a la vez)
    events?.track('video_permission_camera_requested', { question_index: index });
    try {
      await requestCamera();
      events?.track('video_permission_camera_granted', { question_index: index });
      onCameraReady?.();
    } catch (err) {
      events?.track('video_permission_camera_denied', {
        question_index: index,
        error_type: (err as { name?: string } | null)?.name ?? 'unknown',
      });
      onError?.(cameraErrorMessage(err), { icon: 'camera' });
      setPermissionDenied(true);
    }
  }

  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current || !canRecord) return;
    let cancelled = false;
    (async () => {
      let granted = Boolean(autoStart);
      if (!granted && typeof navigator !== 'undefined' && navigator.permissions?.query) {
        try {
          const st = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (st.state === 'granted') granted = true;
        } catch {
          // Permissions API no soportada → se mantiene el botón manual.
        }
      }
      if (!cancelled && granted) {
        autoStartedRef.current = true;
        handleRequestCamera();
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Dispositivo/navegador sin soporte de grabación → pantalla bloqueante.
  const unsupportedTrackedRef = useRef(false);
  useEffect(() => {
    if (!canRecord && !unsupportedTrackedRef.current) {
      unsupportedTrackedRef.current = true;
      events?.track('video_device_unsupported', { question_index: index });
    }
  }, [canRecord, events, index]);

  // Preview del clip visible → una emisión por clip grabado.
  const previewTrackedRef = useRef(false);
  useEffect(() => {
    if (previewBlob && !previewTrackedRef.current) {
      previewTrackedRef.current = true;
      events?.track('video_clip_preview_shown', { question_index: index });
    } else if (!previewBlob) {
      previewTrackedRef.current = false;
    }
  }, [previewBlob, events, index]);

  function handleUseVideo() {
    if (!previewBlob) return;
    // No permitir enviar clips de menos de 10 segundos.
    const shortMsg = tooShortMessage(recSeconds);
    if (shortMsg) {
      onError?.(shortMsg, { icon: 'alert' });
      return;
    }
    const baseMime = baseContentType(previewBlob.type || 'video/webm');
    if (!isAllowedVideoType(baseMime)) {
      onError?.('Formato no permitido. Usa MP4, WebM o MOV.');
      return;
    }
    const file = getFile(index);
    if (!file) return;
    events?.track('video_clip_accepted', { question_index: index });
    // Deja el stream abierto: si el flujo vuelve a "capture" para otra pregunta,
    // se reutiliza la cámara sin volver a pedir permiso. El stream se cierra en
    // el cleanup del hook al desmontar (al salir de la etapa de captura).
    resetForNext();
    onCaptured(file);
  }

  function togglePlayback() {
    const el = playbackVideoRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  }

  if (!canRecord) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center text-amber-900">
        <p className="font-semibold">Necesitas grabar con la cámara de tu dispositivo</p>
        <p className="mt-1 text-sm">
          Tu dispositivo o navegador no permite grabar video. Abre el enlace desde tu celular
          (Chrome o Safari) e intenta de nuevo.
        </p>
        <div className="mt-3"><AdvisorButton variant="inline" /></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* question header */}
      <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">
        PREGUNTA {index + 1} DE {total}
      </p>
      <div className="rounded-xl bg-[#ECECFB] px-4 py-3">
        <p className="text-base font-semibold text-[#4654CD] leading-snug">{question}</p>
      </div>

      {/* Ver ejemplo (mejora #8) */}
      {example && (
        <>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#ECECFB] text-[#4654CD] text-xs font-semibold px-3 py-1.5 hover:bg-[#e1e1f7] transition-colors cursor-pointer"
            onClick={() => {
              events?.track('video_example_opened', { question_index: index });
              setShowExample(true);
            }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Ver ejemplo
          </button>
          <ExampleModal
            open={showExample}
            onClose={() => setShowExample(false)}
            title={`Ejemplo · Pregunta ${index + 1}`}
            example={example}
          />
        </>
      )}

      {/* ── camera recording path ─────────────────────────────────────────── */}
      {!stream && !previewBlob && !requesting && (
        <button
          className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          onClick={handleRequestCamera}
        >
          {permissionDenied ? 'Reintentar' : 'Permitir cámara / Grabar'}
        </button>
      )}

      {requesting && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-10 h-10 rounded-full border-4 border-[#e5e7eb] border-t-[#4654CD] animate-spin" />
          <p className="text-[#6b7280] text-sm text-center">Solicitando acceso a la cámara…</p>
        </div>
      )}

      {!!stream && !previewBlob && (
        <>
          <div className="relative rounded-xl overflow-hidden bg-[#1f2937] aspect-video flex items-center justify-center border border-[#e5e7eb]">
            <video ref={liveVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {isRecording && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 rounded-full px-2 py-0.5">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                <span className="text-white text-xs font-mono">{formatMMSS(remainingSeconds(recSeconds))}</span>
                <span className="text-white/70 text-[10px]">restante</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            {!isRecording ? (
              <>
                <button
                  aria-label="Iniciar grabación"
                  className="w-16 h-16 rounded-full bg-[#ef4444] ring-4 ring-[#ef4444]/25 hover:ring-[#ef4444]/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg cursor-pointer"
                  onClick={() => {
                    events?.track('video_recording_started', { question_index: index });
                    startRecording();
                  }}
                >
                  <span className="w-6 h-6 rounded-full bg-white" />
                </button>
                <span className="text-[#6b7280] text-xs font-medium">Toca el círculo para grabar</span>
                {canSwitchCamera && (
                  <button
                    type="button"
                    onClick={switchCamera}
                    aria-label="Cambiar cámara"
                    className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#ECECFB] text-[#4654CD] text-xs font-semibold px-3 py-1.5 hover:bg-[#e1e1f7] transition-colors cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 4v6h-6" />
                      <path d="M1 20v-6h6" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    Cambiar a cámara {facingMode === 'user' ? 'principal' : 'frontal'}
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  aria-label="Detener grabación"
                  className="w-16 h-16 rounded-full bg-[#6b7280] ring-4 ring-[#6b7280]/25 hover:ring-[#6b7280]/40 active:scale-95 transition-all flex items-center justify-center shadow-lg cursor-pointer"
                  onClick={() => {
                    events?.track('video_recording_stopped', { question_index: index, duration_sec: recSeconds });
                    stopRecording();
                  }}
                >
                  <span className="w-6 h-6 rounded-sm bg-white" />
                </button>
                <span className="text-[#6b7280] text-xs font-medium">Grabando… toca para detener</span>
              </>
            )}
            <span className="mt-1 text-[11px] text-center text-[#9ca3af]">{RECORDING_LIMITS_HINT}</span>
          </div>
        </>
      )}

      {!!previewBlob && (
        <>
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-[#e5e7eb]">
            <video
              ref={playbackVideoRef}
              src={previewUrl ?? undefined}
              playsInline
              className="w-full h-full object-contain bg-black"
              onClick={togglePlayback}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            />
            {!playing && (
              <button
                type="button"
                aria-label="Reproducir"
                className="absolute inset-0 flex items-center justify-center bg-black/30 active:bg-black/40 transition-colors cursor-pointer"
                onClick={() => playbackVideoRef.current?.play()}
              >
                <span className="w-16 h-16 rounded-full bg-[#4654CD] flex items-center justify-center shadow-lg">
                  <span className="ml-1 inline-block border-y-[11px] border-y-transparent border-l-[18px] border-l-white" />
                </span>
              </button>
            )}
          </div>

          {isTooShort(recSeconds) && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-[#b91c1c]">
              El video dura {recSeconds}s. Debe durar al menos {MIN_RECORDING_SECONDS} segundos: vuelve a grabar.
            </p>
          )}
          <div className="flex gap-3">
            <button
              className="flex-1 border border-[#4654CD] text-[#4654CD] font-semibold py-2 rounded-xl hover:bg-[#ECECFB] transition-colors text-sm cursor-pointer"
              onClick={async () => {
                // Reintentos ilimitados sin re-permiso: reutiliza el stream si
                // sigue abierto; solo re-solicita la cámara si se cerró.
                events?.track('video_clip_rerecord', { question_index: index });
                resetForNext();
                if (!stream) await handleRequestCamera();
              }}
            >
              Re-grabar
            </button>
            <button
              disabled={isTooShort(recSeconds)}
              className={`flex-1 font-semibold py-2 rounded-xl text-sm transition-opacity ${
                isTooShort(recSeconds)
                  ? 'bg-[#c7cbe8] text-white cursor-not-allowed'
                  : 'bg-[#4654CD] text-white hover:opacity-90 cursor-pointer'
              }`}
              onClick={handleUseVideo}
            >
              Usar este video
            </button>
          </div>
        </>
      )}
    </div>
  );
}
