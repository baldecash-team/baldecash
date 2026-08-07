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
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRecorder } from '@/app/prototipos/0.6/admision/_hooks/useRecorder';
import { cameraErrorMessage } from '@/app/prototipos/0.6/admision/_lib/cameraError';
import {
  compareFaces,
  dataUrlToBlob,
  getKycUploadUrl,
  uploadToS3,
  verifyDni,
  type CompareFacesResult,
  type VerifyDniResult,
} from '@/app/prototipos/0.6/services/kycApi';
import { useKycTracker, type KycTrack } from '../useKycTracker';
import { kycBypassHabilitado } from '@/app/prototipos/0.6/utils/utmParams';

export interface DniSelfieStepProps {
  onDone: () => void;
  onBack?: () => void;
  /** application_code, usado para pedir las URLs presignadas de S3. */
  applicationCode?: string;
  /**
   * DNI del titular, si ya se conoce (wizard o modal de pausa). Cuando falta,
   * el paso lo pide: `verify-dni` lo necesita para saber QUÉ número buscar en
   * la foto, y de paso vale como prueba de titularidad para guardar el avance.
   */
  documentNumber?: string;
  /** Avisa el DNI que el backend aceptó, para reusarlo en el resto del KYC. */
  onDniVerified?: (dni: string) => void;
  /** Emisor de eventos alternativo (ruta tokenizada /kyc/[token]); ver useKycTracker. */
  onTrack?: KycTrack;
}

/** Qué se le muestra al postulante cuando la verificación no pasa. */
interface Failure {
  title: string;
  detail: string;
  /** Consejos accionables; vacío cuando el fallo no depende de la foto. */
  tips: string[];
  /**
   * Acción principal. `retake` cuando hay que repetir las fotos y `retry`
   * cuando reintentar con las MISMAS sirve (red, saturación del servicio).
   * Distinguirlas importa: ofrecer "Reintentar" ante una foto sin rostro
   * invita a repetir una llamada que no puede funcionar.
   */
  primary: 'retake' | 'retry';
  /**
   * Identifica la causa para el evento de bypass. Sin esto no se puede
   * distinguir "siguio porque el servicio no pudo leer" de "siguio aunque los
   * rostros no coincidian", que son dos riesgos muy distintos.
   */
  reason?: string;
}

const TIPS_DOCUMENTO = [
  'Usa el frente del DNI, no el reverso.',
  'Que se lea el número, sin reflejos ni sombras.',
  'Apoya el documento en una superficie plana y llena el marco.',
];

const TIPS_ROSTRO = [
  'Busca un lugar con buena luz, de frente a la cámara.',
  'Sin lentes, gorra ni mascarilla.',
  'Que tu rostro entre completo en el óvalo.',
];

/**
 * Falla a mostrar cuando `verify-dni` no dio `verified`. Exportada para poder
 * probar la decisión sin montar el componente: llegar a esta rama exige pasar
 * por dos capturas de cámara, que jsdom no tiene.
 */
export function documentFailure(res: VerifyDniResult): Failure {
  if (!res.success) {
    if (res.reason === 'ownership_check_failed') {
      return {
        title: 'El DNI no coincide con la solicitud',
        detail: 'El número ingresado no es el del titular de esta solicitud.',
        tips: [], primary: 'retry', reason: 'ownership_check_failed',
      };
    }
    if (res.reason === 'ownership_locked' || res.reason === 'rate_limited') {
      return {
        title: 'Demasiados intentos',
        detail: 'Espera unos minutos antes de volver a intentarlo.',
        tips: [], primary: 'retry', reason: 'rate_limited',
      };
    }
    return {
      title: 'No pudimos validar tu documento',
      detail: res.error || 'Intenta nuevamente.',
      tips: [], primary: 'retry', reason: 'request_failed',
    };
  }
  if (res.status === 'not_found') {
    return {
      title: 'Esa foto no es tu DNI',
      detail: 'No encontramos tu número de documento en la imagen. Asegúrate de fotografiar tu propio DNI.',
      tips: TIPS_DOCUMENTO, primary: 'retake', reason: 'documento_no_coincide',
    };
  }
  return {
    title: 'No pudimos leer tu DNI',
    detail: res.status === 'low_confidence'
      ? 'La foto se ve borrosa y no podemos confirmar el número.'
      : 'La imagen no se pudo leer.',
    tips: TIPS_DOCUMENTO, primary: 'retake',
    reason: res.status === 'low_confidence' ? 'documento_baja_confianza' : 'documento_ilegible',
  };
}

