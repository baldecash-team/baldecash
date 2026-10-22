import {
  couponHasBenefit,
  cuotaConCupon,
  getCouponQuotaDisplay,
  getCouponQuotas,
  getCouponScopeText,
  redondearAlSol,
} from '../couponPricing';
import { cuponConBanner, getCouponStripText } from '../couponBanner';
import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

/**
 * El front asumía que todo cupón descuenta solo la primera cuota: con
 * `quotasAffected` vacío leía 1, y con más de una cuota no mostraba nada.
 *
 * La regla del backend es otra: vacío = TODAS las cuotas (para monto fijo y
 * para porcentaje), 1 = solo la primera, N = las primeras N. El cupón de
 * regalo no descuenta.
 */

const cupon = (extra: Partial<AppliedCoupon>): AppliedCoupon => ({
  code: 'PRUEBA',
  discount: 10,
  label: '',
  couponType: 'percent_quotas',
  ...extra,
});

describe('getCouponQuotas — a cuántas cuotas alcanza', () => {
  it('vacío significa todas (null), no 1', () => {
    expect(getCouponQuotas(cupon({ quotasAffected: undefined }))).toBeNull();
  });

  it('0 también es todas: el backend lo trata como sin tope', () => {
    expect(getCouponQuotas(cupon({ quotasAffected: 0 }))).toBeNull();
  });

  it('1 y N se respetan', () => {
    expect(getCouponQuotas(cupon({ quotasAffected: 1 }))).toBe(1);
    expect(getCouponQuotas(cupon({ quotasAffected: 3 }))).toBe(3);
  });
});

describe('getCouponScopeText — el alcance en palabras', () => {
  it('1 cuota: «en tu primera cuota»', () => {
    expect(getCouponScopeText(cupon({ quotasAffected: 1 }))).toBe('en tu primera cuota');
  });

  it('3 cuotas: «en tus primeras 3 cuotas»', () => {
    expect(getCouponScopeText(cupon({ quotasAffected: 3 }))).toBe('en tus primeras 3 cuotas');
  });

  it('vacío: «en todas tus cuotas», sea porcentaje o monto fijo', () => {
    expect(getCouponScopeText(cupon({ quotasAffected: undefined }))).toBe('en todas tus cuotas');
    expect(getCouponScopeText(cupon({ couponType: 'fixed', quotasAffected: undefined }))).toBe(
      'en todas tus cuotas'
    );
  });

  it('N cuotas sobre un plazo de N o menos son todas', () => {
    expect(getCouponScopeText(cupon({ quotasAffected: 6 }), 6)).toBe('en todas tus cuotas');
    expect(getCouponScopeText(cupon({ quotasAffected: 6 }), 12)).toBe('en tus primeras 6 cuotas');
  });

  it('el cupón de regalo no tiene alcance: no descuenta', () => {
    expect(getCouponScopeText(cupon({ couponType: 'free_accessory', discount: 0 }))).toBeNull();
  });
});

describe('getCouponQuotaDisplay — la cuota de la card', () => {
  it('1 cuota sigue igual que hoy: 10% sobre S/100 da S/90 y después S/100', () => {
    const r = getCouponQuotaDisplay(100, cupon({ quotasAffected: 1 }));

    expect(r.hasFirstQuotaOffer).toBe(true);
    expect(r.firstQuota).toBe(90);
    expect(r.listQuota).toBe(100);
    expect(r.discountedQuotas).toBe(1);
    expect(r.quotaAfter).toBe(100);
  });

  it('1 cuota con monto fijo: S/100 menos S/15 da S/85', () => {
    const r = getCouponQuotaDisplay(100, cupon({ couponType: 'fixed', discount: 15, quotasAffected: 1 }));

    expect(r.hasFirstQuotaOffer).toBe(true);
    expect(r.firstQuota).toBe(85);
    expect(r.discountedQuotas).toBe(1);
  });

  it('varias cuotas muestra descuento (antes no mostraba nada)', () => {
    const r = getCouponQuotaDisplay(100, cupon({ quotasAffected: 3 }));

    expect(r.hasFirstQuotaOffer).toBe(true);
    expect(r.firstQuota).toBe(90);
    expect(r.discountedQuotas).toBe(3);
    // La cuota normal que sigue después de las 3 con descuento.
    expect(r.quotaAfter).toBe(100);
  });

  it('todas las cuotas muestra descuento: monto fijo con cuotas vacías', () => {
    const r = getCouponQuotaDisplay(
      100,
      cupon({ couponType: 'fixed', discount: 10, quotasAffected: undefined })
    );

    expect(r.hasFirstQuotaOffer).toBe(true);
    expect(r.firstQuota).toBe(90);
    expect(r.discountedQuotas).toBeNull();
    // No hay «después»: el descuento cubre todo el plazo.
    expect(r.quotaAfter).toBeNull();
    expect(r.regularQuota).toBe(100);
  });

  it('todas las cuotas muestra descuento: porcentaje con cuotas vacías', () => {
    const r = getCouponQuotaDisplay(200, cupon({ discount: 25, quotasAffected: undefined }));

    expect(r.hasFirstQuotaOffer).toBe(true);
    expect(r.firstQuota).toBe(150);
    expect(r.discountedQuotas).toBeNull();
  });

  it('N cuotas sobre un plazo de N se muestran como todas', () => {
    const r = getCouponQuotaDisplay(100, cupon({ quotasAffected: 12 }), null, 12);

    expect(r.discountedQuotas).toBeNull();
    expect(r.quotaAfter).toBeNull();
  });

  it('el cupón de regalo no descuenta nada', () => {
    const r = getCouponQuotaDisplay(
      100,
      cupon({ couponType: 'free_accessory', discount: 0, giftName: 'Mochila' })
    );

    expect(r.hasFirstQuotaOffer).toBe(false);
    expect(r.firstQuota).toBe(100);
  });

  it('un equipo en promoción no anuncia el precio tachado como cuota siguiente', () => {
    // S/239 al mes, antes S/478. Con 10% en la primera cuota se paga S/215.10,
    // redondeado al sol entero (S/215), y después S/239 — no los S/478 del
    // tachado de la promoción.
    const r = getCouponQuotaDisplay(239, cupon({ quotasAffected: 1 }), 478);

    expect(r.firstQuota).toBe(215);
    expect(r.quotaAfter).toBe(239);
    expect(r.regularQuota).toBe(239);
    expect(r.listQuota).toBe(478);
  });

  it('un cupón sin descuento no inventa una oferta sobre un equipo en promoción', () => {
    const r = getCouponQuotaDisplay(239, cupon({ discount: 0, quotasAffected: 1 }), 478);

    expect(r.hasFirstQuotaOffer).toBe(false);
  });
});

