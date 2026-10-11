/**
 * Qué cupones y qué landings muestran el banner de cupón (`CouponCampaignBanner`).
 *
 * Vive aparte porque lo consultan dos pantallas —la portada de la landing y el
 * catálogo— y tener la regla en una sola y no en la otra es como se desalinean.
 */

import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { couponHasBenefit, getCouponScopeText, isGiftCoupon } from './couponPricing';

// Landings (landing_id de prod) donde NO se muestra la UI de cupón (banner de
// campaña + navbar simplificado). El cupón se sigue validando y aplicando con
// normalidad: los precios de la vitrina mantienen el descuento y el checkout
// también. Hardcodeado por ahora; se evaluará una configuración escalable más
// adelante.
export const LANDINGS_SIN_BANNER_CUPON: number[] = [138, 140, 167, 174];

export function landingMuestraBannerDeCupon(landingId: number | null | undefined): boolean {
  return !LANDINGS_SIN_BANNER_CUPON.includes(landingId ?? -1);
}

/**
 * El cupón que amerita el tratamiento de diseño (banner + cuota con descuento
 * en las cards), o `null`.
 *
 * Sale con todo cupón que llegó por link: el de referido y el de campaña. Era
 * exclusivo del de referido (`referrerName`), y quien entraba con un cupón de
 * campaña válido recorría la landing y el catálogo sin ninguna señal de que lo
 * tenía puesto.
 *
 * Queda afuera el cupón que no da nada (valor 0 y sin regalo: los de
 * seguimiento): sigue aplicado y viaja en la solicitud, pero anunciarlo como
 * «cupón aplicado» prometería un beneficio que no existe.
 */
export function cuponConBanner(coupon: AppliedCoupon | null | undefined): AppliedCoupon | null {
  if (!coupon?.lockedFromUrl) return null;
  return coupon.referrerName || couponHasBenefit(coupon) ? coupon : null;
}

/**
 * El texto corto de la franja de cupón de la portada, sin el código:
 * «El descuento aplica en tu primera cuota» / «…en tus primeras 3 cuotas» /
 * «…en todas tus cuotas», o el regalo. `null` si no hay nada que agregar.
 */
export function getCouponStripText(coupon: AppliedCoupon): string | null {
  if (isGiftCoupon(coupon)) {
    return coupon.giftName ? `Incluye de regalo: ${coupon.giftName}` : 'Incluye un regalo';
  }
  if (!(coupon.discount > 0) && !coupon.referrerName) return null;
  const scope = getCouponScopeText(coupon);
  return scope ? `El descuento aplica ${scope}` : null;
}
