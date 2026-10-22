/**
 * Alcance y precios de vitrina de un cupón.
 *
 * `quotasAffected` sigue la regla del backend (`coupon.quotas_affected`):
 * vacío = TODAS las cuotas, 1 = solo la primera, N = las primeras N. Vale igual
 * para monto fijo y para porcentaje. El cupón de regalo (`free_accessory`) no
 * descuenta nada.
 *
 * Desde el 22-oct-2026 la cuota que queda después del cupón se cobra en soles
 * enteros (`redondearAlSol`/`cuotaConCupon`): es la misma regla que el legacy
 * (`Cronograma::cuotaConCupon`) y ws2 (`cuota_rebajada`), que son los que
 * cobran — la vitrina no puede prometer un número distinto al de la boleta.
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

/**
 * Redondeo al sol entero, mitad hacia arriba: 125.30→125, 125.50→126, 125.70→126.
 * Primero se lleva a céntimos para quitar el ruido binario (105 × 0.9 =
 * 94.49999999999999 es 94.50 y sube a 95). Es la misma regla que ws2 (Decimal
 * ROUND_HALF_UP) y que el legacy (`Cronograma::cuotaConCupon`), que es el que
 * cobra. Nunca negativo.
 *
 * El `+1e-7` antes de redondear es aparte del ruido de arriba: un monto EXACTO
 * como 37.495 se representa en binario como 3749.4999999999995 céntimos, y
 * sin el empujón el redondeo cae para el lado equivocado (37, no 38). No
 * alcanza con los céntimos de más arriba porque ese ruido nace de la
 * MULTIPLICACIÓN (`monto * 100`), no de `Math.round`. `cuotaConCupon` no pasa
 * por esta función: hace la cuenta en céntimos enteros desde el arranque
 * (ver abajo) para no heredar este mismo problema con el float crudo de la
 * cuota ya rebajada.
 */
export function redondearAlSol(monto: number): number {
  if (!Number.isFinite(monto) || monto <= 0) return 0;
  const centimos = Math.round(monto * 100 + 1e-7);
  return Math.floor((centimos + 50) / 100);
}

type CuponParaCuota = Pick<AppliedCoupon, 'couponType' | 'discount'>;

/**
 * La cuota que se cobra con el cupón: la regular rebajada y redondeada al
 * sol. Vale para porcentaje y para monto fijo (decisión D1); el cupón de
 * regalo y el que no descuenta nada dejan la cuota tal cual.
 *
 * La cuenta se hace en CÉNTIMOS ENTEROS desde el arranque (`regC`), no sobre
 * el float crudo de `regular`: contra una grilla de 1,011,431 combinaciones,
 * el legacy (PHP, el que cobra) y ws2 (Decimal) daban 0 diferencias entre sí,
 * pero esta función — calculando `regular * (100 - discount) / 100`
 * directamente sobre el float — se quedaba 1 sol por debajo en 82 casos con
 * céntimos: 74.99 al 50 % es 37.495 exacto, pero en punto flotante
 * `74.99 * 50 / 100` da 37.494999999999997 (no 37.495) y redondeaba a 37 en
 * vez de 38. Trabajando en céntimos (`regC = Math.round(regular * 100)`)
 * antes de aplicar el descuento, la resta/porcentaje cae siempre en el medio
 * exacto (3749.5, no 3749.4999…) y el redondeo final es consistente con PHP.
 */
export function cuotaConCupon(regular: number, coupon: CuponParaCuota): number {
  if (!Number.isFinite(regular) || regular <= 0) return 0;
  if (coupon.couponType === 'free_accessory' || !(coupon.discount > 0)) return regular;

  const regC = Math.round(regular * 100);
  const brutaC =
    coupon.couponType === 'percent_quotas'
      ? (regC * (100 - coupon.discount)) / 100
      : regC - Math.round(coupon.discount * 100);
  const cent = Math.round(brutaC);

  return cent <= 0 ? 0 : Math.floor((cent + 50) / 100);
}

/**
 * Lo que el cupón rebaja en cada cuota, coherente con `cuotaConCupon`. La
 * resta se hace en céntimos (igual que arriba) y recién al final se vuelve a
 * soles: `regular - cuotaConCupon(...)` directamente arrastra el ruido de
 * float de `regular` (189.90 − 140 da 49.900000000000006, no 49.9 exacto).
 */
export function descuentoPorCuota(regular: number, coupon: CuponParaCuota): number {
  const regC = Math.round(regular * 100);
  const cuotaC = Math.round(cuotaConCupon(regular, coupon) * 100);
  return Math.max(0, regC - cuotaC) / 100;
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

  // La cuota con cupón, redondeada al sol entero: es lo que se cobra.
  const firstQuota = cuotaConCupon(regularQuota, coupon);

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
