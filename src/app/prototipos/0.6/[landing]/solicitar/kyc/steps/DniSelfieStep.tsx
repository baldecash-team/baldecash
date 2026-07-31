'use client';

/**
 * Sub-paso KYC: DNI + selfie.
 *
 * Fase 2b: captura DOS fotos fijas con la cámara del dispositivo — primero
 * una selfie (cámara frontal) y luego el frente del DNI (cámara trasera) —
 * las sube a S3 vía URLs presignadas (`getKycUploadUrl` + `uploadToS3`) y
 * compara los rostros por URL contra el endpoint nativo de ws2
 * (`compareFaces`).
 *
 * UI alineada con la de videofirma (`admision/_components/VideoRecorder`):
 * card de cámara oscuro con aspect ratio, overlay de "toca para activar"
 * (iOS low-power), botón circular de captura y un OVERLAY DE ENCUADRE (óvalo
 * de rostro para la selfie, marco de documento para el DNI) que ayuda a
 * cuadrar la toma. El overlay es puramente visual (`pointer-events-none`): la
 * captura sigue "congelando" el <video> sobre un <canvas> oculto.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useRecorder } from '@/app/prototipos/0.6/admision/_hooks/useRecorder';
import { cameraErrorMessage } from '@/app/prototipos/0.6/admision/_lib/cameraError';
import { compareFaces, dataUrlToBlob, getKycUploadUrl, uploadToS3 } from '@/app/prototipos/0.6/services/kycApi';
import { useKycTracker, type KycTrack } from '../useKycTracker';

export interface DniSelfieStepProps {
  onDone: () => void;
  onBack?: () => void;
  /** application_code, usado para pedir las URLs presignadas de S3. */
  applicationCode?: string;
  /** Emisor de eventos alternativo (ruta tokenizada /kyc/[token]); ver useKycTracker. */
  onTrack?: KycTrack;
}

type CapturePhase = 'selfie' | 'dni';
type Phase = CapturePhase | 'review';
type OverlayKind = 'oval' | 'document';

interface PhaseConfig {
  title: string;
  guide: string;
  /** Texto corto sobre el overlay de encuadre. */
  frameHint: string;
  aspect: string;
  /** Tope de ancho: acota el alto derivado de `aspect` sin romper overlays. */
  maxWidth: string;
  facingMode: 'user' | 'environment';
  overlay: OverlayKind;
}

const PHASE_CONFIG: Record<CapturePhase, PhaseConfig> = {
  selfie: {
    title: 'Selfie',
    guide: 'Mira a la cámara, con buena luz y sin lentes ni gorra.',
    frameHint: 'Centra tu rostro dentro del óvalo',
    aspect: 'aspect-[3/4]',
    // El alto lo determina el ancho por la relación de aspecto. Sin este tope,
    // en un panel ancho un 3:4 producía una card altísima que no entraba en
    // pantalla. Acotar el ANCHO (y centrar) es preferible a un `max-h`: los
    // overlays de encuadre son hijos absolutos de esta misma caja, así que
    // recortarla por alto los desalinearía del video.
    maxWidth: 'max-w-[260px]',
    facingMode: 'user',
    overlay: 'oval',
  },
  dni: {
    title: 'Foto de tu DNI',
    guide: 'Foto nítida del frente de tu DNI, sin reflejos.',
    frameHint: 'Encuadra el frente del DNI dentro del marco',
    aspect: 'aspect-[16/10]',
    maxWidth: 'max-w-[420px]',
    facingMode: 'environment',
    overlay: 'document',
  },
};

/**
 * Overlay de guía de encuadre. Oscurece todo menos la "ventana" (óvalo o
 * marco de documento) usando el truco de `box-shadow` con spread enorme, y
 * dibuja el borde de la ventana. No intercepta gestos (`pointer-events-none`).
 */
