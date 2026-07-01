'use client';

import { useEffect } from 'react';

/** Contenido del ejemplo de una pregunta de video (mejora #8). */
export interface VideoExample {
  /** Indicación breve de qué decir. */
  intro: string;
  /** Frase de ejemplo, tal como podría decirla la persona. */
  quote?: string;
  /** Tip opcional para dar confianza. */
  tip?: string;
  /** URL de video de ejemplo (cuando existe, reemplaza al quote). */
  videoUrl?: string;
}

interface ExampleModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  example: VideoExample;
}

/**
 * Modal de "Ver ejemplo" por pregunta de video (mejora #8).
 * Accesible: cierra por backdrop, botón y tecla Escape.
 */
export function ExampleModal({ open, onClose, title, example }: ExampleModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-[#f1f1f4]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#ECECFB] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#4654CD]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
              </svg>
            </span>
            <h3 className="text-base font-bold text-[#1f2937]">{title}</h3>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            className="text-[#9ca3af] hover:text-[#1f2937] transition-colors cursor-pointer"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="px-5 py-4 flex flex-col gap-3.5">
          <p className="text-sm text-[#6b7280] leading-relaxed">{example.intro}</p>

          {/* Frase de ejemplo destacada */}
          <figure className="rounded-xl bg-[#F7F7FB] border border-[#ECECFB] px-3.5 py-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#4654CD] mb-1">
              Ejemplo
            </span>
            {example.videoUrl ? (
              <video src={example.videoUrl} controls playsInline className="w-full rounded-lg" />
            ) : example.quote ? (
              <blockquote className="text-sm text-[#1f2937] leading-relaxed italic">
                {'"'}{example.quote}{'"'}
              </blockquote>
            ) : null}
          </figure>

          {example.tip && (
            <div className="flex items-start gap-2 text-xs text-[#6b7280]">
              <svg viewBox="0 0 24 24" className="w-4 h-4 mt-0.5 shrink-0 text-[#16a34a]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{example.tip}</span>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="px-5 pb-5 pt-1">
          <button
            type="button"
            className="w-full bg-[#4654CD] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm cursor-pointer"
            onClick={onClose}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
