/**
 * Helpers de condición de producto.
 *
 * Importante: el VALOR de BD sigue siendo "reacondicionada"/"reacondicionado"
 * (y "refurbished"). Aquí solo se centraliza la DETECCIÓN y la ETIQUETA VISIBLE.
 *
 * El texto lo manda la BD: sale del facet `conditions[]` de
 * `GET /{slug}/products/filters`, que a su vez lee `product_condition_catalog`.
 * Editar esa fila cambia la web sin desplegar (BAL-3204).
 */

/**
 * Texto de respaldo para la condición reacondicionada.
 *
 * Solo se usa si el facet no resolvió la condición (p. ej. la card se pinta
 * antes de que carguen los filtros). Con facet disponible manda la BD.
 */
export const REFURBISHED_DISPLAY_LABEL = 'Semi nuevo';

/** ¿El código de condición corresponde a un reacondicionado? (match contra el valor crudo de BD) */
export function isRefurbishedCondition(condition?: string | null): boolean {
  const c = condition?.toLowerCase().trim();
  return !!c && (c.includes('reacondicion') || c === 'refurbished');
}

/**
 * Etiqueta visible para una condición.
 *
 * Prioridad: el label del facet (BD) > el respaldo del reacondicionado >
 * uno derivado del código. Antes esta función forzaba "Semi nuevo" y
 * descartaba lo que mandaba el backend, así que cambiar el texto en BD no
 * tenía efecto en la web (BAL-3204).
 */
export function conditionDisplayLabel(condition?: string | null, fallbackLabel?: string | null): string {
  if (fallbackLabel) return fallbackLabel;
  if (isRefurbishedCondition(condition)) return REFURBISHED_DISPLAY_LABEL;
  const c = condition?.trim();
  if (!c) return '';
  return c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, ' ');
}

/**
 * Etiqueta del reacondicionado para las campañas que la nombran distinto.
 * Family Farms vende equipos reacondicionados y los llama por su nombre: su
 * material y el diseño de sus landings dicen "Reacondicionado", no "Semi nuevo".
 * La clave es la variante de overlay de la landing (`features.overlay_variant`).
 */
const OVERLAY_REFURBISHED_LABELS: Record<string, string> = {
  familyfarm: 'Reacondicionado',
};

/**
 * Como `conditionDisplayLabel`, pero respetando la etiqueta propia de la campaña
 * cuando la variante de overlay define una. Sin variante, o con una que no
 * redefine nada, devuelve exactamente lo mismo que `conditionDisplayLabel`.
 */
export function conditionDisplayLabelFor(
  overlayVariant?: string | null,
  condition?: string | null,
  fallbackLabel?: string | null,
): string {
  if (isRefurbishedCondition(condition) && overlayVariant) {
    const override = OVERLAY_REFURBISHED_LABELS[overlayVariant];
    if (override) return override;
  }
  return conditionDisplayLabel(condition, fallbackLabel);
}

/**
 * Variantes de overlay cuyas tarjetas de catálogo no repiten el estado del equipo.
 *
 * Family Farms ya lo dice dos veces antes de llegar al chip: el banner
 * "REACONDICIONADO" encabeza la tarjeta y el selector A/B/C de la ficha abre el
 * grado con su propio diseño (BAL-2812). Los chips "Semi nuevo" y "Grado X"
 * sobre la foto son la misma información dicha por tercera vez, encima con la
 * etiqueta estándar que la campaña no usa.
 *
 * Va por variante de overlay y no por slug, igual que el resto de la campaña,
 * para que una landing nueva lo herede sin deploy.
 */
const OVERLAY_VARIANTS_WITHOUT_STATE_BADGES = new Set(['familyfarm']);

/** ¿Esta variante de overlay oculta los badges de condición y grado en la tarjeta? */
export function hidesEquipmentStateBadges(overlayVariant?: string | null): boolean {
  return !!overlayVariant && OVERLAY_VARIANTS_WITHOUT_STATE_BADGES.has(overlayVariant);
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
