'use client';

/**
 * Revalida el cupón aplicado con el documento del cliente.
 *
 * El cupón se valida al entrar (por link o al escribirlo en el resumen), antes
 * de que la web conozca el documento. Dos reglas dependen del documento —la
 * lista cerrada de invitados y el tope por persona— y solo se veían al enviar
 * la solicitud, al final del formulario. Acá se revisan apenas el cliente
 * escribe su documento:
 *
 * - Pasa: el cupón de lista cerrada queda confirmado para ese documento.
 * - El documento no está invitado o ya llegó a su tope: el cupón se retira con
 *   un aviso (`removeCouponForDocument`) y el cliente sigue sin cupón.
 * - Cualquier otra respuesta, o un fallo de red: no se toca nada. La decisión
 *   final la sigue tomando el envío de la solicitud.
 */

import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import { validateCoupon } from '@/app/prototipos/0.6/utils/couponApi';
import { getCouponDocumentRejection } from '@/app/prototipos/0.6/utils/couponDocument';
import { useProductOptional } from '../context/ProductContext';
import { useEventTrackerOptional } from '../context/EventTrackerContext';

interface UseCouponDocumentCheckOptions {
  /** Documento completo y con formato válido, o `null` mientras no lo esté. */
  documentNumber: string | null;
  landingId: number | null | undefined;
  /** Espera antes de consultar; el mismo ritmo que el `check-person` del campo. */
  debounceMs?: number;
}

export function useCouponDocumentCheck({
  documentNumber,
  landingId,
  debounceMs = 500,
}: UseCouponDocumentCheckOptions): void {
  const product = useProductOptional();
  const tracker = useEventTrackerOptional();

  const appliedCoupon = product?.appliedCoupon ?? null;
  const couponCode = appliedCoupon?.code ?? null;
  const productId = product?.selectedProduct?.id ?? product?.cartProducts[0]?.id ?? null;

  // Lo último que se leyó del contexto, para decidir DESPUÉS de la respuesta
  // sin que el efecto dependa del objeto entero (y se relance al confirmarlo).
  const productRef = useRef(product);
  const trackerRef = useRef(tracker);
  // El documento vigente. No se limpia al desmontar el campo: quien escribe
  // su documento y pasa de paso enseguida igual recibe la respuesta.
  const documentRef = useRef(documentNumber);
  useEffect(() => {
    productRef.current = product;
    trackerRef.current = tracker;
    documentRef.current = documentNumber;
  });

  // Par cupón+documento ya consultado: no repetir la llamada en cada render.
  const lastChecked = useRef('');

  useEffect(() => {
    if (!documentNumber || !couponCode) return;

    const checkKey = `${couponCode}:${documentNumber}:${productId ?? ''}`;
    if (lastChecked.current === checkKey) return;

    const timer = setTimeout(() => {
      lastChecked.current = checkKey;

      validateCoupon({
        code: couponCode,
        productId: productId ? parseInt(productId, 10) : undefined,
        landingId: landingId ?? undefined,
        documentNumber,
      })
        .then((result) => {
          const contexto = productRef.current;
          const actual = contexto?.appliedCoupon;
          // Mientras respondía, el cliente cambió el documento o quitó el cupón.
          if (documentRef.current !== documentNumber) return;
          if (!contexto || !actual || actual.code !== couponCode) return;

          if (result.ok) {
            const restricted = !!result.coupon.restrictedToDocumentList;
            const pending = !!result.coupon.requiresDocument;
            if (
              !!actual.restrictedToDocumentList === restricted &&
              !!actual.requiresDocument === pending
            ) {
              return;
            }
            // Solo cambian las dos marcas: el resto del cupón (candado de
            // campaña, referido, regalo) queda como estaba.
            contexto.setAppliedCoupon({
              ...actual,
              restrictedToDocumentList: restricted || undefined,
              requiresDocument: pending || undefined,
            });
            return;
          }

          const rejection = getCouponDocumentRejection(result.errorCodes);
          if (!rejection) return;

          contexto.removeCouponForDocument({ code: couponCode, rejection });
          trackerRef.current?.track('coupon_removed', {
            coupon_code: couponCode,
            reason: rejection,
            source: 'document_check',
          });
        })
        .catch((error) => {
          // `validateCoupon` ya atrapa sus fallas de red; lo que llegue acá es
          // inesperado. El cupón queda como estaba y el envío decide.
          lastChecked.current = '';
          Sentry.captureException(error, {
            tags: { modulo: 'cupon', accion: 'revalidar_con_documento' },
          });
        });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [documentNumber, couponCode, productId, landingId, debounceMs]);
}
