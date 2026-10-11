/**
 * Alcance y precios de vitrina de un cupón.
 *
 * `quotasAffected` sigue la regla del backend (`coupon.quotas_affected`):
 * vacío = TODAS las cuotas, 1 = solo la primera, N = las primeras N. Vale igual
 * para monto fijo y para porcentaje. El cupón de regalo (`free_accessory`) no
 * descuenta nada.
 */

import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

type CouponScopeInput = Pick<AppliedCoupon, 'couponType' | 'quotasAffected'>;

/**
 * A cuántas cuotas descuenta el cupón: `null` = todas, N = las primeras N.
 * Un valor que no es un entero positivo se lee como vacío (todas), igual que
 * el backend, que trata el 0 como «sin tope».
 */
export function getCouponQuotas(coupon: CouponScopeInput): number | null {
  const quotas = coupon.quotasAffected;
  if (quotas == null || !Number.isFinite(quotas) || quotas < 1) return null;
  return Math.floor(quotas);
}

/**
 * El alcance del descuento en palabras: «en tu primera cuota», «en tus
 * primeras 3 cuotas», «en todas tus cuotas». `null` para el cupón de regalo,
 * que no descuenta.
 *
 * `term` es el plazo en cuotas, cuando se conoce: un cupón de 12 cuotas sobre
 * un plazo de 6 las cubre todas, y decir «primeras 12» sobre 6 no se entiende.
 */
export function getCouponScopeText(
  coupon: CouponScopeInput,
  term?: number | null
): string | null {
  if (coupon.couponType === 'free_accessory') return null;
  const quotas = getCouponQuotas(coupon);
  if (quotas == null || (term != null && term > 0 && quotas >= term)) {
    return 'en todas tus cuotas';
  }
  if (quotas === 1) return 'en tu primera cuota';
  return `en tus primeras ${quotas} cuotas`;
}

/** true si el cupón es de regalo: entrega un accesorio, no descuenta. */
export function isGiftCoupon(coupon: Pick<AppliedCoupon, 'couponType' | 'giftName'>): boolean {
  return coupon.couponType === 'free_accessory' || !!coupon.giftName;
}

/**
 * true si el cupón le da algo a la persona: un regalo o un descuento mayor a
 * cero. Los cupones de seguimiento (valor 0) existen solo para atribuir la
 * visita, y anunciarlos como «cupón aplicado» promete un beneficio que no hay.
 */
export function couponHasBenefit(
  coupon: Pick<AppliedCoupon, 'couponType' | 'giftName' | 'discount'>
): boolean {
  return isGiftCoupon(coupon) || coupon.discount > 0;
}

export interface CouponQuotaDisplay {
  /**
   * Precio de lista: el tachado de la promoción del producto si el backend lo
   * mandó (`original_monthly_price`), o la cuota regular. NO es lo que se paga
   * después del cupón: eso es `regularQuota`.
   */
  listQuota: number;
  /** Cuota del producto sin cupón — la que se paga cuando el descuento ya no aplica */
  regularQuota: number;
  /** Cuota con el descuento del cupón */
  firstQuota: number;
  /** true si el cupón reduce la cuota regular */
  hasFirstQuotaOffer: boolean;
  /** Cuántas cuotas llevan el descuento; `null` = todas */
  discountedQuotas: number | null;
  /**
   * Cuota normal después de las que llevan descuento; `null` si el descuento
   * cubre todas las cuotas (no hay «después»).
   */
  quotaAfter: number | null;
}

/**
 * Aplica el descuento del cupón a la cuota para mostrar en cards: la cuota con
 * descuento, a cuántas cuotas alcanza y la cuota normal que sigue después.
 *
 * `apiOriginalQuota` es el precio tachado de la PROMOCIÓN del producto
 * (`original_monthly_price`). Se devuelve en `listQuota`, pero no entra en la
 * cuenta del cupón: el descuento se mide contra la cuota regular, y lo que se
 * paga después es la cuota regular. Antes se usaba como «cuotas 2 en
 * adelante», y un equipo en promoción (S/239, antes S/478) anunciaba S/478
 * para el resto del plazo.
 *
 * `term` es el plazo en cuotas (opcional): con él, un cupón de N cuotas sobre
 * un plazo de N o menos se muestra como «todas».
 */
export function getCouponQuotaDisplay(
  regularQuota: number,
  coupon: AppliedCoupon,
  apiOriginalQuota?: number | null,
  term?: number | null
): CouponQuotaDisplay {
  const listQuota =
    apiOriginalQuota != null && apiOriginalQuota > regularQuota
      ? apiOriginalQuota
      : regularQuota;

  const quotas = getCouponQuotas(coupon);
  const coversAll = quotas == null || (term != null && term > 0 && quotas >= term);
  const discountedQuotas = coversAll ? null : quotas;

  const sinDescuento: CouponQuotaDisplay = {
    listQuota,
    regularQuota,
    firstQuota: regularQuota,
    hasFirstQuotaOffer: false,
    discountedQuotas,
    quotaAfter: null,
  };

  // El cupón de regalo entrega un accesorio: la cuota no cambia.
  if (coupon.couponType === 'free_accessory') return sinDescuento;

  let firstQuota = regularQuota;

  if (coupon.couponType === 'fixed') {
    firstQuota = Math.max(0, regularQuota - coupon.discount);
  } else if (coupon.couponType === 'percent_quotas') {
    firstQuota = Math.max(0, regularQuota * (1 - coupon.discount / 100));
  } else {
    firstQuota = Math.max(0, regularQuota - coupon.discount);
  }

  const hasFirstQuotaOffer = firstQuota < regularQuota - 0.5;
  if (!hasFirstQuotaOffer) return sinDescuento;

  return {
    listQuota,
    regularQuota,
    firstQuota,
    hasFirstQuotaOffer,
    discountedQuotas,
    quotaAfter: coversAll ? null : regularQuota,
  };
}
