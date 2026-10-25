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
  neutro: 'var(--d2-borde-campo)',
  error: 'var(--d2-error)',
  errorTexto: 'var(--d2-error-texto)',
  correcto: 'var(--d2-ok)',
  etiqueta: 'var(--d2-etiqueta)',
  texto: 'var(--d2-texto)',
  gris: 'var(--d2-texto-suave)',
} as const;

/**
 * Tarjeta de un bloque del paso (la del marco de `ShellV2`): borde #AEB6EE,
 * radio 2xl y la franja de marca arriba. En el prototipo cada sección del
 * paso va en su propia tarjeta (BAL-4969).
 */
export const TARJETA_V2 = 'rounded-2xl border border-[var(--d2-borde-tarjeta)] bg-[var(--d2-tarjeta)] p-4 sm:p-7';
export const TARJETA_V2_ESTILO = { boxShadow: 'inset 0 4px 0 0 var(--color-primary)' } as const;

/**
 * "‹ Atrás" del formulario como botón secundario (pedido de Emilio, BAL-4959):
 * misma altura que "Continuar" (52px), contorno con las medidas estándar del
 * kit (1,5px / radio 10px, como `CAJA_V2`), fondo blanco y texto de marca.
 */
export const BOTON_ATRAS_V2 =
  'inline-flex min-h-[52px] flex-shrink-0 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-[var(--d2-borde-campo)] bg-[var(--d2-tarjeta)] text-base font-bold text-[var(--color-primary-text)] transition-colors duration-150 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[rgba(var(--color-primary-rgb),0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

/** Etiqueta arriba del campo (15px, negrita). */
export const ETIQUETA_V2 = 'flex items-center gap-1.5 text-[15px] font-bold leading-snug text-[var(--d2-etiqueta)]';
/** "(opcional)" al lado de la etiqueta. */
export const OPCIONAL_V2 = 'text-[13px] font-normal text-[var(--d2-texto-suave)]';
/** Mensaje de error bajo el campo. */
export const ERROR_V2 = 'text-[13px] leading-snug text-[var(--d2-error-texto)]';
/** Pista (`hint`) bajo el campo. */
export const PISTA_V2 = 'text-[13px] leading-snug text-[var(--d2-texto-suave)]';
/** La caja del campo: 50px, radio 10px, borde 1.5px. El color lo pone `bordeV2`. */
export const CAJA_V2 = 'h-[50px] rounded-[10px] border-[1.5px] bg-[var(--d2-tarjeta)] transition-colors duration-150';
/** Prefijo "+51" / "S/": bloque pegado al borde izquierdo de la caja. */
export const PREFIJO_V2 =
  'flex h-full flex-shrink-0 select-none items-center self-stretch border-r border-[rgba(var(--color-primary-rgb),0.18)] bg-[rgba(var(--color-primary-rgb),0.07)] px-3 text-base font-semibold text-[var(--d2-prefijo-texto)]';
/** Placeholder gris. */
export const PLACEHOLDER_V2 = 'placeholder:text-[var(--d2-texto-tenue)]';

export interface EstadoCajaV2 {
  error?: boolean;
  foco?: boolean;
  correcto?: boolean;
}

/** Color del borde: error > foco > correcto > neutro. */
export function bordeV2({ error, foco, correcto }: EstadoCajaV2): string {
  if (error) return 'border-[var(--d2-error)]';
  if (foco) return 'border-[var(--color-primary)]';
  if (correcto) return 'border-[var(--d2-ok)]';
  return 'border-[var(--d2-borde-campo)]';
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
      : 'border-[var(--d2-borde-campo)] bg-[var(--d2-tarjeta)] font-semibold text-[var(--d2-texto)] hover:border-[var(--color-primary)]',
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
