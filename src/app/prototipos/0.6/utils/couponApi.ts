/**
 * Validación de cupones — POST /public/coupons/validate
 */

import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

/** Formato nuevo (cupón de referido) */
export interface CouponValidateReferralResponse {
  success: boolean;
  data?: {
    codigo: string;
    cliente: {
      nombre_completo: string;
      nombres: string;
      apellido_paterno: string;
      apellido_materno: string;
      documento: string;
    };
  };
  error?: string;
}

/** Formato legacy (cupón con descuento explícito) */
export interface CouponValidateLegacyResponse {
  valid: boolean;
  code: string | null;
  coupon_type: 'fixed' | 'percent_quotas' | null;
  value: string | null;
  quotas_affected: number | null;
  label: string | null;
  error_message: string | null;
  /** Nombre del cliente que generó el cupón (cupón de referido) */
  customer_name?: string | null;
}

type CouponValidateResponse =
  | CouponValidateReferralResponse
  | CouponValidateLegacyResponse;

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

    // Nuevo formato: cupón de referido
    if ('success' in data && data.success && data.data?.codigo) {
      const cliente = data.data.cliente;
      const referrerName = cliente?.nombres?.trim() || cliente?.nombre_completo?.trim();
      return {
        ok: true,
        coupon: {
          code: data.data.codigo,
          discount: 0,
          label: referrerName
            ? `Cupón de referido de ${referrerName}`
            : 'Cupón de referido',
          couponType: 'percent_quotas',
          quotasAffected: 1,
          referrerName,
        },
      };
    }

    // Formato legacy (puede incluir customer_name para cupones de referido)
    if ('valid' in data && data.valid && data.code && data.value && data.label) {
      const referrerName = data.customer_name?.trim() || undefined;
      return {
        ok: true,
        coupon: {
          code: data.code,
          discount: parseFloat(data.value),
          label: data.label,
          couponType: data.coupon_type || 'fixed',
          quotasAffected: data.quotas_affected ?? undefined,
          referrerName,
        },
      };
    }

    const errorMessage =
      ('error' in data && data.error) ||
      ('error_message' in data && data.error_message) ||
      undefined;
    return { ok: false, error: errorMessage ?? undefined };
  } catch {
    return { ok: false };
  }
}
