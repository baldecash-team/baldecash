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
 * Cada foto usa `useRecorder` solo para abrir el stream de cámara (no se usa
 * MediaRecorder): el frame se "congela" pintando el <video> en vivo sobre un
 * <canvas> oculto y convirtiéndolo a un dataURL JPEG.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useRecorder } from '@/app/prototipos/0.6/admision/_hooks/useRecorder';
import { cameraErrorMessage } from '@/app/prototipos/0.6/admision/_lib/cameraError';
import { compareFaces, dataUrlToBlob, getKycUploadUrl, uploadToS3 } from '@/app/prototipos/0.6/services/kycApi';
import { useEventTrackerOptional } from '../../context/EventTrackerContext';

export interface DniSelfieStepProps {
  onDone: () => void;
  onBack?: () => void;
  /** application_code, usado para pedir las URLs presignadas de S3. */
  applicationCode?: string;
}

type CapturePhase = 'selfie' | 'dni';
type Phase = CapturePhase | 'review';

interface PhaseConfig {
  title: string;
  guide: string;
  aspect: string;
  facingMode: 'user' | 'environment';
}

const PHASE_CONFIG: Record<CapturePhase, PhaseConfig> = {
  selfie: {
    title: 'Selfie',
    guide: 'Mira a la cámara, buena luz, sin lentes',
    aspect: 'aspect-[3/4]',
    facingMode: 'user',
  },
  dni: {
    title: 'Foto de tu DNI',
    guide: 'Foto clara del frente de tu DNI',
    aspect: 'aspect-[16/10]',
    facingMode: 'environment',
  },
};

export function DniSelfieStep({ onDone, onBack, applicationCode }: DniSelfieStepProps) {
  const { stream, requestCamera, stopStream, liveVideoRef } = useRecorder();
  const tracker = useEventTrackerOptional();
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
    tracker?.track('kyc_identity_verify_submit');

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
        tracker?.track('kyc_identity_verified', { similarity: similarityValue });
        setVerifyState('matched');
      } else {
        tracker?.track('kyc_identity_rejected', { similarity: similarityValue });
        setVerifyState('nomatch');
      }
    } catch {
      setVerifyError('No pudimos verificar tu identidad. Intenta nuevamente.');
      setVerifyState('error');
    }
  };

  const retakeFromSelfie = () => {
    tracker?.track('kyc_selfie_retake');
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
        tracker?.track('kyc_camera_granted', { kind: mode === 'user' ? 'selfie' : 'dni' });
      } catch (err) {
        setError(cameraErrorMessage(err));
        tracker?.track('kyc_camera_denied', { kind: mode === 'user' ? 'selfie' : 'dni' });
      }
    },
    [requestCamera, tracker]
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
    if (phase === 'selfie') tracker?.track('kyc_selfie_retake');
    else if (phase === 'dni') tracker?.track('kyc_dni_retake');
    if (phase !== 'review') openCamera(PHASE_CONFIG[phase].facingMode);
  }

  function handleUsePhoto() {
    if (!pendingShot) return;
    if (phase === 'selfie') {
      setSelfieShot(pendingShot);
      setPendingShot(null);
      tracker?.track('kyc_selfie_captured');
      setPhase('dni');
    } else if (phase === 'dni') {
      setDniShot(pendingShot);
      setPendingShot(null);
      tracker?.track('kyc_dni_captured');
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] border border-[#e5e7eb]">
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
            <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] border border-[#e5e7eb]">
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
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-[#1f2937]">{config.title}</h2>
        <p className="text-[#6b7280] text-sm">{config.guide}</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-[#ef4444]">
          <span className="flex-1">{error}</span>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {pendingShot ? (
        <>
          <div className={`relative rounded-xl overflow-hidden bg-black ${config.aspect} border border-[#e5e7eb]`}>
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
          <div className={`relative rounded-xl overflow-hidden bg-black ${config.aspect} border border-[#e5e7eb]`}>
            <video ref={liveVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={handleCapture}
            className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Capturar
          </button>
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
