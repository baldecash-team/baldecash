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
  /** 'mensual' | 'semanal' | 'quincenal' — null = la que priorice el catálogo. */
  frequency: string | null;
  /** Plazo (nº de cuotas) e inicial (%) con los que abrir la ficha. */
  term: number | null;
  initial: number | null;
}

export function modoDetalle(offer: OfferView, slug: string): ModoDetalle {
  if (offer.offerCase === 'standard') {
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

  return { readOnly: false, frequency: null, term: null, initial: null };
}
