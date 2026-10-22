'use client';

/**
 * "¡Hola, {Nombre}! ✓ · ¿No eres tú? Corrige tu DNI" (BAL-4963).
 *
 * Va bajo el número de documento cuando el lookup encontró a la persona. El
 * enlace lo maneja quien lo monta (`DocumentNumberField`): borra el número,
 * el prefill y los campos que llenó, y devuelve el foco al campo.
 */

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/** Área de toque de 44px sin agrandar la línea: el margen negativo la compensa. */
const TOQUE_44 = 'inline-flex min-h-[44px] items-center -my-3 px-1 -mx-1';

export function SaludoPrellenadoV2({
  nombre,
  esDni,
  onCorregir,
}: {
  nombre: string;
  /** "Corrige tu DNI" con DNI; "Corrige tu documento" con CE o pasaporte. */
  esDni: boolean;
  /**
   * Sin `onCorregir` no hay enlace: el documento está bloqueado (puerta VIP o
   * lead de un socio) y no se puede corregir desde acá.
   */
  onCorregir?: () => void;
}) {
  return (
    <div data-saludo-v2 className="mt-2 rounded-[10px] bg-[#E8F7F2] px-3.5 py-3 text-[#0B5E4F]">
      <p role="status" className="flex items-center gap-1.5 text-[15px] font-bold leading-snug">
        ¡Hola, {nombre}!
        <CheckCircle2 className="h-[18px] w-[18px] text-[#0E8C78]" aria-hidden />
      </p>
      {onCorregir && (
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-sm leading-snug">
          ¿No eres tú?
          <button
            type="button"
            onClick={onCorregir}
            className={`${TOQUE_44} cursor-pointer rounded font-bold underline underline-offset-2 hover:text-[#08473C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4654CD]`}
          >
            {esDni ? 'Corrige tu DNI' : 'Corrige tu documento'}
          </button>
        </p>
      )}
    </div>
  );
}

export default SaludoPrellenadoV2;
