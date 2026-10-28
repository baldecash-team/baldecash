'use client';

/**
 * Barra fija abajo del Paso 4, solo en celular (BAL-4959, prototipo de Brenda).
 *
 * Como en el prototipo: "‹" (Atrás, botón cuadrado con contorno), la cuota
 * total y la acción ("Continuar" / "Enviar…"), en una sola fila. Los pasos 1
 * a 3 no la usan: ahí Atrás y Continuar van en línea bajo la tarjeta.
 *
 * Se esconde mientras el teclado está abierto —mismo motivo que
 * `MobileStickyCta`: un `fixed bottom` queda detrás del teclado o tapa el
 * campo— y durante la transición entre pasos.
 */

import React from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { BOTON_ATRAS_V2 } from './campos/estilosV2';
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
  /** Leyenda sobre el total ("Cuota mensual total" o "Desde {mes}" con pago diferido). */
  leyendaTotal?: string;
  /** Atrás (o "Volver" a la vista 1 del Paso 4). */
  atras?: { texto: string; onClick: () => void } | null;
}

/**
 * "S/159/mes" → ["S/159", "/mes"]: el sufijo de la frecuencia va más chico,
 * como en el panel, para que el monto entre entero en 360 px.
 */
export function partirTotal(total: string): [string, string] {
  const m = total.match(/^(.*?\d)(\/[^\d]*)$/);
  return m ? [m[1], m[2]] : [total, ''];
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
  atras,
  leyendaTotal = 'Cuota mensual total',
}: BarraInferiorV2Props) {
  const teclado = useTecladoVirtualAbierto();
  if (oculto || teclado || !onPrimary) return null;
  const deshabilitado = isSubmitting || isBusy || !canProceed;
  const texto = isSubmitting ? submitMessage || 'Enviando…' : textoPropio || (isLastStep ? 'Enviar solicitud' : 'Continuar');
  const [monto, sufijo] = partirTotal(total ?? '');

  return (
    <div
      data-barra-inferior-v2
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[var(--d2-borde)] bg-[var(--d2-tarjeta)] px-4 pt-3"
      style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center gap-2.5">
        {atras && (
          <button
            type="button"
            data-atras-v2
            onClick={atras.onClick}
            disabled={isSubmitting || isBusy}
            aria-label={atras.texto}
            className={`${BOTON_ATRAS_V2} w-[52px]`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
        )}
        {/* El monto nunca se corta (verificación final, BAL-4969: salía
            «S/159/m…» a 390). Si falta espacio, cede el texto del botón. */}
        {total && (
          <div data-total-barra className="flex-1">
            <p className="text-xs leading-tight text-[var(--d2-texto-suave)]">{leyendaTotal}</p>
            <p className="whitespace-nowrap font-['Baloo_2',_sans-serif] text-[20px] min-[375px]:text-[22px] font-bold leading-[1.1] text-[var(--color-primary-text)]">
              {monto}
              {sufijo && <span className="text-sm font-semibold">{sufijo}</span>}
            </p>
          </div>
        )}
        <button
          type="button"
          data-continuar-v2
          onClick={onPrimary}
          disabled={deshabilitado}
          className={`campo-v2-cta flex min-h-[52px] ${total ? 'min-w-0 px-4 min-[375px]:px-[18px]' : 'flex-1'} items-center justify-center gap-2 rounded-xl text-base font-bold shadow-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
            deshabilitado ? 'bg-[var(--d2-boton-apagado)] text-[var(--d2-boton-apagado-texto)] shadow-none cursor-not-allowed' : 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:brightness-90 cursor-pointer'
          }`}
        >
          {(isSubmitting || isBusy) && <span className="h-5 w-5 animate-spin motion-reduce:animate-none rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
          <span className="truncate">{texto}</span>
          {/* Enviar va sin flecha, como en el prototipo (`ctaLabelM`). */}
          {!isSubmitting && !isLastStep && <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />}
        </button>
      </div>
    </div>
  );
}

export default BarraInferiorV2;
