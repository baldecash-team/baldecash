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

/**
 * Tarjeta de un bloque del paso (la del marco de `ShellV2`): borde #AEB6EE,
 * radio 2xl y la franja de marca arriba. En el prototipo cada sección del
 * paso va en su propia tarjeta (BAL-4969).
 */
export const TARJETA_V2 = 'rounded-2xl border border-[#AEB6EE] bg-white p-4 sm:p-7';
export const TARJETA_V2_ESTILO = { boxShadow: 'inset 0 4px 0 0 var(--color-primary)' } as const;

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
  'flex h-full flex-shrink-0 select-none items-center self-stretch border-r border-[rgba(var(--color-primary-rgb),0.18)] bg-[rgba(var(--color-primary-rgb),0.07)] px-3 text-base font-semibold text-[color-mix(in_srgb,var(--color-primary-text)_80%,black)]';
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

/**
 * Respuesta al toque de un botón-chip: se hunde un poco (3 %) mientras se
 * presiona. Sin escala con menos movimiento (BAL-4969).
 */
export const PRESION_V2 = 'active:scale-[0.97] motion-reduce:active:scale-100';

/** Botón-chip de una opción (tipo de documento, situación…): alto ≥44px. */
export function chipV2(seleccionado: boolean): string {
  return [
    `min-h-[52px] rounded-[10px] border-[1.5px] px-3 py-1.5 text-[15px] leading-tight transition-[color,background-color,border-color,transform] duration-150 ${PRESION_V2} cursor-pointer`,
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
    // Prototipo de Brenda (BTN / BTN_ON): neutro con borde #C9CEF0 y texto
    // oscuro; elegido con borde de marca, fondo de marca suave y texto de marca.
    seleccionado
      ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.1)] font-bold text-[var(--color-primary-text)]'
      : 'border-[#C9CEF0] bg-white font-semibold text-[#1E2230] hover:border-[var(--color-primary)]',
  ].join(' ');
}

/** "(opcional)" en minúscula, como en el prototipo. */
export function MarcaOpcionalV2() {
  return <span className={OPCIONAL_V2}>(opcional)</span>;
}

/** El error de un campo en Diseño 2: texto plano, sin ícono. */
export function ErrorCampoV2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    // Aparece con un fundido corto hacia abajo (no hay curva en el prototipo).
    <p id={id} role="alert" className={`d2-aparece ${ERROR_V2}`}>
      {children}
    </p>
  );
}
