/**
 * Helpers para la convención unificada de plazos del backend de pricing.
 *
 * Convención (ver docs/pricing_frontend_spec.md):
 *   term              = nº de cuotas en la frecuencia natural
 *   payment_frequency = 'mensual' | 'quincenal' | 'semanal'
 *   periods_per_year  = { mensual: 12, quincenal: 24, semanal: 48 }
 *
 * `term_months` es legacy: para mensual coincide con `term`; para semanal/quincenal
 * es meses calendario derivados — NO el número de cuotas. Preferir `term`
 * + `payment_frequency` y derivar meses con `displayMonths`.
 */

export type PaymentFrequency = 'mensual' | 'quincenal' | 'semanal';

export const PERIODS_PER_YEAR: Record<PaymentFrequency, number> = {
  mensual: 12,
  quincenal: 24,
  semanal: 48,
};

/**
 * Convierte un `term` (cuotas en frecuencia natural) a meses calendario para mostrar al usuario.
 * Si la frecuencia es desconocida asume mensual.
 */
export function displayMonths(term: number, frequency?: string | null): number {
  if (!Number.isFinite(term) || term <= 0) return 0;
  const freq = (frequency ?? 'mensual') as PaymentFrequency;
  const periods = PERIODS_PER_YEAR[freq] ?? PERIODS_PER_YEAR.mensual;
  return Math.round((term * 12) / periods);
}

/**
 * Etiqueta legible del período según frecuencia: "meses" | "quincenas" | "semanas".
 */
export function periodUnitLabel(frequency?: string | null, plural = true): string {
  switch (frequency) {
    case 'semanal':
      return plural ? 'semanas' : 'semana';
    case 'quincenal':
      return plural ? 'quincenas' : 'quincena';
    case 'mensual':
    default:
      return plural ? 'meses' : 'mes';
  }
}