/** Falla a mostrar cuando la comparación facial no pasa. Ver `documentFailure`. */
export function faceFailure(res: CompareFacesResult): Failure {
  if (!res.success) {
    // `InvalidParameterException` = Rekognition no halló un rostro. Repetir la
    // llamada con la misma imagen daría el mismo error, así que la acción
    // principal es repetir la foto, no reintentar.
    if (res.error_code === 'InvalidParameterException') {
      return {
        title: 'No encontramos un rostro en la foto',
        detail: 'Necesitamos ver tu cara con claridad para compararla con tu DNI.',
        tips: TIPS_ROSTRO, primary: 'retake', reason: 'rostro_no_detectado',
      };
    }
    return {
      title: 'No pudimos verificar tu identidad',
      detail: res.error || 'Intenta nuevamente en unos segundos.',
      tips: [], primary: 'retry', reason: 'comparacion_fallida',
    };
  }
  const pct = typeof res.similarity === 'number' ? res.similarity : null;
  return {
    title: 'Tu rostro no coincide con el del DNI',
    detail: `No pudimos confirmar que seas la misma persona${
      pct != null ? ` (coincidencia ${pct}%)` : ''
    }.`,
    tips: TIPS_ROSTRO, primary: 'retake', reason: 'rostros_no_coinciden',
  };
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

export function DniSelfieStep({
  onDone, onBack, applicationCode, documentNumber, onDniVerified, onTrack,
}: DniSelfieStepProps) {
  const { stream, requestCamera, stopStream, liveVideoRef, liveActive, playLive } = useRecorder();
  const track = useKycTracker(onTrack);
  // Se resuelve una sola vez al montar: depende del UTM de la sesion, no del
  // render. Va con useState(inicializador) y no useMemo porque toca
  // sessionStorage, que no existe en SSR.
  const [bypassHabilitado] = useState(() =>
    typeof window === 'undefined' ? false : kycBypassHabilitado(),
  );
  const [phase, setPhase] = useState<Phase>('selfie');
  const [selfieShot, setSelfieShot] = useState<string | null>(null);
  const [dniShot, setDniShot] = useState<string | null>(null);
  const [pendingShot, setPendingShot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  type VerifyState =
    | 'idle' | 'uploading' | 'checking-document' | 'verifying' | 'matched' | 'failed';
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);

  // DNI tipeado acá cuando no llegó por props. Solo dígitos: el backend exige 8.
  const [dniInput, setDniInput] = useState('');
  const effectiveDni = (documentNumber || dniInput).replace(/\D/g, '');
  const dniReady = effectiveDni.length === 8;

  const fail = (f: Failure) => {
    setFailure(f);
    setVerifyState('failed');
  };

  const runVerification = async () => {
    if (!selfieShot || !dniShot || !dniReady) return;
    track('kyc_identity_verify_submit', { application_code: applicationCode });

    if (!applicationCode) {
      fail({
        title: 'No pudimos verificar tu identidad',
        detail: 'Falta el código de tu solicitud. Vuelve a entrar desde tu enlace.',
        tips: [], primary: 'retry',
      });
      return;
    }

    setVerifyState('uploading');
    setFailure(null);

    const fallaDeSubida: Failure = {
      title: 'No pudimos subir tus fotos',
      detail: 'Revisa tu conexión e intenta de nuevo. Tus fotos no se perdieron.',
      tips: [], primary: 'retry',
    };

    try {
      const [selfieUploadUrl, dniUploadUrl] = await Promise.all([
        getKycUploadUrl(applicationCode, 'selfie'),
        getKycUploadUrl(applicationCode, 'dni'),
      ]);
      if (!selfieUploadUrl || !dniUploadUrl) { fail(fallaDeSubida); return; }

      const [selfieUploaded, dniUploaded] = await Promise.all([
        uploadToS3(selfieUploadUrl.upload_url, dataUrlToBlob(selfieShot)),
        uploadToS3(dniUploadUrl.upload_url, dataUrlToBlob(dniShot)),
      ]);
      if (!selfieUploaded || !dniUploaded) { fail(fallaDeSubida); return; }

      // ── 1. ¿La segunda foto ES un documento, y el del titular? ───────────
      // Va ANTES de comparar rostros: `compare-faces` solo mira dos caras, así
      // que dos selfies daban 100% y pasaban. Además corta temprano y ahorra
      // la llamada a Rekognition cuando la foto no sirve.
      setVerifyState('checking-document');
      const doc = await verifyDni({
        image: dniUploadUrl.file_url,
        documentNumber: effectiveDni,
        applicationCode,
      });

      if (!doc.success || doc.status !== 'verified') {
        if (doc.success) {
          // Toda la metadata de Textract, no solo el status: sin `occurrences`
          // ni `max_confidence` no se puede saber si el umbral esta mal
          // calibrado o si de verdad la foto era ilegible.
          track('kyc_document_rejected', {
            application_code: applicationCode,
            status: doc.status,
            occurrences: doc.occurrences,
            occurrences_total: doc.occurrences_total,
            min_occurrences: doc.min_occurrences,
            min_confidence: doc.min_confidence,
            max_confidence: doc.max_confidence,
            lines_detected: doc.lines_detected,
          });
        }
        fail(documentFailure(doc));
        return;
      }
      track('kyc_document_verified', {
        application_code: applicationCode,
        status: doc.status,
        occurrences: doc.occurrences,
        occurrences_total: doc.occurrences_total,
        min_occurrences: doc.min_occurrences,
        min_confidence: doc.min_confidence,
        max_confidence: doc.max_confidence,
        lines_detected: doc.lines_detected,
      });
      onDniVerified?.(effectiveDni);

      // ── 2. ¿El rostro de la selfie es el del documento? ──────────────────
      setVerifyState('verifying');
      const res = await compareFaces(selfieUploadUrl.file_url, dniUploadUrl.file_url, undefined, {
        source_key: selfieUploadUrl.key,
        target_key: dniUploadUrl.key,
      });

      if (!res.success) {
        fail(faceFailure(res));
        return;
      }

      const similarityValue = typeof res.similarity === 'number' ? res.similarity : null;
      setSimilarity(similarityValue);
      if (res.is_match) {
        track('kyc_identity_verified', { similarity: similarityValue, application_code: applicationCode });
        setVerifyState('matched');
      } else {
        track('kyc_identity_rejected', { similarity: similarityValue, application_code: applicationCode });
        fail(faceFailure(res));
      }
    } catch {
      fail({
        title: 'No pudimos verificar tu identidad',
        detail: 'Hubo un problema de conexión. Intenta nuevamente.',
        tips: [], primary: 'retry', reason: 'error_de_red',
      });
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
          <div className="space-y-3">
            {/*
              El DNI solo se pide cuando no vino del wizard. Es obligatorio:
              `verify-dni` necesita saber QUÉ número buscar en la foto — sin él
              solo podríamos comprobar que hay "un" documento, no que sea el
              tuyo. De paso es la prueba de titularidad que guarda el avance.
            */}
            {!documentNumber && (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-[#374151]">
                  Número de DNI
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                  value={dniInput}
                  onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="12345678"
                  className="w-full rounded-lg border-2 border-[#e5e7eb] px-3 py-2.5 text-[#1f2937] outline-none transition-colors focus:border-[#4654CD]"
                />
                <span className="block text-xs text-[#6b7280]">
                  Lo comparamos con el que aparece en la foto de tu documento.
                </span>
              </label>
            )}
            <button
              type="button"
              onClick={runVerification}
              disabled={!dniReady}
              className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl transition-opacity cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Verificar identidad
            </button>
          </div>
        )}

        {(verifyState === 'uploading'
          || verifyState === 'checking-document'
          || verifyState === 'verifying') && (
          <div className="flex items-center justify-center gap-2 py-3 text-[#6b7280]">
            <span className="w-5 h-5 rounded-full border-2 border-[#e5e7eb] border-t-[#4654CD] animate-spin" />
            {verifyState === 'uploading' && 'Subiendo imágenes…'}
            {verifyState === 'checking-document' && 'Validando tu documento…'}
            {verifyState === 'verifying' && 'Comparando tu rostro…'}
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

        {verifyState === 'failed' && failure && (
          <div className="space-y-3" role="alert">
            {/*
              El error deja de ser una línea roja suelta y pasa a ser una tarjeta
              con título, explicación y qué hacer. El motivo: los mensajes que
              llegan del OCR y de Rekognition describen la causa técnica ("no se
              detectó un rostro"), no la salida — y sin consejos el postulante
              repite exactamente la misma foto.
            */}
            <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3.5 space-y-2">
              <p className="flex items-start gap-2 font-semibold text-[#b91c1c]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{failure.title}</span>
              </p>
              <p className="text-sm text-[#7f1d1d]">{failure.detail}</p>
              {failure.tips.length > 0 && (
                <ul className="space-y-1 pt-0.5 text-sm text-[#7f1d1d]">
                  {failure.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#b91c1c]" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/*
              La acción principal depende del fallo. Ante una foto que el
              servicio no pudo leer, "Reintentar" repetiría la misma llamada con
              la misma imagen y volvería a fallar, así que ahí manda "Repetir
              fotos"; el reintento solo encabeza cuando la causa es transitoria.
            */}
            {failure.primary === 'retake' ? (
              <button
                type="button"
                onClick={retakeFromSelfie}
                className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Repetir fotos
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={runVerification}
                  className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Reintentar
                </button>
                <button
                  type="button"
                  onClick={retakeFromSelfie}
                  className="w-full border border-[#4654CD] text-[#4654CD] font-semibold py-2 rounded-xl hover:bg-[#ECECFB] transition-colors cursor-pointer"
                >
                  Repetir fotos
                </button>
              </>
            )}

            {/*
              Salida solo para el trafico que llega con el utm_term acordado —el
              parametro de promotor— (ver KYC_BYPASS_UTM_TERM). La medicion sobre 200 DNIs reales
              mostro que ~la mitad del parque no expone su MRZ en el reverso, o
              sea "no pudimos verificar" es un desenlace comun y ajeno al
              solicitante; pero abrir la puerta a todos convertiria el KYC en
              opcional. Se pilotea por campana y se mide con kyc_identity_skipped.
            */}
            {bypassHabilitado && (
              /*
                Separado por una linea y en tono neutro: es una salida, no una
                tercera accion equivalente. Si compitiera visualmente con
                "Repetir fotos" se volveria el camino facil y el KYC quedaria
                de adorno. Y dice que pasa despues, porque "continuar" a secas
                deja creer que la verificacion quedo resuelta.
              */
              <div className="border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    track('kyc_identity_skipped', {
                      application_code: applicationCode,
                      reason: failure.reason ?? 'desconocido',
                      primary: failure.primary,
                    });
                    onDone();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-white py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 cursor-pointer"
                >
                  {/* Borde punteado y gris: se lee como salida, no como la
                      accion principal. Con el mismo peso que "Repetir fotos"
                      seria el camino facil y el KYC quedaria de adorno. */}
                  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                  Continuar sin verificar
                </button>
                <p className="mt-2 flex items-start justify-center gap-1.5 text-center text-xs leading-snug text-neutral-500">
                  <svg aria-hidden viewBox="0 0 24 24" className="mt-px h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8h.01M11 12h1v4h1" />
                  </svg>
                  <span>
                    Seguimos con tu solicitud, pero podríamos pedirte la
                    verificación más adelante.
                  </span>
                </p>
              </div>
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
