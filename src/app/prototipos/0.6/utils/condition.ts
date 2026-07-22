/**
 * Helpers de condición de producto.
 *
 * Importante: el VALOR de BD sigue siendo "reacondicionada"/"reacondicionado"
 * (y "refurbished"). Aquí solo se centraliza la DETECCIÓN y la ETIQUETA VISIBLE,
 * que de cara al usuario se muestra como "Semi nuevo".
 */

/** Texto visible al usuario para la condición reacondicionada. */
export const REFURBISHED_DISPLAY_LABEL = 'Semi nuevo';

/** ¿El código de condición corresponde a un reacondicionado? (match contra el valor crudo de BD) */
export function isRefurbishedCondition(condition?: string | null): boolean {
  const c = condition?.toLowerCase().trim();
  return !!c && (c.includes('reacondicion') || c === 'refurbished');
}

/**
 * Etiqueta visible para una condición. Para reacondicionados fuerza
 * "Semi nuevo"; para el resto usa el label provisto (p. ej. del facet) o uno
 * derivado del código.
 */
export function conditionDisplayLabel(condition?: string | null, fallbackLabel?: string | null): string {
  if (isRefurbishedCondition(condition)) return REFURBISHED_DISPLAY_LABEL;
  if (fallbackLabel) return fallbackLabel;
  const c = condition?.trim();
  if (!c) return '';
  return c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, ' ');
}

/**
 * Normaliza cualquier variante de condición a su forma canónica del API:
 * 'nueva' | 'reacondicionada'. Resuelve el desajuste entre el enum FE
 * ('nuevo'/'reacondicionado') y el API/facet ('nueva'/'reacondicionada').
 */
export function normalizeCondition(condition?: string | null): string {
  const c = condition?.toLowerCase().trim() ?? '';
  if (isRefurbishedCondition(c)) return 'reacondicionada';
  if (c === 'nuevo' || c === 'nueva' || c === 'new') return 'nueva';
  return c;
}

/** ¿Dos valores de condición son equivalentes pese a nuevo/nueva, etc.? */
export function sameCondition(a?: string | null, b?: string | null): boolean {
  const na = normalizeCondition(a);
  return na !== '' && na === normalizeCondition(b);
}