function FramingOverlay({ kind, hint }: { kind: OverlayKind; hint: string }) {
  const shape =
    kind === 'oval'
      ? 'w-[64%] aspect-[3/4] rounded-[50%]'
      : 'w-[86%] aspect-[1.585] rounded-lg';
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative ${shape} border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]`}
        >
          {kind === 'document' && (
            <>
              <span className="absolute -top-[3px] -left-[3px] h-5 w-5 rounded-tl-lg border-l-4 border-t-4 border-white" />
              <span className="absolute -top-[3px] -right-[3px] h-5 w-5 rounded-tr-lg border-r-4 border-t-4 border-white" />
              <span className="absolute -bottom-[3px] -left-[3px] h-5 w-5 rounded-bl-lg border-l-4 border-b-4 border-white" />
              <span className="absolute -bottom-[3px] -right-[3px] h-5 w-5 rounded-br-lg border-r-4 border-b-4 border-white" />
            </>
          )}
        </div>
      </div>
      <p className="absolute inset-x-0 bottom-3 text-center text-[13px] font-medium text-white/90 drop-shadow">
        {hint}
      </p>
    </div>
  );
}

export function DniSelfieStep({ onDone, onBack, applicationCode, onTrack }: DniSelfieStepProps) {
  const { stream, requestCamera, stopStream, liveVideoRef, liveActive, playLive } = useRecorder();
  const track = useKycTracker(onTrack);
  const [phase, setPhase] = useState<Phase>('selfie');
  const [selfieShot, setSelfieShot] = useState<string | null>(null);
  const [dniShot, setDniShot] = useState<string | null>(null);
  const [pendingShot, setPendingShot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  type VerifyState = 'idle' | 'uploading' | 'verifying' | 'matched' | 'nomatch' | 'error';
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const runVerification = async () => {
    if (!selfieShot || !dniShot) return;
    track('kyc_identity_verify_submit', { application_code: applicationCode });

    if (!applicationCode) {
      setVerifyError('No pudimos verificar tu identidad. Intenta nuevamente.');
      setVerifyState('error');
      return;
    }

    setVerifyState('uploading');
    setVerifyError(null);

    try {
      const [selfieUploadUrl, dniUploadUrl] = await Promise.all([
        getKycUploadUrl(applicationCode, 'selfie'),
        getKycUploadUrl(applicationCode, 'dni'),
      ]);
      if (!selfieUploadUrl || !dniUploadUrl) {
        setVerifyError('No pudimos subir tus fotos. Intenta nuevamente.');
        setVerifyState('error');
        return;
      }

      const [selfieUploaded, dniUploaded] = await Promise.all([
        uploadToS3(selfieUploadUrl.upload_url, dataUrlToBlob(selfieShot)),
        uploadToS3(dniUploadUrl.upload_url, dataUrlToBlob(dniShot)),
      ]);
      if (!selfieUploaded || !dniUploaded) {
        setVerifyError('No pudimos subir tus fotos. Intenta nuevamente.');
        setVerifyState('error');
        return;
      }

      setVerifyState('verifying');
      const res = await compareFaces(selfieUploadUrl.file_url, dniUploadUrl.file_url, undefined, {
        source_key: selfieUploadUrl.key,
        target_key: dniUploadUrl.key,
      });
      if (!res.success) {
        setVerifyError(res.error || 'No pudimos verificar tu identidad.');
        setVerifyState('error');
        return;
      }

      const similarityValue = typeof res.similarity === 'number' ? res.similarity : null;
      setSimilarity(similarityValue);
      if (res.is_match) {
        track('kyc_identity_verified', { similarity: similarityValue, application_code: applicationCode });
        setVerifyState('matched');
      } else {
        track('kyc_identity_rejected', { similarity: similarityValue, application_code: applicationCode });
        setVerifyState('nomatch');
      }
    } catch {
      setVerifyError('No pudimos verificar tu identidad. Intenta nuevamente.');
      setVerifyState('error');
    }
  };

  const retakeFromSelfie = () => {
    track('kyc_selfie_retake', { application_code: applicationCode });
    setSelfieShot(null);
    setDniShot(null);
    setSimilarity(null);
    setVerifyState('idle');
    setPhase('selfie');
  };

  const openCamera = useCallback(
    async (mode: 'user' | 'environment') => {
      setError(null);
      try {
        // Solo se necesita video: este paso captura fotos fijas, no audio.
        await requestCamera(mode, { audio: false });
        track('kyc_camera_granted', { kind: mode === 'user' ? 'selfie' : 'dni', application_code: applicationCode });
      } catch (err) {
        setError(cameraErrorMessage(err));
        track('kyc_camera_denied', { kind: mode === 'user' ? 'selfie' : 'dni', application_code: applicationCode });
      }
    },
    [requestCamera, track, applicationCode]
  );

  // Abre la cámara con el facingMode correcto al entrar a cada fase de captura.
  useEffect(() => {
    if (phase === 'review') return;
    openCamera(PHASE_CONFIG[phase].facingMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Libera la cámara al salir del paso (desmontar o avanzar de sub-paso).
  useEffect(() => {
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCapture() {
    const video = liveVideoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPendingShot(canvas.toDataURL('image/jpeg', 0.85));
    // No necesitamos el feed en vivo mientras se revisa la foto capturada.
    stopStream();
  }

  function handleRepeat() {
    setPendingShot(null);
    if (phase === 'selfie') track('kyc_selfie_retake', { application_code: applicationCode });
    else if (phase === 'dni') track('kyc_dni_retake', { application_code: applicationCode });
    if (phase !== 'review') openCamera(PHASE_CONFIG[phase].facingMode);
  }

  function handleUsePhoto() {
    if (!pendingShot) return;
    if (phase === 'selfie') {
      setSelfieShot(pendingShot);
      setPendingShot(null);
      track('kyc_selfie_captured', { application_code: applicationCode });
      setPhase('dni');
    } else if (phase === 'dni') {
      setDniShot(pendingShot);
      setPendingShot(null);
      track('kyc_dni_captured', { application_code: applicationCode });
      setPhase('review');
    }
  }

  function handleRetry() {
    if (phase === 'review') return;
    openCamera(PHASE_CONFIG[phase].facingMode);
  }

  if (phase === 'review') {
    return (
      <div className="w-full space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-[#1f2937]">Revisa tus fotos</h2>
          <p className="text-[#6b7280] text-sm">Todo listo. Puedes continuar.</p>
        </div>

        {/*
          Cada preview conserva el MISMO aspecto con el que se capturó
          (`PHASE_CONFIG`): vertical la selfie, apaisado el documento. Antes
          ambas se forzaban a `aspect-[3/4]`, así que el DNI —tomado en 16/10—
          se mostraba vertical y `object-cover` le recortaba los costados,
          justo donde está el número. `items-start` alinea arriba las dos
          columnas, que ahora tienen alturas distintas a propósito.
        */}
        <div className="grid grid-cols-2 gap-3 items-start mx-auto w-full max-w-[420px]">
          <div className="space-y-2">
            <div className={`relative rounded-xl overflow-hidden bg-black ${PHASE_CONFIG.selfie.aspect} border border-[#e5e7eb]`}>
              {selfieShot && (
                <img src={selfieShot} alt="Selfie capturada" className="w-full h-full object-cover" />
              )}
              <span className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
              </span>
            </div>
            <p className="text-xs text-center text-[#6b7280]">Selfie</p>
          </div>
          <div className="space-y-2">
            <div className={`relative rounded-xl overflow-hidden bg-black ${PHASE_CONFIG.dni.aspect} border border-[#e5e7eb]`}>
              {dniShot && (
                <img src={dniShot} alt="DNI capturado" className="w-full h-full object-cover" />
              )}
              <span className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
              </span>
            </div>
            <p className="text-xs text-center text-[#6b7280]">DNI</p>
          </div>
        </div>

        <div className="flex gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-1 border border-[#4654CD] text-[#4654CD] font-semibold py-2 rounded-xl hover:bg-[#ECECFB] transition-colors cursor-pointer"
            >
              Atrás
            </button>
          )}
        </div>

        {verifyState === 'idle' && (
          <button
            type="button"
            onClick={runVerification}
            className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Verificar identidad
          </button>
        )}

        {verifyState === 'uploading' && (
          <div className="flex items-center justify-center gap-2 py-3 text-[#6b7280]">
            <span className="w-5 h-5 rounded-full border-2 border-[#e5e7eb] border-t-[#4654CD] animate-spin" />
            Subiendo imágenes…
          </div>
        )}

        {verifyState === 'verifying' && (
          <div className="flex items-center justify-center gap-2 py-3 text-[#6b7280]">
            <span className="w-5 h-5 rounded-full border-2 border-[#e5e7eb] border-t-[#4654CD] animate-spin" />
            Verificando identidad…
          </div>
        )}

        {verifyState === 'matched' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center text-[#16a34a] font-semibold">
              <span className="w-6 h-6 rounded-full bg-[#16a34a]/10 flex items-center justify-center">✓</span>
              Identidad verificada{similarity != null ? ` · ${similarity}%` : ''}
            </div>
            <button
              type="button"
              onClick={onDone}
              className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
            >
              Continuar
            </button>
          </div>
        )}

        {(verifyState === 'nomatch' || verifyState === 'error') && (
          <div className="space-y-3">
            <p className="text-sm text-[#ef4444] text-center">
              {verifyState === 'nomatch'
                ? `Los rostros no coinciden${similarity != null ? ` (${similarity}%)` : ''}. Repite las fotos.`
                : (verifyError || 'No pudimos verificar tu identidad.')}
            </p>
            <button
              type="button"
              onClick={retakeFromSelfie}
              className="w-full border border-[#4654CD] text-[#4654CD] font-semibold py-2 rounded-xl hover:bg-[#ECECFB] transition-colors cursor-pointer"
            >
              Repetir fotos
            </button>
            {verifyState === 'error' && (
              <button
                type="button"
                onClick={runVerification}
                className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Reintentar
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const config = PHASE_CONFIG[phase];

  return (
    <div className="w-full space-y-4">
      {/* Header estilo videofirma */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">
          {config.title}
        </p>
        <div className="rounded-xl bg-[#F7F7FB] border border-[#ECECFB] px-3.5 py-3">
          <div className="flex items-start gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 mt-0.5 shrink-0 text-[#4654CD]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <p className="text-sm text-[#374151] leading-relaxed">{config.guide}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-[#ef4444]">
          <span className="flex-1">{error}</span>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {pendingShot ? (
        <>
          <div className={`relative rounded-xl overflow-hidden bg-black mx-auto w-full ${config.maxWidth} ${config.aspect} border border-[#e5e7eb]`}>
            <img src={pendingShot} alt="Foto capturada" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRepeat}
              className="flex-1 border border-[#4654CD] text-[#4654CD] font-semibold py-2 rounded-xl hover:bg-[#ECECFB] transition-colors cursor-pointer"
            >
              Repetir
            </button>
            <button
              type="button"
              onClick={handleUsePhoto}
              className="flex-1 bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
            >
              Usar esta foto
            </button>
          </div>
        </>
      ) : stream ? (
        <>
          <div className={`relative rounded-xl overflow-hidden bg-[#1f2937] mx-auto w-full ${config.maxWidth} ${config.aspect} border border-[#e5e7eb]`}>
            <video ref={liveVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

            {/* Overlay de encuadre: óvalo (selfie) o marco de documento (DNI). */}
            <FramingOverlay kind={config.overlay} hint={config.frameHint} />

            {/* iOS Low Power Mode bloquea el autoplay → el feed queda en plomo.
                Este overlay lo reactiva con un gesto directo. */}
            {!liveActive && (
              <button
                type="button"
                onClick={playLive}
                aria-label="Activar cámara"
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/55 text-white cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span className="text-sm font-semibold">Toca para activar la cámara</span>
              </button>
            )}
          </div>

          {/* Botón circular de captura (obturador), como videofirma. */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              aria-label="Tomar foto"
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-white ring-4 ring-[#4654CD]/25 border-4 border-[#4654CD] hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg cursor-pointer"
            >
              <span className="w-8 h-8 rounded-full bg-[#4654CD]" />
            </button>
            <span className="text-[#6b7280] text-xs font-medium">Toca el círculo para tomar la foto</span>
          </div>
        </>
      ) : error ? (
        <button
          type="button"
          onClick={handleRetry}
          className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
        >
          Reintentar
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="w-10 h-10 rounded-full border-4 border-[#e5e7eb] border-t-[#4654CD] animate-spin" />
          <p className="text-[#6b7280] text-sm text-center">Solicitando acceso a la cámara…</p>
        </div>
      )}

      {/* En fase DNI, "Atrás" vuelve a la selfie (escape del loop de error de
          cámara). En fase selfie, solo aparece si hay paso previo (onBack). */}
      {!pendingShot && (phase === 'dni' || onBack) && (
        <button
          type="button"
          onClick={() => {
            if (phase === 'dni') {
              setPendingShot(null);
              setPhase('selfie');
            } else {
              onBack?.();
            }
          }}
          className="w-full border border-[#4654CD] text-[#4654CD] font-semibold py-2 rounded-xl hover:bg-[#ECECFB] transition-colors cursor-pointer"
        >
          Atrás
        </button>
      )}
    </div>
  );
}

export default DniSelfieStep;
