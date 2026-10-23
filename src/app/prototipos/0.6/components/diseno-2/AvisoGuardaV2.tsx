'use client';

/**
 * Aviso de una guarda del paso en Diseño 2 (BAL-4969, casuísticas): sin
 * equipo, sin stock, falta el cupón, plazos distintos o cuota sobre el tope.
 *
 * Va DENTRO del paso, con los mismos colores del aviso de errores de Diseño 2
 * (`AvisoV2`), y trae la acción que destraba. Nunca manda a la intro de
 * Diseño 1, que en Diseño 2 no existe.
 *
 * También sirve para avisos que no bloquean (cupo de la campaña lleno), con
 * `tono="info"` y sin acción.
 */

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export interface AvisoGuardaV2Props {
  titulo: string;
  mensaje: string;
  accion?: { texto: string; onClick: () => void } | null;
  /** `alerta` (bloquea) o `info` (solo avisa). */
  tono?: 'alerta' | 'info';
  className?: string;
}

export function AvisoGuardaV2({ titulo, mensaje, accion, tono = 'alerta', className = '' }: AvisoGuardaV2Props) {
  const alerta = tono === 'alerta';
  const Icono = alerta ? AlertTriangle : Info;
  return (
    <div
      role={alerta ? 'alert' : 'status'}
      data-aviso-guarda-v2
      className={`rounded-xl border p-3 sm:p-4 font-['Asap',_sans-serif] ${
        alerta ? 'border-[#F2B79A] bg-[#FFF1EB]' : 'border-amber-300 bg-amber-50'
      } ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <Icono className={`mt-0.5 h-5 w-5 shrink-0 ${alerta ? 'text-[#C2410C]' : 'text-amber-700'}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[#1E2230]">{titulo}</p>
          <p className="mt-0.5 text-[13px] leading-snug text-[#3A4052]">{mensaje}</p>
        </div>
      </div>
      {accion && (
        <button
          type="button"
          onClick={accion.onClick}
          className="mt-3 inline-flex min-h-[44px] items-center rounded-full border-[1.5px] border-[var(--color-primary)] bg-white px-4 text-sm font-bold text-[var(--color-primary-text)] cursor-pointer hover:bg-[#F3F5FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
        >
          {accion.texto}
        </button>
      )}
    </div>
  );
}

export default AvisoGuardaV2;
