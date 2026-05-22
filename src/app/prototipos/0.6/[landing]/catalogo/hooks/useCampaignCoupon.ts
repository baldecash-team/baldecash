'use client';

/**
 * Valida y aplica el cupón de campaña (?coupon=...) al entrar al catálogo,
 * sin esperar a que el usuario seleccione un producto en /solicitar.
 */

import { useEffect, useRef, useState } from 'react';
import { useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { getPendingCoupon, clearPendingCoupon } from '@/app/prototipos/0.6/utils/landingParams';
import { validateCoupon } from '@/app/prototipos/0.6/utils/couponApi';

export interface UseCampaignCouponResult {
  /** Código activo para pasar al API del catálogo */
  couponCode: string | null;
  isValidating: boolean;
  validationFailed: boolean;
}

export function useCampaignCoupon(landingSlug: string): UseCampaignCouponResult {
  const { appliedCoupon, setAppliedCoupon, isHydrated } = useProduct();
  const { landingId } = useLayout();
  const [isValidating, setIsValidating] = useState(false);
  const [validationFailed, setValidationFailed] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || attemptedRef.current) return;

    // Cupón ya aplicado (p. ej. recarga de página)
    if (appliedCoupon?.lockedFromUrl) {
      attemptedRef.current = true;
      return;
    }

    const pendingCode = getPendingCoupon(landingSlug);
    if (!pendingCode) return;

    attemptedRef.current = true;
    setIsValidating(true);
    setValidationFailed(false);

    (async () => {
      const result = await validateCoupon({
        code: pendingCode,
        landingId: landingId ?? undefined,
      });

      setIsValidating(false);

      if (result.ok) {
        setAppliedCoupon({
          ...result.coupon,
          lockedFromUrl: true,
        });
        clearPendingCoupon(landingSlug);
      } else {
        setValidationFailed(true);
        clearPendingCoupon(landingSlug);
      }
    })();
  }, [isHydrated, appliedCoupon, landingSlug, landingId, setAppliedCoupon]);

  const couponCode = appliedCoupon?.lockedFromUrl ? appliedCoupon.code : null;

  return { couponCode, isValidating, validationFailed };
}
