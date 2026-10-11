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
  coupon_type: 'fixed' | 'percent_quotas' | 'free_accessory' | null;
  value: string | null;
  quotas_affected: number | null;
  label: string | null;
  error_message: string | null;
  /** Nombre del cliente que generó el cupón (cupón de referido) */
  customer_name?: string | null;
  /** Nombre del periférico de regalo (free_accessory). Ej: "Cargador Apple 20W" */
  gift_name?: string | null;
  /** Cantidad de unidades del regalo (por defecto 1) */
  gift_quantity?: number | null;
  /** Motivos del rechazo (`document_not_allowed`, `user_limit_reached`, …) */
  error_codes?: string[] | null;
  /** El cupón es solo para una lista de documentos invitados */
  restricted_to_document_list?: boolean;
  /** Lista cerrada validada sin documento: falta confirmar al cliente */
  requires_document?: boolean;
}

type CouponValidateResponse =
  | CouponValidateReferralResponse
  | CouponValidateLegacyResponse;

export interface ValidateCouponOptions {
  code: string;
  landingId?: number | null;
  productId?: number;
  /**
   * Documento del cliente, cuando ya se conoce. Con él el backend evalúa la
   * lista cerrada y el tope por persona; sin él, esas reglas quedan para el
   * envío de la solicitud.
   */
  documentNumber?: string;
}

export type ValidateCouponResult =
  | { ok: true; coupon: AppliedCoupon }
  | { ok: false; error?: string; errorCodes?: string[] };

export async function validateCoupon(
  options: ValidateCouponOptions
): Promise<ValidateCouponResult> {
  const { code, landingId, productId, documentNumber } = options;

  try {
    const response = await fetch(`${API_BASE_URL}/public/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.trim(),
        ...(productId != null ? { product_id: productId } : {}),
        ...(landingId != null ? { landing_id: landingId } : {}),
        ...(documentNumber ? { document_number: documentNumber } : {}),
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
          // Esta respuesta no trae ni monto ni alcance: solo dice de quién es
          // el cupón. Se deja en 1 a propósito -- el referido descuenta la
          // primera cuota -- porque acá «sin dato» NO significa «todas».
          quotasAffected: 1,
          referrerName,
        },
      };
    }

    // Formato legacy (puede incluir customer_name para cupones de referido
    // y gift_name/gift_quantity para cupones de regalo, offer_type='gift').
    // Para cupones de regalo el descuento monetario es 0 y puede no venir `value`
    // ni `label`, por eso solo exigimos `valid` + `code`.
    if ('valid' in data && data.valid && data.code) {
      const referrerName = data.customer_name?.trim() || undefined;
      const giftName = data.gift_name?.trim() || undefined;
      return {
        ok: true,
        coupon: {
          code: data.code,
          discount: data.value != null ? parseFloat(data.value) : 0,
          label: data.label ?? '',
          couponType: data.coupon_type || 'fixed',
          // `quotas_affected` vacío = TODAS las cuotas (regla del backend,
          // para monto fijo y para porcentaje). Se guarda sin la clave y así
          // lo lee `getCouponQuotas`: no hay que convertirlo en 1.
          quotasAffected: data.quotas_affected ?? undefined,
          referrerName,
          giftName,
          giftQuantity: giftName ? data.gift_quantity ?? 1 : undefined,
          // Solo viajan cuando son ciertos: un cupón abierto queda igual que
          // antes, sin claves nuevas.
          ...(data.restricted_to_document_list ? { restrictedToDocumentList: true } : {}),
          ...(data.requires_document ? { requiresDocument: true } : {}),
        },
      };
    }

    const errorMessage =
      ('error' in data && data.error) ||
      ('error_message' in data && data.error_message) ||
      undefined;
    const errorCodes =
      'error_codes' in data && Array.isArray(data.error_codes) ? data.error_codes : undefined;
    return { ok: false, error: errorMessage ?? undefined, errorCodes };
  } catch {
    return { ok: false };
  }
}
