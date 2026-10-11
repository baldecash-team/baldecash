import {
  couponHasBenefit,
  getCouponQuotaDisplay,
  getCouponQuotas,
  getCouponScopeText,
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
    // S/239 al mes, antes S/478. Con 10% en la primera cuota se paga S/215.10 y
    // después S/239 — no los S/478 del tachado de la promoción.
    const r = getCouponQuotaDisplay(239, cupon({ quotasAffected: 1 }), 478);

    expect(r.firstQuota).toBeCloseTo(215.1);
    expect(r.quotaAfter).toBe(239);
    expect(r.regularQuota).toBe(239);
    expect(r.listQuota).toBe(478);
  });

  it('un cupón sin descuento no inventa una oferta sobre un equipo en promoción', () => {
    const r = getCouponQuotaDisplay(239, cupon({ discount: 0, quotasAffected: 1 }), 478);

    expect(r.hasFirstQuotaOffer).toBe(false);
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