/**
 * Desde el 22-oct-2026 la cuota rebajada por un cupón se cobra en soles
 * enteros, redondeando al más cercano (mitad hacia arriba): 125.30 → 125,
 * 125.50 → 126, 125.70 → 126. Es la misma regla que el legacy
 * (`Cronograma::cuotaConCupon`) y ws2 (`cuota_rebajada`), que son los que
 * cobran — la tarjeta no puede mostrar un número distinto al que se factura.
 */
describe('redondearAlSol — mitad hacia arriba al sol entero', () => {
  it.each([
    [125.3, 125],
    [125.5, 126],
    [125.7, 126],
    [94.49999999999999, 95],
    [0, 0],
    [-1, 0],
    [NaN, 0],
  ])('%p → %p', (monto, esperado) => {
    expect(redondearAlSol(monto)).toBe(esperado);
  });
});

describe('cuotaConCupon — la cuota que se cobra con el cupón', () => {
  const pct = (d: number) => ({ couponType: 'percent_quotas' as const, discount: d });

  it('179 al 30 % → 125 (125.30 redondea hacia abajo)', () => {
    expect(cuotaConCupon(179, pct(30))).toBe(125);
  });

  it('181 al 30 % → 127 (126.70 redondea hacia arriba)', () => {
    expect(cuotaConCupon(181, pct(30))).toBe(127);
  });

  it('105 al 10 % → 95 (94.50 sube, aunque el float dé 94.49999…)', () => {
    expect(cuotaConCupon(105, pct(10))).toBe(95);
  });

  it('fijo 10.5 sobre 100 → 90 (89.50 sube)', () => {
    expect(cuotaConCupon(100, { couponType: 'fixed', discount: 10.5 })).toBe(90);
  });

  it('100 % de descuento → 0, nunca negativo', () => {
    expect(cuotaConCupon(179, pct(100))).toBe(0);
  });

  it('el cupón de regalo no toca la cuota', () => {
    expect(cuotaConCupon(179, { couponType: 'free_accessory', discount: 0 })).toBe(179);
  });
});

describe('qué cupones se anuncian (banner del catálogo y franja de la portada)', () => {
  it('el de campaña que llegó por link y descuenta, sí', () => {
    const c = cupon({ lockedFromUrl: true });
    expect(cuponConBanner(c)).toBe(c);
  });

  it('el de referido, sí, aunque no traiga monto', () => {
    const c = cupon({ lockedFromUrl: true, discount: 0, referrerName: 'Carla' });
    expect(cuponConBanner(c)).toBe(c);
  });

  it('el de regalo, sí', () => {
    const c = cupon({ lockedFromUrl: true, couponType: 'free_accessory', discount: 0 });
    expect(cuponConBanner(c)).toBe(c);
  });

  it('el que no llegó por link, no', () => {
    expect(cuponConBanner(cupon({ lockedFromUrl: false }))).toBeNull();
  });

  it('el de seguimiento (valor 0, sin regalo), no: no hay beneficio que anunciar', () => {
    const c = cupon({ lockedFromUrl: true, discount: 0 });
    expect(couponHasBenefit(c)).toBe(false);
    expect(cuponConBanner(c)).toBeNull();
  });

  it('el texto de la franja sale del alcance real', () => {
    expect(getCouponStripText(cupon({ quotasAffected: 1 }))).toBe(
      'El descuento aplica en tu primera cuota'
    );
    expect(getCouponStripText(cupon({ quotasAffected: 3 }))).toBe(
      'El descuento aplica en tus primeras 3 cuotas'
    );
    expect(getCouponStripText(cupon({ couponType: 'fixed', quotasAffected: undefined }))).toBe(
      'El descuento aplica en todas tus cuotas'
    );
    expect(
      getCouponStripText(cupon({ couponType: 'free_accessory', discount: 0, giftName: 'Mochila Nova' }))
    ).toBe('Incluye de regalo: Mochila Nova');
  });
});
