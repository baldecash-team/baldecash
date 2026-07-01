'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { VideoIntro } from './VideoIntro';
import { VideoConfirm } from './VideoConfirm';
import { VideoRecorder } from './VideoRecorder';
import { AdvisorButton } from './AdvisorButton';
import { PhoneFrame } from './PhoneFrame';
import { ErrorBanner } from './ErrorBanner';
import type { VideoExample } from './ExampleModal';
import type { VideoQuestion } from '../_lib/api/types';
import { requestUploadUrl, confirmUpload, completeLink } from '../_lib/api/links';
import { uploadFile } from '../_lib/upload';
import { admissionEvents } from '../_lib/events';
import { friendlyError } from '../_lib/errors';
import { loadProgress, saveProgress, clearProgress } from '../_lib/videoProgress';

type FlowState = 'intro' | 'capture' | 'uploading' | 'completing' | 'confirmed';

interface VideoFlowProps {
  token: string;
  documentTypeCodes: string[];
  /** Preguntas personalizadas provenientes del LinkContext (snapshot del banco). */
  questions?: VideoQuestion[];
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

/**
 * Resuelve la pregunta y el ejemplo para el índice dado.
 * Prioridad: questions[index] → documentTypeCodes + pregunta hardcodeada.
 */
export function resolveQuestion(
  questions: VideoQuestion[],
  documentTypeCodes: string[],
  index: number,
): { code: string; text: string; example?: VideoExample } {
  const q = questions[index];
  if (q) {
    return {
      code: q.code,
      text: q.description,
      example: q.example_video_url
        ? { intro: 'Mira este ejemplo:', videoUrl: q.example_video_url }
        : undefined,
    };
  }
  const code = documentTypeCodes[index] ?? `video_negocio_${index + 1}`;
  return {
    code,
    text: BUSINESS_QUESTIONS[index] ?? `Cuéntanos (video ${index + 1})`,
    example: QUESTION_EXAMPLES[index],
  };
}

export function VideoFlow({ token, documentTypeCodes, questions = [], applicantName, onDone }: VideoFlowProps) {
  const [state, setState] = useState<FlowState>('intro');
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  // Un solo error a la vez (cámara, formato o subida), con su ícono.
  const [error, setError] = useState<{ msg: string; icon?: 'alert' | 'camera' } | null>(null);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy_m?: number } | null>(null);

  // El número de videos lo marcan questions (si las hay), luego document_type_codes,
  // y como último recurso las preguntas de negocio hardcodeadas (evita "PREGUNTA 1 DE 0").
  const total = questions.length || documentTypeCodes.length || BUSINESS_QUESTIONS.length;
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

  // Reanudación con ventana de 10 min: si hay avance vigente para este token,
  // retomamos en esa pregunta tras el gate de ubicación del intro (no antes:
  // la ubicación se reconfirma cada sesión). El índice se resuelve en el mount.
  const resumeIndexRef = useRef(0);
  const resumedRef = useRef(false);

  useEffect(() => {
    events.stageEnter('intro');
    const saved = loadProgress(token);
    if (saved && saved.index > 0 && saved.index < total) {
      resumeIndexRef.current = saved.index;
      resumedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStart(c: { latitude: number; longitude: number; accuracy_m?: number }) {
    setCoords(c);
    setIndex(resumeIndexRef.current);
    goStage('capture');
  }

  async function handleCaptured(file: File) {
    const i = index;
    const code = resolveQuestion(questions, documentTypeCodes, i).code;

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
        setError({ msg: friendlyError(urlResult.error) });
        goStage('capture');
        return;
      }

      const { upload_url, content_type, file_key } = urlResult.data;

      await uploadFile(upload_url, file, content_type, setProgress);

      const confirmResult = await confirmUpload(token, { file_key, document_type_code: code });

      if (!confirmResult.ok) {
        setError({ msg: friendlyError(confirmResult.error) });
        goStage('capture');
        return;
      }

      const nextIndex = i + 1;

      if (nextIndex < total) {
        saveProgress(token, nextIndex);
        setIndex(nextIndex);
        setProgress(0);
        goStage('capture');
      } else {
        goStage('completing');
        const completeResult = await completeLink(token, {
          latitude: coords!.latitude,
          longitude: coords!.longitude,
          accuracy_m: coords?.accuracy_m,
        });
        if (!completeResult.ok) {
          setError({ msg: friendlyError(completeResult.error) });
          goStage('capture');
          return;
        }
        clearProgress(token);
        goStage('confirmed');
        events.completed();
        onDone?.();
      }
    } catch {
      setError({ msg: 'Ocurrió un error al subir el video. Inténtalo de nuevo.' });
      goStage('capture');
    }
  }

  return (
    <PhoneFrame>
      {/* ── intro ────────────────────────────────────────────────────────── */}
      {state === 'intro' && (
        <VideoIntro applicantName={applicantName} onStart={handleStart} />
      )}

      {/* ── capture ──────────────────────────────────────────────────────── */}
      {state === 'capture' && (
        <div className="flex flex-col gap-5">
          {applicantName && (
            <p className="text-[#6b7280] text-sm">
              {applicantName}, responde esta pregunta con un video corto.
            </p>
          )}

          {(() => {
            const { text: questionText, example } = resolveQuestion(questions, documentTypeCodes, index);
            return (
              <VideoRecorder
                question={questionText}
                example={example}
                index={index}
                total={total}
                onCaptured={handleCaptured}
                onError={(msg, opts) => setError(msg ? { msg, icon: opts?.icon } : null)}
                autoStart={cameraGranted}
                onCameraReady={() => setCameraGranted(true)}
              />
            );
          })()}

          {error && <ErrorBanner message={error.msg} icon={error.icon} />}

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
