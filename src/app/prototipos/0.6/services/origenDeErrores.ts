/**
 * De dónde salió el error de un campo, para `form_field_error` (BAL-5276).
 *
 * El contexto del wizard guarda solo el TEXTO del error. Brenda pidió saber
 * además en qué momento salió (`al_salir` del campo o al `continuar`) y qué
 * regla falló (`error_rule`: `required`, `min_length`, `not_equals_field`…).
 * Quien pone el error lo anota acá y quien emite el evento lo lee, siempre
 * que el texto coincida (si no coincide, el error ya es otro).
 *
 * - `validateStepDetallado` (Continuar / Enviar) anota `continuar`.
 * - La validación al salir del campo (D1 `DynamicField`, D2
 *   `useErroresAlSalir`) anota `al_salir`.
 *
 * Nunca guarda lo que escribió la persona.
 */

export type MomentoDelError = 'al_salir' | 'continuar';

export interface OrigenDelError {
  momento: MomentoDelError;
  regla: string | null;
}

const origenes = new Map<string, { mensaje: string } & OrigenDelError>();

export function anotarOrigenDelError(
  campo: string,
  mensaje: string,
  regla: string | null | undefined,
  momento: MomentoDelError,
): void {
  origenes.set(campo, { mensaje, regla: regla ?? null, momento });
}

/** El origen anotado para ese campo y ese texto, o `null` si no hay. */
export function origenDelError(campo: string, mensaje: string): OrigenDelError | null {
  const o = origenes.get(campo);
  if (!o || o.mensaje !== mensaje) return null;
  return { momento: o.momento, regla: o.regla };
}

/** Solo para tests. */
export function __limpiarOrigenesDeErrores(): void {
  origenes.clear();
}
