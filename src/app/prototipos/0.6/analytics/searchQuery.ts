/**
 * Normalización del término buscado antes de mandarlo a analítica.
 *
 * El buscador interno reporta hoy si hubo resultados y cuántos caracteres se
 * escribieron, pero no *qué* se escribió — y la mitad de las búsquedas no
 * devuelve nada, así que no sabemos qué producto falta cargar.
 *
 * El saneado vive acá y no en cada call site a propósito: es una sola regla y
 * conviene que no se pueda olvidar en uno de los cuatro puntos de emisión.
 */

/** Tope de longitud. Un nombre de equipo no pasa de acá; lo que sí pasa es
 *  texto pegado por accidente, que no aporta al análisis. */
const MAX_LEN = 60;

/** Cadenas de solo dígitos y 6 o más caracteres: documento o teléfono. */
const SOLO_DIGITOS = /^\d{6,}$/;

/**
 * Devuelve el término listo para analítica, o `undefined` si no hay nada útil
 * que reportar (vacío, o algo que parece un dato personal).
 */
export function normalizeSearchQuery(raw?: string | null): string | undefined {
  if (!raw) return undefined;

  const limpio = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!limpio) return undefined;
  if (SOLO_DIGITOS.test(limpio)) return undefined;

  return limpio.slice(0, MAX_LEN);
}
