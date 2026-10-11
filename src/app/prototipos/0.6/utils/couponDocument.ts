/**
 * Cupón de lista cerrada: solo lo pueden usar los documentos invitados.
 *
 * La web valida el cupón antes de conocer el documento del cliente. Con un
 * cupón de lista cerrada decía «cupón aplicado» a cualquiera y el rechazo
 * recién llegaba al enviar la solicitud, al final del formulario. Ahora el
 * validador avisa que falta confirmarlo (`requires_document`) y, apenas el
 * cliente escribe su documento, se revalida con él.
 *
 * Los textos viven acá porque los muestran varias pantallas (la caja del
 * cupón, la barra del equipo, la franja de la portada y el banner del
 * catálogo) y tienen que decir lo mismo en todas.
 */

import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

type CouponDocumentInfo = Pick<AppliedCoupon, 'restrictedToDocumentList' | 'requiresDocument'>;

/** Falta confirmar el cupón con el documento del cliente. */
export function couponPendingDocument(coupon: CouponDocumentInfo | null | undefined): boolean {
  return !!coupon?.requiresDocument;
}

/** Cupón de lista cerrada ya confirmado para el documento del cliente. */
export function couponConfirmedForDocument(coupon: CouponDocumentInfo | null | undefined): boolean {
  return !!coupon?.restrictedToDocumentList && !coupon.requiresDocument;
}

/** Aviso completo, para donde hay lugar (caja del cupón, banner del catálogo). */
export const COUPON_PENDING_DOCUMENT_NOTICE =
  'Solo para documentos invitados. Lo confirmaremos cuando ingreses tu documento.';

/** Aviso corto, para una sola línea (franja de la portada, barra del equipo). */
export const COUPON_PENDING_DOCUMENT_SHORT = 'Solo para documentos invitados';

export const COUPON_CONFIRMED_DOCUMENT_NOTICE = 'Confirmado para tu documento';

/**
 * Motivos del validador que dependen del documento. Son los únicos por los que
 * la revalidación retira el cupón: cualquier otra respuesta (o un fallo de red)
 * lo deja como estaba y la decisión la toma el envío, como siempre.
 */
export type CouponDocumentRejection = 'not_invited' | 'user_limit';

export function getCouponDocumentRejection(
  errorCodes: string[] | null | undefined
): CouponDocumentRejection | null {
  if (errorCodes?.includes('document_not_allowed')) return 'not_invited';
  if (errorCodes?.includes('user_limit_reached')) return 'user_limit';
  return null;
}

/**
 * Lo que se le dice al cliente cuando el cupón se retira por su documento.
 * Si la landing exige cupón, no puede seguir sin uno: se le dice qué hacer.
 */
export function getCouponRemovedMessage(
  code: string,
  rejection: CouponDocumentRejection,
  isCouponRequired: boolean
): string {
  const motivo =
    rejection === 'not_invited'
      ? `El cupón ${code} es solo para documentos invitados y tu documento no está en la lista.`
      : `Ya usaste el cupón ${code} el máximo de veces permitido.`;
  const salida = isCouponRequired
    ? 'Lo retiramos. Para continuar necesitas ingresar un cupón válido para tu documento.'
    : 'Lo retiramos para que puedas continuar tu solicitud sin cupón.';
  return `${motivo} ${salida}`;
}
