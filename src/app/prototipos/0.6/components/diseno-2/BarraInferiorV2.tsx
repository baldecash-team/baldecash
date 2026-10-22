'use client';

/**
 * Acción principal fija abajo, solo en celular (BAL-4959).
 *
 * "Continuar" va a todo lo ancho; "Atrás" queda como enlace en el flujo de la
 * página (lo pone `ShellV2`). En el paso que envía, a la izquierda va la cuota
 * total, como en el Paso 4 del prototipo.
 *
 * Se esconde mientras el teclado está abierto —mismo motivo que
 * `MobileStickyCta`: un `fixed bottom` queda detrás del teclado o tapa el
 * campo— y durante la transición entre pasos.
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTecladoVirtualAbierto } from '@/app/prototipos/0.6/[landing]/solicitar/hooks/useTecladoVirtualAbierto';

export interface BarraInferiorV2Props {
  onPrimary?: () => void;
  isLastStep?: boolean;
  /** Se está creando la solicitud. */
  isSubmitting?: boolean;
  submitMessage?: string;
  /** Solo navega (complementos): espera sin decir "Enviando". */
  isBusy?: boolean;
  canProceed?: boolean;
  oculto?: boolean;
  /** Cuota total ya formateada, para el paso que envía. */
  total?: string;
  /** Texto del botón en lugar de "Continuar" / "Enviar solicitud". */
  texto?: string;
}

/** Alto reservado para que la barra no tape el final de la página. */
export function BarraInferiorV2Spacer() {
  return <div className="lg:hidden" style={{ height: 'calc(80px + env(safe-area-inset-bottom))' }} aria-hidden />;
}

export function BarraInferiorV2({
  onPrimary,
  isLastStep = false,
  isSubmitting = false,
  submitMessage,
  isBusy = false,
  canProceed = true,
  oculto = false,
  total,
  texto: textoPropio,
}: BarraInferiorV2Props) {
  const teclado = useTecladoVirtualAbierto();
  if (oculto || teclado || !onPrimary) return null;
  const deshabilitado = isSubmitting || isBusy || !canProceed;
  const texto = isSubmitting ? submitMessage || 'Enviando…' : textoPropio || (isLastStep ? 'Enviar solicitud' : 'Continuar');

  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#E3E6EE] bg-white px-4 pt-3"
      style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center gap-3">
        {isLastStep && total && (
          <div className="min-w-0 shrink-0">
            <p className="text-[11px] text-[#5B6275]">Cuota total</p>
            <p className="font-['Baloo_2',_sans-serif] text-lg font-bold leading-none text-[var(--color-primary)]">{total}</p>
          </div>
        )}
        <button
          type="button"
          data-continuar-v2
          onClick={onPrimary}
          disabled={deshabilitado}
          className={`campo-v2-cta flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl text-base font-bold text-white shadow-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
            deshabilitado ? 'bg-neutral-300 text-neutral-500 shadow-none cursor-not-allowed' : 'bg-[var(--color-primary)] hover:brightness-90 cursor-pointer'
          }`}
        >
          {(isSubmitting || isBusy) && <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
          <span className="truncate">{texto}</span>
          {!isSubmitting && <ArrowRight className="h-5 w-5" aria-hidden />}
        </button>
      </div>
    </div>
  );
}

export default BarraInferiorV2;
