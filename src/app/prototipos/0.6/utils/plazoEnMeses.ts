/**
 * El plazo de un producto elegido en MESES, con la MISMA fórmula que usa el
 * submit para `term_months` (`useSubmitApplication`). Así lo que se le muestra
 * al cliente (p. ej. qué seguro del combo le toca) es, por construcción, lo
 * que el backend emite.
 *
 * Ojo: `SelectedProduct.months` NO es confiable como meses — copia-home guarda
 * ahí el plazo en cuotas (24 quincenas, 48 semanas). Por eso manda `term`.
 */

/**
 * Convert raw term (in payment_frequency units) to calendar months.
 * 4 weeks ≈ 1 month, 2 fortnights = 1 month.
 */
export function termToMonths(term: number, frequency?: string): number {
  if (frequency === 'semanal') return Math.round(term / 4);
  if (frequency === 'quincenal') return Math.round(term / 2);
  return term; // mensual or unknown → assume already in months
}

/** Plazo en MESES tal como lo manda el submit (`term_months`). */
export function mesesDelProducto(
  p?: { term?: number; months?: number; paymentFrequency?: string } | null,
): number | undefined {
  const t = p?.term ?? p?.months;
  return t == null ? undefined : termToMonths(t, p?.paymentFrequency);
}
