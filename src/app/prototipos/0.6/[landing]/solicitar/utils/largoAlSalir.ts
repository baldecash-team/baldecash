/**
 * Campos de números de la persona en los que `input_blur` lleva `value_length`
 * (cuántos caracteres tenía al salir), BAL-5254. Sirve para ver si se fue con
 * el número a medias. Nunca se manda el valor.
 */
export const CAMPOS_CON_LARGO_AL_SALIR: ReadonlySet<string> = new Set([
  'phone',
  'supporter_phone',
  'document_number',
  'supporter_document_number', // DNI del familiar
]);

/**
 * Largo del valor para `input_blur`, solo en `CAMPOS_CON_LARGO_AL_SALIR`;
 * `undefined` en cualquier otro campo.
 */
export function largoAlSalir(fieldName: string, valor: unknown): number | undefined {
  if (!CAMPOS_CON_LARGO_AL_SALIR.has(fieldName)) return undefined;
  if (valor === null || valor === undefined) return 0;
  return String(valor).trim().length;
}
