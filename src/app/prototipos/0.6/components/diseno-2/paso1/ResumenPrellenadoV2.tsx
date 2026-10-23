'use client';

/**
 * Los datos que llenó el prefill, en una línea (BAL-4963, punto 2).
 *
 * En Diseño 1 esos campos quedan escondidos sin más. En Diseño 2 se muestran
 * como un resumen compacto con "Corregir", que los abre como inputs normales.
 * El diseño de este caso no lo hizo Brenda: es la caja neutra del kit (F2),
 * con el mismo enlace de marca que "+ Agregar".
 */

import React from 'react';

export function ResumenPrellenadoV2({
  texto,
  onCorregir,
}: {
  texto: string;
  onCorregir: () => void;
}) {
  return (
    <div
      data-resumen-prellenado-v2
      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-[10px] border-[1.5px] border-[#C9CEF0] bg-[#F7F8FD] px-3.5 py-3"
    >
      <p className="min-w-0 text-sm leading-snug text-[#1E2230]">
        <span className="font-bold text-[#262C66]">Tus datos: </span>
        {texto}
      </p>
      <button
        type="button"
        onClick={onCorregir}
        className="-my-3 inline-flex min-h-[44px] items-center px-1 -mx-1 cursor-pointer rounded text-sm font-bold text-[var(--color-primary)] underline underline-offset-2 hover:text-[color-mix(in_srgb,var(--color-primary)_80%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        Corregir
      </button>
    </div>
  );
}

export default ResumenPrellenadoV2;
