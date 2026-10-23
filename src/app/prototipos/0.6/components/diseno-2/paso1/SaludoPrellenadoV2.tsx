'use client';

/**
 * Saludo bajo el número de documento cuando el lookup encontró a la persona
 * (BAL-4963). Una fila limpia, pegada al campo:
 *
 *   (M✓)  ¡Hola, María! 👋                      ¿No eres tú?
 *         Ya tenemos algunos de tus datos.
 *
 * - Fondo muy suave del color de la landing y radio `rounded-xl` (el mismo
 *   del envoltorio `.campo-v2`); sin borde.
 * - Círculo de 36 px con la inicial, en el color de la landing, y un check
 *   chico encima como confirmación.
 * - "¿No eres tú?" es un botón de texto discreto (subrayado solo al pasar el
 *   puntero, 44 px de toque) que corrige el documento. Lo maneja quien lo
 *   monta (`DocumentNumberField`): borra el número, el prefill y los campos
 *   que llenó, y devuelve el foco al campo. En celular, si no entra, baja
 *   debajo del texto.
 * - Entra con un fundido de 6 px hacia arriba (200 ms); con
 *   `prefers-reduced-motion`, sin movimiento (`globals.css`).
 */

import React from 'react';
import { Check } from 'lucide-react';

export function SaludoPrellenadoV2({
  nombre,
  esDni,
  onCorregir,
}: {
  /** Primer nombre, ya con mayúscula inicial (`nombreDelSaludo`). */
  nombre: string;
  /** "corregir mi DNI" con DNI; "corregir mi documento" con CE o pasaporte. */
  esDni: boolean;
  /**
   * Sin `onCorregir` no hay botón: el documento está bloqueado (puerta VIP o
   * lead de un socio) y no se puede corregir desde acá.
   */
  onCorregir?: () => void;
}) {
  const inicial = nombre.trim().charAt(0).toLocaleUpperCase('es-PE');
  return (
    <div
      data-saludo-v2
      className="d2-saludo mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-xl bg-[rgba(var(--color-primary-rgb),0.07)] px-3 py-2.5"
    >
      <span
        aria-hidden
        className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] font-['Baloo_2',_sans-serif] text-base font-bold leading-none text-[var(--color-on-primary)]"
      >
        {inicial}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0E8C78] ring-2 ring-white">
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
        </span>
      </span>
      <div role="status" className="min-w-[11rem] flex-1">
        <p className="text-base font-bold leading-snug text-[#1E2230]">¡Hola, {nombre}! 👋</p>
        <p className="text-sm leading-snug text-[#5B6275]">Ya tenemos algunos de tus datos.</p>
      </div>
      {onCorregir && (
        <button
          type="button"
          onClick={onCorregir}
          aria-label={esDni ? 'No soy yo, corregir mi DNI' : 'No soy yo, corregir mi documento'}
          className="-my-1.5 ml-12 inline-flex min-h-[44px] items-center rounded-lg px-1 text-sm font-semibold text-[var(--color-primary-text)] cursor-pointer hover:underline hover:underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] sm:ml-0"
        >
          ¿No eres tú?
        </button>
      )}
    </div>
  );
}

export default SaludoPrellenadoV2;
