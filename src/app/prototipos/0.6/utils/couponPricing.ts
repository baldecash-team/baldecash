/**
 * Cálculo de precios de vitrina cuando hay cupón de campaña (solo 1.ª cuota).
 */

import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

export interface CouponQuotaDisplay {
  /** Cuota regular (lista) — se muestra tachada */
  listQuota: number;
  /** Cuota de la primera mensualidad con descuento */
  firstQuota: number;
  /** true si el cupón reduce la primera cuota respecto a la lista */
  hasFirstQuotaOffer: boolean;
}

/**
 * Aplica el descuento del cupón solo a la primera cuota para mostrar en cards.
 * Si el backend ya envió original_monthly_price distinto de monthly_price, se respeta.
 */
export function getCouponQuotaDisplay(
  regularQuota: number,
  coupon: AppliedCoupon,
  apiOriginalQuota?: number | null
): CouponQuotaDisplay {
  const listQuota =
    apiOriginalQuota != null && apiOriginalQuota > regularQuota
      ? apiOriginalQuota
      : regularQuota;

  const quotasAffected = coupon.quotasAffected ?? 1;
  const affectsFirstOnly = quotasAffected <= 1;

  if (!affectsFirstOnly) {
    return { listQuota, firstQuota: regularQuota, hasFirstQuotaOffer: false };
  }

  let firstQuota = regularQuota;

  if (coupon.couponType === 'fixed') {
    firstQuota = Math.max(0, regularQuota - coupon.discount);
  } else if (coupon.couponType === 'percent_quotas') {
    firstQuota = Math.max(0, regularQuota * (1 - coupon.discount / 100));
  } else {
    firstQuota = Math.max(0, regularQuota - coupon.discount);
  }

  const hasFirstQuotaOffer = firstQuota < listQuota - 0.5;

  return {
    listQuota,
    firstQuota: hasFirstQuotaOffer ? firstQuota : regularQuota,
    hasFirstQuotaOffer,
  };
}
