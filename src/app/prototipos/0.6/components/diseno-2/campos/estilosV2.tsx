'use client';

/**
 * Kit de campos de Diseño 2 (BAL-4960): la variante visual de cada campo.
 *
 * Los campos de siempre (`TextInput`, `SelectInput`, `SegmentedControl`,
 * `CheckboxField`…) leen `useCamposV2()` y, si es `true`, cambian SOLO sus
 * clases: la validación, el valor y los eventos son los mismos en los dos
 * diseños. Quien prende la variante es `DynamicWizardStep` en Diseño 2
 * (`camposTocados` presente), con `CamposV2Provider` alrededor de sus campos.
 * Fuera de ese proveedor —Diseño 1, el contrato, cualquier otro uso— el
 * valor es `false` y el DOM queda exactamente como antes.
 *
 * Valores: prototipo de Brenda (2026-10-20) y brief F2. El color de marca es
 * el de la landing (`var(--color-primary)`, #4654CD por defecto; I5 BAL-4969).
 */

import React, { createContext, useContext } from 'react';

const CamposV2Context = createContext(false);

export function CamposV2Provider({ children }: { children: React.ReactNode }) {
  return <CamposV2Context.Provider value>{children}</CamposV2Context.Provider>;
}

/** `true` dentro de un paso de Diseño 2. */
export function useCamposV2(): boolean {
  return useContext(CamposV2Context);
}

export const COLOR_V2 = {
  marca: 'var(--color-primary)',
  neutro: '#C9CEF0',
  error: '#C2410C',
  errorTexto: '#B23C0A',
  correcto: '#0E8C78',
  etiqueta: '#262C66',
  texto: '#1E2230',
  gris: '#5B6275',
} as const;

/** Etiqueta arriba del campo (15px, negrita). */
export const ETIQUETA_V2 = 'flex items-center gap-1.5 text-[15px] font-bold leading-snug text-[#262C66]';
/** "(opcional)" al lado de la etiqueta. */
export const OPCIONAL_V2 = 'text-[13px] font-normal text-[#5B6275]';
/** Mensaje de error bajo el campo. */
export const ERROR_V2 = 'text-[13px] leading-snug text-[#B23C0A]';
/** Pista (`hint`) bajo el campo. */
export const PISTA_V2 = 'text-[13px] leading-snug text-[#5B6275]';
/** La caja del campo: 50px, radio 10px, borde 1.5px. El color lo pone `bordeV2`. */
export const CAJA_V2 = 'h-[50px] rounded-[10px] border-[1.5px] bg-white transition-colors duration-150';
/** Prefijo "+51" / "S/": bloque pegado al borde izquierdo de la caja. */
export const PREFIJO_V2 =
  'flex h-full flex-shrink-0 select-none items-center self-stretch border-r border-[rgba(var(--color-primary-rgb),0.18)] bg-[rgba(var(--color-primary-rgb),0.07)] px-3 text-base font-semibold text-[color-mix(in_srgb,var(--color-primary)_80%,black)]';
/** Placeholder gris. */
export const PLACEHOLDER_V2 = 'placeholder:text-[#8A90A2]';

export interface EstadoCajaV2 {
  error?: boolean;
  foco?: boolean;
  correcto?: boolean;
}

/** Color del borde: error > foco > correcto > neutro. */
export function bordeV2({ error, foco, correcto }: EstadoCajaV2): string {
  if (error) return 'border-[#C2410C]';
  if (foco) return 'border-[var(--color-primary)]';
  if (correcto) return 'border-[#0E8C78]';
  return 'border-[#C9CEF0]';
}

/** Botón-chip de una opción (tipo de documento, situación…): alto ≥44px. */
export function chipV2(seleccionado: boolean): string {
  return [
    'min-h-[48px] rounded-[10px] border-[1.5px] px-2 text-sm leading-tight transition-colors duration-150 cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
    seleccionado
      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] font-bold text-white'
      : 'border-[var(--color-primary)] bg-white font-semibold text-[var(--color-primary)] hover:bg-[rgba(var(--color-primary-rgb),0.07)]',
  ].join(' ');
}

/** "(opcional)" en minúscula, como en el prototipo. */
export function MarcaOpcionalV2() {
  return <span className={OPCIONAL_V2}>(opcional)</span>;
}

/** El error de un campo en Diseño 2: texto plano, sin ícono. */
export function ErrorCampoV2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <p id={id} role="alert" className={ERROR_V2}>
      {children}
    </p>
  );
}
