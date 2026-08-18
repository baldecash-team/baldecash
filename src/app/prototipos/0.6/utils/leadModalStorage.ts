/**
 * Puente entre el modal de captura y el formulario de solicitud.
 *
 * El cupon se escribe en la MISMA clave y con el MISMO tipo que
 * ProductContext ya lee (ProductContext.tsx:29 y :118). Se marca
 * `lockedFromUrl: true` para que el usuario no pueda quitarlo: se lo dieron a
 * cambio de sus datos.
 */

const couponKey = (landing: string) => `baldecash-${landing}-solicitar-applied-coupon`;
// MISMA clave que ya lee DocumentNumberField para autocompletar y bloquear el
// campo (BAL-1806). Inventar una clave nueva duplicaria un mecanismo que ya
// funciona y tiene tests.
const documentKey = (landing: string) => `baldecash-dni-${landing}`;

export interface ModalCoupon {
  code: string;
  discount: number;
  label: string;
  couponType?: 'fixed' | 'percent_quotas' | 'free_accessory';
  quotasAffected?: number;
}

export function saveCouponFromModal(landingSlug: string, coupon: ModalCoupon): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      couponKey(landingSlug),
      JSON.stringify({ ...coupon, lockedFromUrl: true })
    );
  } catch {}
}

export function saveDocumentFromModal(landingSlug: string, documentNumber: string): void {
  if (typeof window === 'undefined') return;
  try {
    // Se guarda el numero PELADO, no un JSON: es el formato que
    // DocumentNumberField ya espera leer.
    localStorage.setItem(documentKey(landingSlug), documentNumber);
  } catch {}
}

export function getDocumentFromModal(landingSlug: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(documentKey(landingSlug));
  } catch {
    return null;
  }
}
