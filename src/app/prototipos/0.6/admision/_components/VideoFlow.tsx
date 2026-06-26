'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { VideoIntro } from './VideoIntro';
import { VideoConfirm } from './VideoConfirm';
import { VideoRecorder } from './VideoRecorder';
import { AdvisorButton } from './AdvisorButton';
import { PhoneFrame } from './PhoneFrame';
import { ErrorBanner } from './ErrorBanner';
import type { VideoExample } from './ExampleModal';
import { requestUploadUrl, confirmUpload, completeLink } from '../_lib/api/links';
import { uploadFile } from '../_lib/upload';
import { admissionEvents } from '../_lib/events';

type FlowState = 'intro' | 'capture' | 'uploading' | 'completing' | 'confirmed';

interface VideoFlowProps {
  token: string;
  documentTypeCodes: string[];
  /** Nombre del solicitante (mejora #6). */
  applicantName?: string;
  onDone?: () => void;
}

const BUSINESS_QUESTIONS = [
  '¿A qué se dedica tu negocio y desde cuándo?',
  '¿Cómo te va con las ventas? Cuéntanos un estimado de tus ingresos al mes.',
  'Si puedes, muéstranos un poco tu espacio de trabajo.',
];

/** Ejemplo guía por pregunta (mejora #8). Editable. */
const QUESTION_EXAMPLES: VideoExample[] = [
  {
    intro: 'Cuéntalo de forma natural: menciona qué tipo de negocio tienes y desde cuándo.',
    quote: 'Tengo una bodega desde hace 3 años. Vendo abarrotes y productos de limpieza en mi barrio.',
    tip: 'No necesitas un guion: háblanos como si le contaras a un amigo.',
  },
  {
    intro: 'Da un estimado honesto de tus ventas en un mes normal. No hace falta una cifra exacta, basta un rango.',
    quote: 'En un mes normal vendo entre S/4,000 y S/5,000. En campañas como Navidad sube un poco.',
    tip: 'Si tus ventas cambian por temporada, menciónalo.',
  },
  {
    intro: 'Muestra tu espacio con la cámara: el mostrador, los productos, la zona de atención.',
    quote: 'Aquí atiendo a mis clientes; este es mi mostrador y allá guardo el stock.',
    tip: 'No tiene que verse perfecto, solo que se vea tu día a día.',
  },
];

export function VideoFlow({ token, documentTypeCodes, applicantName, onDone }: VideoFlowProps) {
  const [state, setState] = useState<FlowState>('intro');
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cameraGranted, setCameraGranted] = useState(false);

  // El número de videos lo marcan los document_type_codes; si el link no los trae,
  // se cae a la cantidad de preguntas de negocio (evita "PREGUNTA 1 DE 0").
  const total = documentTypeCodes.length > 0 ? documentTypeCodes.length : BUSINESS_QUESTIONS.length;
  const events = useMemo(() => admissionEvents(token), [token]);

  // ── seguimiento de etapas (mejora #10) ──────────────────────────────────────
  const stageRef = useRef<FlowState>('intro');
  function goStage(next: FlowState) {
    if (stageRef.current !== next) {
      events.stageExit(stageRef.current);
      events.stageEnter(next);
      stageRef.current = next;
    }
    setState(next);
  }

  useEffect(() => {
    events.stageEnter('intro');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCaptured(file: File) {
    const i = index;
    const code = documentTypeCodes[i];

    setError(null);
    setProgress(0);
    goStage('uploading');

    try {
      const urlResult = await requestUploadUrl(token, {
        filename: file.name,
        content_type: file.type || 'video/mp4',
        file_size_bytes: file.size,
        document_type_code: code,
      });

      if (!urlResult.ok) {
        setError('No pudimos preparar la subida. Inténtalo de nuevo.');
        goStage('capture');
        return;
      }

      const { upload_url, content_type, file_key } = urlResult.data;

      await uploadFile(upload_url, file, content_type, setProgress);

      const confirmResult = await confirmUpload(token, { file_key, document_type_code: code });

      if (!confirmResult.ok) {
        setError('No pudimos confirmar el video. Inténtalo de nuevo.');
        goStage('capture');
        return;
      }

      const nextIndex = i + 1;

      if (nextIndex < total) {
        setIndex(nextIndex);
        setProgress(0);
        goStage('capture');
      } else {
        goStage('completing');
        const completeResult = await completeLink(token);
        if (!completeResult.ok) {
          setError('No pudimos completar la solicitud. Inténtalo de nuevo.');
          goStage('capture');
          return;
        }
        goStage('confirmed');
        events.completed();
        onDone?.();
      }
    } catch {
      setError('Ocurrió un error al subir el video. Inténtalo de nuevo.');
      goStage('capture');
    }
  }

  return (
    <PhoneFrame>
      {/* ── intro ────────────────────────────────────────────────────────── */}
      {state === 'intro' && (
        <VideoIntro applicantName={applicantName} onStart={() => goStage('capture')} />
      )}

      {/* ── capture ──────────────────────────────────────────────────────── */}
      {state === 'capture' && (
        <div className="flex flex-col gap-5">
          {applicantName && (
            <p className="text-[#6b7280] text-sm">
              {applicantName}, responde esta pregunta con un video corto.
            </p>
          )}

          <VideoRecorder
            question={BUSINESS_QUESTIONS[index] ?? `Cuéntanos (video ${index + 1})`}
            example={QUESTION_EXAMPLES[index]}
            index={index}
            total={total}
            onCaptured={handleCaptured}
            onError={setError}
            autoStart={cameraGranted}
            onCameraReady={() => setCameraGranted(true)}
          />

          {error && <ErrorBanner message={error} />}

          {/* Habla con un asesor → Blip (mejora #7) */}
          <AdvisorButton variant="inline" />
        </div>
      )}

      {/* ── uploading ────────────────────────────────────────────────────── */}
      {state === 'uploading' && (
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="w-12 h-12 rounded-full border-4 border-[#e5e7eb] border-t-[#4654CD] animate-spin" />
          <p className="text-[#1f2937] font-semibold">Subiendo tu video…</p>
          <p className="text-[#6b7280] text-sm text-center">Por favor no cierres esta pantalla.</p>
          <div className="w-full max-w-xs h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
            <div className="h-full bg-[#4654CD] transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[#4654CD] text-sm font-semibold">{progress}%</p>
        </div>
      )}

      {/* ── completing ───────────────────────────────────────────────────── */}
      {state === 'completing' && (
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="w-12 h-12 rounded-full border-4 border-[#e5e7eb] border-t-[#4654CD] animate-spin" />
          <p className="text-[#1f2937] font-semibold">Finalizando…</p>
          <p className="text-[#6b7280] text-sm text-center">Estamos guardando tus videos.</p>
        </div>
      )}

      {/* ── confirmed ────────────────────────────────────────────────────── */}
      {state === 'confirmed' && <VideoConfirm />}
    </PhoneFrame>
  );
}
