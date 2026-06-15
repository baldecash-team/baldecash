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
