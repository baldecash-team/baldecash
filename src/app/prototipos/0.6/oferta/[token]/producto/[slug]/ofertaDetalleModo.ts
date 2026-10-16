/**
 * Con qué "modo" se abre la ficha de producto DENTRO de la oferta.
 *
 * Tres entradas distintas a la misma pantalla:
 *
 *   1. Un equipo del catálogo de la oferta (Caso 4/5) → se puede elegir.
 *   2. El equipo que el cliente PIDIÓ → se puede mirar, no elegir: la oferta
 *      existe precisamente porque ese equipo no calificaba.
 *   3. El equipo de una oferta ESTÁNDAR (WEB-05) → tampoco se elige acá. La
 *      decisión es aceptar o rechazar y vive en la pantalla de la oferta; el
 *      CTA "Elegir este equipo" llamaría a `/select`, que en una estándar
 *      responde `variant_not_eligible`.
 *
 * En los dos casos de solo lectura la ficha además arranca en la celda REAL
 * (plazo, inicial y frecuencia): mostrarle el default del catálogo —el plazo
 * más largo, que da la cuota más baja— sería otra cuota que la suya.
 */
import type { OfferView } from '../../../../services/offerApi';

export interface ModoDetalle {
  /** Sin CTA "Elegir este equipo". */
  readOnly: boolean;
  /** 'mensual' | 'semanal' | 'quincenal' — null = la que priorice el catálogo.
   *  Un equipo elegible de la oferta es siempre 'mensual'. */
  frequency: string | null;
  /** Plazo (nº de cuotas) e inicial (%) con los que abrir la ficha. */
  term: number | null;
  initial: number | null;
}

export function modoDetalle(offer: OfferView, slug: string): ModoDetalle {
  // Con el catálogo prendido (BAL-4688) los demás equipos sí se eligen: solo el
  // de la oferta queda de solo lectura (se acepta en la pantalla de la oferta).
  const otroDelCatalogo =
    offer.offerCase === 'standard' && offer.catalogEnabled === true
    && slug !== offer.standardOffer?.productSlug;
  if (offer.offerCase === 'standard' && !otroDelCatalogo) {
    const info = offer.standardOffer ?? null;
    return {
      readOnly: true,
      frequency: info?.paymentFrequency ?? null,
      term: info?.term ?? info?.termMonths ?? null,
      initial: info?.initialPaymentPercent ?? null,
    };
  }

  const reqSlug = offer.requestedProduct?.slug;
  if (reqSlug && reqSlug === slug) {
    return {
      readOnly: true,
      frequency: offer.requestedProduct?.payment_frequency ?? null,
      term: offer.requestedProduct?.term ?? null,
      initial: offer.requestedProduct?.initial_percent ?? null,
    };
  }

  // Equipo del catálogo de la oferta (Caso 4/5): la oferta es TODO EN MENSUAL
  // (BAL-4201). La ficha arranca y se queda en mensual; si no, un celular con
  // plan quincenal abría en quincenal y mostraba una cuota que no se cobra.
  return { readOnly: false, frequency: 'mensual', term: null, initial: null };
}
