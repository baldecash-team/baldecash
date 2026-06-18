/**
 * deferredDelivery - Contrato FE de entrega diferida.
 *
 * El backend entrega el objeto `deferredDelivery` tanto en el detalle de producto
 * como en cada item del listado de catálogo. Cuando el producto NO está taggeado,
 * `isDeferred=false` y el resto va en null (el FE oculta el bloque).
 *
 * El FE solo formatea el rango de fechas ya calculadas por el backend
 * (estimatedFrom–estimatedTo → "02 jul. – 12 jul."). Es informativo: no cambia
 * pricing ni cuotas.
 */

export interface DeferredDelivery {
  /** boolean — Product.is_deferred_delivery */
  isDeferred: boolean;
  /** int — system_config delivery.deferred_days_min */
  daysMin: number | null;
  /** int — system_config delivery.deferred_days_max */
  daysMax: number | null;
  /** date ISO (YYYY-MM-DD) = hoy + daysMin */
  estimatedFrom: string | null;
  /** date ISO (YYYY-MM-DD) = hoy + daysMax */
  estimatedTo: string | null;
}

/** Valor por defecto para productos sin tag de entrega diferida. */
export const NO_DEFERRED_DELIVERY: DeferredDelivery = {
  isDeferred: false,
  daysMin: null,
  daysMax: null,
  estimatedFrom: null,
  estimatedTo: null,
};

/**
 * Normaliza el `deferredDelivery` crudo del API. Si no viene o no está taggeado,
 * devuelve el valor "no diferido" para que el FE oculte el bloque.
 */
export function mapApiDeferredDelivery(
  raw?: Partial<DeferredDelivery> | null,
): DeferredDelivery {
  if (!raw || raw.isDeferred !== true) {
    return NO_DEFERRED_DELIVERY;
  }
  return {
    isDeferred: true,
    daysMin: raw.daysMin ?? null,
    daysMax: raw.daysMax ?? null,
    estimatedFrom: raw.estimatedFrom ?? null,
    estimatedTo: raw.estimatedTo ?? null,
  };
}

// Abreviaturas de mes en español (estilo "jul.").
const MONTHS_ABBR = [
  'ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.',
  'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.',
];

/**
 * Formatea una fecha ISO (YYYY-MM-DD) a "02 jul.".
 * Parseo manual para evitar corrimientos por zona horaria.
 */
export function formatDeferredDate(iso: string | null): string {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return '';
  const monthIdx = parseInt(m[2], 10) - 1;
  const abbr = MONTHS_ABBR[monthIdx] ?? '';
  return abbr ? `${m[3]} ${abbr}` : '';
}

/**
 * Formatea el rango estimatedFrom–estimatedTo → "02 jul. – 12 jul.".
 * Si solo hay una fecha, devuelve esa; si no hay ninguna, string vacío.
 */
export function formatDeferredRange(
  from: string | null,
  to: string | null,
): string {
  const a = formatDeferredDate(from);
  const b = formatDeferredDate(to);
  if (a && b) return `${a} – ${b}`;
  return a || b || '';
}
