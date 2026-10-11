'use client';

/**
 * El cupón a avisar en la portada de la landing.
 *
 * Quien entra con `?cupon=X` o `?coupon=X` no veía nada del cupón hasta llegar
 * a la solicitud: la portada solo lo guardaba como pendiente y recién el
 * catálogo lo validaba. Acá se valida para MOSTRARLO (la franja superior del
 * navbar, del mismo tipo que el banner promocional).
 *
 * Deliberadamente no lo aplica ni borra el pendiente: de eso se sigue
 * encargando el catálogo (`useCampaignCoupon`), que es quien tiene el
 * `ProductContext`. La portada solo avisa.
 */

import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { captureLandingParams, getPendingCoupon } from '@/app/prototipos/0.6/utils/landingParams';
import { getAppliedCouponFromStorage } from '@/app/prototipos/0.6/utils/leadModalStorage';
import { validateCoupon } from '@/app/prototipos/0.6/utils/couponApi';
import { cuponConBanner, landingMuestraBannerDeCupon } from '@/app/prototipos/0.6/utils/couponBanner';

/**
 * 1. Si la URL trajo cupón (queda como pendiente), se valida contra la landing.
 * 2. Si no, se reusa el que ya quedó aplicado por link en una visita anterior
 *    (volvió del catálogo a la portada, recargó sin el parámetro).
 *
 * Devuelve `null` si no hay cupón, si no es válido, si no da ningún beneficio
 * (ver `cuponConBanner`) o si la landing está excluida de la UI de cupón.
 */
async function resolverCupon(
  landingSlug: string,
  landingId: number | null | undefined
): Promise<AppliedCoupon | null> {
  if (landingId == null || !landingMuestraBannerDeCupon(landingId)) return null;

  // Capturar acá y no confiar en el otro efecto de la portada: los efectos
  // corren en orden de declaración y este puede ir antes. Sin esta línea la
  // primera pasada leería un pendiente que todavía no existe. `capture` es
  // idempotente.
  captureLandingParams(landingSlug);

  const pendingCode = getPendingCoupon(landingSlug);
  if (!pendingCode) return cuponConBanner(getAppliedCouponFromStorage(landingSlug));

  const result = await validateCoupon({ code: pendingCode, landingId });
  return result.ok ? cuponConBanner({ ...result.coupon, lockedFromUrl: true }) : null;
}

export function useLandingCoupon(
  landingSlug: string,
  landingId: number | null | undefined
): AppliedCoupon | null {
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    let vigente = true;
    resolverCupon(landingSlug, landingId)
      .then((resuelto) => {
        if (vigente) setCoupon(resuelto);
      })
      .catch((error) => {
        // `validateCoupon` ya atrapa sus fallas de red y devuelve `ok: false`;
        // si algo llega hasta acá es inesperado. La portada sigue sin franja.
        Sentry.captureException(error, {
          tags: { modulo: 'cupon', accion: 'validar_en_portada', landing: landingSlug },
        });
      });
    return () => {
      vigente = false;
    };
  }, [landingSlug, landingId]);

  return coupon;
}
