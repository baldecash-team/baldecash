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
  /**
   * BAL-4701: lista del sistema que SÍ deja elegir la forma (ver
   * `formaElegibleDelSistema`). Sin esto, una lista del sistema siempre va
   * con buscador.
   */
  formaElegible?: boolean;
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

/**
 * BAL-4701: catálogos del sistema chicos y fijos (3 tipos de documento, 5
 * estados civiles) que dejan elegir la forma como una lista normal. El resto
 * de listas del sistema (departamentos, sedes, instituciones, carreras…) son
 * largas o cambian con el padre, y siguen siempre con buscador.
 *
 * La excepción va por `options_source` (el catálogo) y no por el código del
 * campo: así vale para `document_type`, `supporter_document_type` y cualquier
 * campo nuevo que lea el mismo catálogo, sin mantener una lista de códigos.
 * Una lista en cascada nunca entra: sus opciones dependen del padre.
 *
 * Copia en admin2 (`src/components/forms/formaDeLista.ts`) y en ws2
 * (`FUENTES_CON_FORMA_ELEGIBLE` de `app/api/routers/form_fields.py`).
 */
export const FUENTES_CON_FORMA_ELEGIBLE: readonly string[] = ['document-types', 'marital-status'];

export function formaElegibleDelSistema(fuente: string | null | undefined, padre?: string | null): boolean {
  return !!fuente && !padre && FUENTES_CON_FORMA_ELEGIBLE.includes(fuente);
}

export function resolverForma({ tipo, displayMode, cantidad, delSistema, formaElegible = false, varias = false }: EntradaForma): Forma {
  // Del sistema: buscador, salvo una lista chica con forma elegida a mano. Sin
  // forma (NULL o el viejo «auto») sigue con buscador, como antes de BAL-4701:
  // ningún formulario cambia solo el día del deploy.
  if (delSistema && !(formaElegible && displayMode != null && displayMode !== 'auto')) return 'search';
  const automatica = varias ? formaAutomaticaVarias : formaAutomatica;
  if (displayMode == null) return !varias && tipo === 'autocomplete' ? 'search' : automatica(cantidad);
  if (displayMode === 'auto') return automatica(cantidad);
  if (displayMode === 'buttons' && cantidad > MAXIMO_BOTONES) return automatica(cantidad);
  // Casillas solo existe con varias: sin varias se cae a la automática.
  if (displayMode === 'checkboxes' && !varias) return automatica(cantidad);
  return displayMode;
}
