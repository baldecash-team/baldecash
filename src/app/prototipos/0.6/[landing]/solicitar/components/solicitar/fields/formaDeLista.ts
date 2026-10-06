/**
 * Qué forma ve el cliente en una lista. Copia idéntica en admin2
 * (`src/components/forms/formaDeLista.ts`): si cambias una, cambia la otra
 * y su tabla de casos.
 *
 * Sin forma elegida (NULL) es exactamente lo de antes: `select` se adapta
 * por cantidad y `autocomplete` siempre va con buscador.
 */
export type Forma = 'buttons' | 'cards' | 'dropdown' | 'search' | 'checkboxes';
export type DisplayMode = 'auto' | Forma;

export interface EntradaForma {
  tipo: string;
  displayMode: DisplayMode | null | undefined;
  cantidad: number;
  /** Opciones que vienen del sistema (`options_source` o `cascade_from`). */
  delSistema: boolean;
  /** «El cliente puede marcar varias» (BAL-4354). Ausente = una sola. */
  varias?: boolean;
}

/** Más de 4 botones no entran en una fila a 375 px. */
export const MAXIMO_BOTONES = 4;

export function formaAutomatica(cantidad: number): Forma {
  if (cantidad <= 3) return 'buttons';
  if (cantidad <= 5) return 'cards';
  if (cantidad <= 9) return 'dropdown';
  return 'search';
}

/**
 * Con varias (BAL-4354): hasta 5 opciones, casillas una debajo de otra; de 6
 * a 9, desplegable con casillas; 10 o más, buscador con chips.
 */
export function formaAutomaticaVarias(cantidad: number): Forma {
  if (cantidad <= 5) return 'checkboxes';
  if (cantidad <= 9) return 'dropdown';
  return 'search';
}

export function resolverForma({ tipo, displayMode, cantidad, delSistema, varias = false }: EntradaForma): Forma {
  if (delSistema) return 'search';
  const automatica = varias ? formaAutomaticaVarias : formaAutomatica;
  if (displayMode == null) return !varias && tipo === 'autocomplete' ? 'search' : automatica(cantidad);
  if (displayMode === 'auto') return automatica(cantidad);
  if (displayMode === 'buttons' && cantidad > MAXIMO_BOTONES) return automatica(cantidad);
  // Casillas solo existe con varias: sin varias se cae a la automática.
  if (displayMode === 'checkboxes' && !varias) return automatica(cantidad);
  return displayMode;
}
