/**
 * Qué forma ve el cliente en una lista. Copia idéntica en admin2
 * (`src/components/forms/formaDeLista.ts`): si cambias una, cambia la otra
 * y su tabla de casos.
 *
 * Sin forma elegida (NULL) es exactamente lo de antes: `select` se adapta
 * por cantidad y `autocomplete` siempre va con buscador.
 */
export type Forma = 'buttons' | 'cards' | 'dropdown' | 'search';
export type DisplayMode = 'auto' | Forma;

export interface EntradaForma {
  tipo: string;
  displayMode: DisplayMode | null | undefined;
  cantidad: number;
  /** Opciones que vienen del sistema (`options_source` o `cascade_from`). */
  delSistema: boolean;
}

/** Más de 4 botones no entran en una fila a 375 px. */
export const MAXIMO_BOTONES = 4;

export function formaAutomatica(cantidad: number): Forma {
  if (cantidad <= 3) return 'buttons';
  if (cantidad <= 5) return 'cards';
  if (cantidad <= 9) return 'dropdown';
  return 'search';
}

export function resolverForma({ tipo, displayMode, cantidad, delSistema }: EntradaForma): Forma {
  if (delSistema) return 'search';
  if (displayMode == null) return tipo === 'autocomplete' ? 'search' : formaAutomatica(cantidad);
  if (displayMode === 'auto') return formaAutomatica(cantidad);
  if (displayMode === 'buttons' && cantidad > MAXIMO_BOTONES) return formaAutomatica(cantidad);
  return displayMode;
}
