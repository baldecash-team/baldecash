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

/** Shape crudo del API (snake_case): Product.deferred_delivery. */
export interface ApiDeferredDelivery {
  is_deferred?: boolean;
  days_min?: number | null;
  days_max?: number | null;
  estimated_from?: string | null;
  estimated_to?: string | null;
}

/**
 * Normaliza el `deferred_delivery` crudo del API (snake_case) al tipo del FE.
 * Si no viene o no está taggeado, devuelve el valor "no diferido" para que el
 * FE oculte el bloque.
 */
export function mapApiDeferredDelivery(
  raw?: ApiDeferredDelivery | null,
): DeferredDelivery {
  if (!raw || raw.is_deferred !== true) {
    return NO_DEFERRED_DELIVERY;
  }
  return {
    isDeferred: true,
    daysMin: raw.days_min ?? null,
    daysMax: raw.days_max ?? null,
    estimatedFrom: raw.estimated_from ?? null,
    estimatedTo: raw.estimated_to ?? null,
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
  // Si ambas fechas coinciden (days_min === days_max) mostramos una sola.
  if (a && b) return a === b ? a : `${a} – ${b}`;
  return a || b || '';
}

/**
 * Etiqueta "Desde 25 jun." a partir de estimatedFrom (vacío si no hay fecha).
 * Es el formato que se muestra junto a la palabra "Entrega:".
 */
export function formatDeferredFrom(from: string | null): string {
  const d = formatDeferredDate(from);
  return d ? `Desde ${d}` : '';
}

/**
 * Texto de días estimados: "7 días" o "15–25 días".
 * Útil para el modal informativo de entrega.
 */
export function formatDeferredDays(
  daysMin: number | null,
  daysMax: number | null,
): string {
  if (daysMin == null && daysMax == null) return '';
  if (daysMin != null && daysMax != null) {
    if (daysMin === daysMax) return `${daysMin} ${daysMin === 1 ? 'día' : 'días'}`;
    return `${daysMin}–${daysMax} días`;
  }
  const d = (daysMin ?? daysMax) as number;
  return `${d} ${d === 1 ? 'día' : 'días'}`;
}
