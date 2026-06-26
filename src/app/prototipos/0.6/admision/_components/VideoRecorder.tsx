'use client';

import { useState, useEffect, useRef } from 'react';
import { isAllowedVideoType, baseContentType } from '../_lib/videoTypes';
import { cameraErrorMessage } from '../_lib/cameraError';
import { useRecorder } from '../_hooks/useRecorder';
import { ExampleModal, type VideoExample } from './ExampleModal';

function formatSeconds(s: number): string {
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `REC ${mm}:${ss}`;
}

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
    reRecord,
    getFile,
    setPlaying,
    stopStream,
    liveVideoRef,
    playbackVideoRef,
  } = useRecorder();

  const [showFileInput, setShowFileInput] = useState(!canRecord);
  const [fileChosen, setFileChosen] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const inputId = `video-file-${index}`;

  async function handleRequestCamera() {
    setPermissionDenied(false);
    onError?.(null); // limpia cualquier error previo (un solo error a la vez)
    try {
      await requestCamera();
      onCameraReady?.();
    } catch (err) {
      onError?.(cameraErrorMessage(err), { icon: 'camera' });
      setPermissionDenied(true);
      setShowFileInput(true);
    }
  }

  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current || !canRecord || showFileInput) return;
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

  function handleUseVideo() {
    if (!previewBlob) return;
    const baseMime = baseContentType(previewBlob.type || 'video/webm');
    if (!isAllowedVideoType(baseMime)) {
      onError?.('Formato no permitido. Usa MP4, WebM o MOV.');
      return;
    }
    const file = getFile(index);
    if (!file) return;
    stopStream();
    onCaptured(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    if (!isAllowedVideoType(file.type)) {
      onError?.('Formato no permitido. Usa MP4, WebM o MOV.');
      return;
    }
    setFileChosen(file.name);
    onCaptured(file);
  }

  function togglePlayback() {
    const el = playbackVideoRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
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
            className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#ECECFB] text-[#4654CD] text-xs font-semibold px-3 py-1.5 hover:bg-[#e1e1f7] transition-colors"
            onClick={() => setShowExample(true)}
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
      {canRecord && !showFileInput && (
        <>
          {!stream && !previewBlob && !requesting && (
            <button
              className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              onClick={handleRequestCamera}
            >
              Permitir cámara / Grabar
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
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                    <span className="text-white text-xs font-mono">{formatSeconds(recSeconds)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                {!isRecording ? (
                  <>
                    <button
                      aria-label="Iniciar grabación"
                      className="w-16 h-16 rounded-full bg-[#ef4444] ring-4 ring-[#ef4444]/25 hover:ring-[#ef4444]/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg"
                      onClick={startRecording}
                    >
                      <span className="w-6 h-6 rounded-full bg-white" />
                    </button>
                    <span className="text-[#6b7280] text-xs font-medium">Toca el círculo para grabar</span>
                  </>
                ) : (
                  <>
                    <button
                      aria-label="Detener grabación"
                      className="w-16 h-16 rounded-full bg-[#6b7280] ring-4 ring-[#6b7280]/25 hover:ring-[#6b7280]/40 active:scale-95 transition-all flex items-center justify-center shadow-lg"
                      onClick={stopRecording}
                    >
                      <span className="w-6 h-6 rounded-sm bg-white" />
                    </button>
                    <span className="text-[#6b7280] text-xs font-medium">Grabando… toca para detener</span>
                  </>
                )}
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
                    className="absolute inset-0 flex items-center justify-center bg-black/30 active:bg-black/40 transition-colors"
                    onClick={() => playbackVideoRef.current?.play()}
                  >
                    <span className="w-16 h-16 rounded-full bg-[#4654CD] flex items-center justify-center shadow-lg">
                      <span className="ml-1 inline-block border-y-[11px] border-y-transparent border-l-[18px] border-l-white" />
                    </span>
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 border border-[#4654CD] text-[#4654CD] font-semibold py-2 rounded-xl hover:bg-[#ECECFB] transition-colors text-sm"
                  onClick={async () => {
                    reRecord();
                    await handleRequestCamera();
                  }}
                >
                  Re-grabar
                </button>
                <button
                  className="flex-1 bg-[#4654CD] text-white font-semibold py-2 rounded-xl hover:opacity-90 transition-opacity text-sm"
                  onClick={handleUseVideo}
                >
                  Usar este video
                </button>
              </div>
            </>
          )}

          {!previewBlob && (
            <>
              <div className="flex items-center gap-3 pt-1">
                <span className="h-px flex-1 bg-[#e5e7eb]" />
                <span className="text-xs text-[#6b7280]">o</span>
                <span className="h-px flex-1 bg-[#e5e7eb]" />
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 w-full border border-[#e5e7eb] text-[#6b7280] font-medium py-2.5 rounded-xl hover:border-[#4654CD] hover:text-[#4654CD] transition-colors text-sm"
                onClick={() => setShowFileInput(true)}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15V3M8 7l4-4 4 4" />
                  <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
                </svg>
                Subir un archivo de video
              </button>
            </>
          )}
        </>
      )}

      {/* ── file upload path ──────────────────────────────────────────────── */}
      {(!canRecord || showFileInput) && (
        <>

          <label
            htmlFor={inputId}
            className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-[#e5e7eb] hover:border-[#4654CD] active:bg-[#ECECFB] px-5 py-8 text-center transition-colors select-none"
          >
            <span className="w-12 h-12 rounded-full bg-[#ECECFB] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#4654CD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15V3M8 7l4-4 4 4" />
                <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
              </svg>
            </span>
            <span className="text-[#1f2937] font-semibold text-sm">
              {fileChosen ? 'Toca para cambiar el video' : 'Toca para subir tu video'}
            </span>
            <span className="text-[#6b7280] text-xs">MP4, WebM o MOV · máx 200 MB</span>
          </label>

          <input
            id={inputId}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="sr-only"
            onChange={handleFileChange}
          />

          {fileChosen && (
            <div className="flex items-center gap-2 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/30 px-4 py-3">
              <span className="text-[#16a34a] font-bold">✓</span>
              <span className="text-sm text-[#1f2937] truncate">Video listo · {fileChosen}</span>
            </div>
          )}

          {canRecord && showFileInput && (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 w-full border border-[#e5e7eb] text-[#6b7280] font-medium py-2.5 rounded-xl hover:border-[#4654CD] hover:text-[#4654CD] transition-colors text-sm"
              onClick={() => {
                const retry = permissionDenied;
                setPermissionDenied(false);
                onError?.(null);
                setShowFileInput(false);
                // Si venía de un bloqueo/denegación, vuelve a pedir permiso al navegador directo.
                if (retry) void handleRequestCamera();
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              {permissionDenied ? 'Reintentar con la cámara' : 'Grabar con la cámara'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
