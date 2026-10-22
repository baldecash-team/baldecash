/**
 * Buscadores de Diseño 2 (BAL-4964, F5): institución, carrera y cualquier
 * lista con búsqueda. Reglas puras; las usa `SelectInput` solo con
 * `useCamposV2()`.
 *
 * - Sugerencias desde 3 letras (o `min_search_length` de la BD si viene).
 * - Como máximo 5 visibles.
 * - Sin tildes y sin mayúsculas.
 * - Al salir del campo, con una sola coincidencia (o una sola exacta), se
 *   elige sola.
 *
 * Lo que se guarda no cambia: sigue siendo el id de la opción.
 */

export const MIN_LETRAS_V2 = 3;
export const MAX_SUGERENCIAS_V2 = 5;

/** "Pacífico" → "pacifico". Quita tildes y diéresis, minúsculas, espacios simples. */
export function normalizarBusqueda(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('es')
    .replace(/\s+/g, ' ')
    .trim();
}

/** ¿La etiqueta contiene lo escrito, sin tildes ni mayúsculas? */
export function coincide(etiqueta: string, termino: string): boolean {
  const t = normalizarBusqueda(termino);
  if (!t) return true;
  return normalizarBusqueda(etiqueta).includes(t);
}

/** Letras mínimas para sugerir: las de la BD si vienen, si no 3. */
export function minimoDeLetras(minDeLaBd: number | null | undefined): number {
  return minDeLaBd && minDeLaBd > 0 ? minDeLaBd : MIN_LETRAS_V2;
}

/**
 * La opción que se elige sola al salir del campo, o `null`:
 * - si entre las coincidencias hay UNA cuya etiqueta es exactamente lo
 *   escrito (sin tildes ni mayúsculas), esa;
 * - si no, si hay UNA sola coincidencia, esa.
 *
 * Con menos letras que el mínimo no se elige nada.
 */
export function eleccionAutomatica<T extends { label: string; disabled?: boolean }>(
  coincidencias: T[],
  termino: string,
  minimo: number,
): T | null {
  const t = normalizarBusqueda(termino);
  if (t.length < Math.max(minimo, 1)) return null;
  const habilitadas = coincidencias.filter((o) => !o.disabled);
  const exactas = habilitadas.filter((o) => normalizarBusqueda(o.label) === t);
  if (exactas.length === 1) return exactas[0];
  if (exactas.length > 1) return null;
  return habilitadas.length === 1 ? habilitadas[0] : null;
}
