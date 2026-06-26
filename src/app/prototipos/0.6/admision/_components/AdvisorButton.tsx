'use client';

import { BLIP_ADVISOR_URL } from './tokens';

interface AdvisorButtonProps {
  /** `inline` = enlace de texto ancho completo (dentro del flujo). `solid` = botón primario. */
  variant?: 'inline' | 'solid';
  label?: string;
}

/**
 * Botón "Habla con un asesor" (mejora #7): abre el chat de Blip/WhatsApp en una pestaña nueva.
 */
export function AdvisorButton({ variant = 'inline', label = '¿Necesitas ayuda? Habla con un asesor' }: AdvisorButtonProps) {
  const className =
    variant === 'solid'
      ? 'inline-flex items-center justify-center gap-2 w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity'
      : 'inline-flex items-center justify-center gap-2 w-full text-[#6b7280] hover:text-[#4654CD] font-medium text-sm transition-colors py-2';

  return (
    <a href={BLIP_ADVISOR_URL} target="_blank" rel="noopener noreferrer" className={className}>
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      {label}
    </a>
  );
}
