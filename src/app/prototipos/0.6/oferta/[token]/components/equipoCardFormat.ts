/**
 * Formato compartido de cuota / plazo / inicial para las cards de oferta.
 * Fuente ÚNICA de verdad usada por el Caso 4 (OfertaEquipoCard) y el Caso 5
 * (EquipoCard de UpsellPortada), para que ambos muestren el mismo formato y no
 * se desincronicen (BAL-2100).
 */

/** Sufijo de la cuota según la frecuencia: /mes | /sem | /qcn. */
export function cuotaSuffix(freq?: string | null): string {
  const f = freq ?? 'mensual';
  return f === 'semanal' ? '/sem' : f === 'quincenal' ? '/qcn' : '/mes';
}

/** Unidad del plazo (singular/plural) según frecuencia: mes(es)/semana(s)/quincena(s). */
export function plazoUnit(n: number | null | undefined, freq?: string | null): string {
  const f = freq ?? 'mensual';
  if (f === 'semanal') return n === 1 ? 'semana' : 'semanas';
  if (f === 'quincenal') return n === 1 ? 'quincena' : 'quincenas';
  return n === 1 ? 'mes' : 'meses';
}

/**
 * Texto del subíndice de inicial. Prioriza el MONTO (S/) sobre el porcentaje;
 * cae a "sin inicial" si no hay monto ni % positivos.
 */
export function inicialText(
  initialAmount?: number | null,
  initialPercent?: number | null,
): string {
  if (initialAmount != null && initialAmount > 0) return ` · inicial S/${Math.round(initialAmount)}`;
  if (initialPercent != null && initialPercent > 0) return ` · inicial ${initialPercent}%`;
  return ' · sin inicial';
}
