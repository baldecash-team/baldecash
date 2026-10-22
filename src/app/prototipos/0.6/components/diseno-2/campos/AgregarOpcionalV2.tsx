'use client';

/**
 * "+ Agregar {campo}" de Diseño 2 (BAL-4960): un campo opcional con
 * `collapsed_optional` se muestra plegado como este enlace. Al tocarlo,
 * `DynamicWizardStep` pinta el campo y le da el foco.
 *
 * Estilo del prototipo ("Agregar celular para llamadas"): enlace de marca,
 * 15px seminegrita, con el signo más; 44px de alto para el dedo.
 */

import React from 'react';
import { Plus } from 'lucide-react';

/**
 * "Celular Secundario" → "Agregar celular secundario". Las siglas (todo en
 * mayúscula, como DNI o RUC) se respetan.
 */
export function textoAgregar(label: string): string {
  const enMinuscula = label
    .trim()
    .split(/\s+/)
    .map((p) => (p.length > 1 && p === p.toLocaleUpperCase('es') && /\p{L}/u.test(p) ? p : p.toLocaleLowerCase('es')))
    .join(' ');
  return `Agregar ${enMinuscula}`;
}

export function AgregarOpcionalV2({ label, onAbrir }: { label: string; onAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-expanded={false}
      className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-lg bg-transparent px-0 text-left text-[15px] font-semibold text-[#3341B8] cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4654CD] focus-visible:ring-offset-2"
    >
      <Plus className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={2.2} aria-hidden />
      {textoAgregar(label)}
    </button>
  );
}

export default AgregarOpcionalV2;
