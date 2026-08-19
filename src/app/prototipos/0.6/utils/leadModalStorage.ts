/**
 * Puente entre el modal de captura y el formulario de solicitud.
 *
 * El cupon se escribe en la MISMA clave y con el MISMO tipo que
 * ProductContext ya lee (ProductContext.tsx:29 y :118). Se marca
 * `lockedFromUrl: true` para que el usuario no pueda quitarlo: se lo dieron a
 * cambio de sus datos.
 */

import { getWizardFieldKey } from '../[landing]/solicitar/utils/wizardScopedStorage';

const couponKey = (landing: string) => `baldecash-${landing}-solicitar-applied-coupon`;
// MISMA clave que ya lee DocumentNumberField para autocompletar y bloquear el
// campo (BAL-1806). Inventar una clave nueva duplicaria un mecanismo que ya
// funciona y tiene tests.
const documentKey = (landing: string) => `baldecash-dni-${landing}`;

// Code REAL del campo celular en el form builder, confirmado contra
// form_field (local y prod): 'phone' mapea a person.phone y es el código de
// mayor uso entre los landings activos (76 en local / 85 en prod, a la par de
// document_number). Los otros codes de tipo 'phone' que existen en la BD
// (phone_secondary, supporter_phone, student_phone) son campos distintos —
// celular alterno, del apoderado, del estudiante — no el propio del
// postulante que este modal captura.
const PHONE_FIELD_CODE = 'phone';
const DOCUMENT_NUMBER_FIELD_CODE = 'document_number';

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

export interface LeadModalSubmission {
  documentNumber: string;
  phone: string;
  coupon: ModalCoupon | null;
}

/**
 * Escribe las CUATRO claves que el modal deja al enviar, en un solo paso
 * (BAL-3125 Tarea 4, punto 10):
 *
 * 1. `baldecash-{landing}-solicitar-applied-coupon` — el cupón, lockedFromUrl.
 * 2. `baldecash-dni-{landing}` — el documento pelado (BAL-1806).
 * 3. `baldecash-{landing}-wizard-field-document_number` — el documento.
 * 4. `baldecash-{landing}-wizard-field-{code celular}` — el celular.
 *
 * Documento y celular se guardan SIEMPRE, tenga o no cupón la landing: sirven
 * para autocompletar la solicitud igual. El cupón solo si vino uno.
 */
export function saveLeadModalSubmission(
  landingSlug: string,
  submission: LeadModalSubmission
): void {
  if (typeof window === 'undefined') return;

  saveDocumentFromModal(landingSlug, submission.documentNumber);

  try {
    localStorage.setItem(
      getWizardFieldKey(landingSlug, DOCUMENT_NUMBER_FIELD_CODE),
      submission.documentNumber
    );
    localStorage.setItem(
      getWizardFieldKey(landingSlug, PHONE_FIELD_CODE),
      submission.phone
    );
  } catch {}

  // `wizard-field-{code}` NO es un mecanismo generico de prefill: solo
  // `document_number` lo consume, hardcodeado en DocumentNumberField y
  // kycClient. El formulario restaura sus valores desde
  // `baldecash-wizard-{slug}-data` ({campo: {value}}), asi que el celular
  // hay que dejarlo AHI o el campo llega vacio — medido en el navegador,
  // sin ningun error a la vista.
  try {
    const clave = `baldecash-wizard-${landingSlug}-data`;
    const crudo = localStorage.getItem(clave);
    const data = crudo ? (JSON.parse(crudo) as Record<string, { value?: unknown }>) : {};

    // Lo que el usuario ya cargo vale mas que lo del modal: si empezo la
    // solicitud y despues abre el modal, no se le pisan sus datos.
    if (data.phone?.value == null || data.phone.value === '') {
      data.phone = { ...(data.phone ?? {}), value: submission.phone };
    }
    if (data.document_number?.value == null || data.document_number.value === '') {
      data.document_number = { ...(data.document_number ?? {}), value: submission.documentNumber };
    }

    localStorage.setItem(clave, JSON.stringify(data));
  } catch {}

  if (submission.coupon) {
    saveCouponFromModal(landingSlug, submission.coupon);
  }
}
