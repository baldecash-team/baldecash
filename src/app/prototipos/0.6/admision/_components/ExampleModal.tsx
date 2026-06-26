'use client';

import { useEffect } from 'react';

interface ExampleModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text: string;
}

/**
 * Modal de "Ver ejemplo" por pregunta de video (mejora #8). Muestra texto guía.
 * Accesible: cierra por backdrop, botón y tecla Escape.
 */
export function ExampleModal({ open, onClose, title, text }: ExampleModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-5 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-[#1f2937]">{title}</h3>
          <button
            type="button"
            aria-label="Cerrar"
            className="text-[#6b7280] hover:text-[#1f2937] transition-colors"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">{text}</p>
        <button
          type="button"
          className="mt-1 w-full bg-[#4654CD] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
          onClick={onClose}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
