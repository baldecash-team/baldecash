/**
 * Cómo cambia la lista de seguros elegidos. Puro, para probarlo sin montar
 * `ProductProvider`.
 *
 * S3/R7: un plan que viene dentro del combo (`includedInCombo`) NUNCA entra a
 * la lista: así no suma a la cuota ni viaja en `insurance_ids`.
 */
import type { InsurancePlan } from '../types/upsell';

export function alternarSeguro(prev: InsurancePlan[], plan: InsurancePlan): InsurancePlan[] {
  if (plan.includedInCombo) return prev;
  return prev.some((i) => i.id === plan.id)
    ? prev.filter((i) => i.id !== plan.id)
    : [...prev, plan];
}

export function quitarSeguros(prev: InsurancePlan[], ids: string[]): InsurancePlan[] {
  if (ids.length === 0) return prev;
  const fuera = new Set(ids);
  const next = prev.filter((i) => !fuera.has(i.id));
  return next.length === prev.length ? prev : next;
}
