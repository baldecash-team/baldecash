/**
 * Validación de cupones — POST /public/coupons/validate
 */

import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface CouponValidateResponse {
  valid: boolean;
  code: string | null;
  coupon_type: 'fixed' | 'percent_quotas' | null;
  value: string | null;
  quotas_affected: number | null;
  label: string | null;
  error_message: string | null;
}

export interface ValidateCouponOptions {
  code: string;
  landingId?: number | null;
  productId?: number;
}

export async function validateCoupon(
  options: ValidateCouponOptions
): Promise<{ ok: true; coupon: AppliedCoupon } | { ok: false; error?: string }> {
  const { code, landingId, productId } = options;

  try {
    const response = await fetch(`${API_BASE_URL}/public/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.trim(),
        ...(productId != null ? { product_id: productId } : {}),
        ...(landingId != null ? { landing_id: landingId } : {}),
      }),
    });

    const data: CouponValidateResponse = await response.json();

    if (data?.valid && data.code && data.value && data.label) {
      return {
        ok: true,
        coupon: {
          code: data.code,
          discount: parseFloat(data.value),
          label: data.label,
          couponType: data.coupon_type || 'fixed',
          quotasAffected: data.quotas_affected ?? undefined,
        },
      };
    }

    return { ok: false, error: data.error_message ?? undefined };
  } catch {
    return { ok: false };
  }
}
