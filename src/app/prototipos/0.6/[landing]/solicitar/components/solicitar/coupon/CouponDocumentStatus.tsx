'use client';

/**
 * Qué pasó con el cupón al revisar el documento del cliente. Va debajo del
 * campo de documento, que es donde el cliente está mirando cuando se decide:
 *
 * - Cupón de lista cerrada confirmado: una línea verde.
 * - Cupón retirado (no invitado o tope alcanzado): el aviso con el motivo.
 *
 * Mismos colores que la caja del cupón (`CouponInput`).
 */

import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import {
  couponConfirmedForDocument,
  getCouponRemovedMessage,
} from '@/app/prototipos/0.6/utils/couponDocument';
import { useProductOptional } from '../../../context/ProductContext';

interface CouponDocumentStatusProps {
  /** El documento ya está completo: recién ahí «confirmado» significa algo. */
  documentComplete: boolean;
}

export const CouponDocumentStatus: React.FC<CouponDocumentStatusProps> = ({ documentComplete }) => {
  const product = useProductOptional();
  const appliedCoupon = product?.appliedCoupon ?? null;
  const removed = product?.removedCouponNotice ?? null;

  if (removed && !appliedCoupon) {
    return (
      <div
        role="alert"
        className="mt-2 mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
        <p>{getCouponRemovedMessage(removed.code, removed.rejection, false)}</p>
      </div>
    );
  }

  if (documentComplete && appliedCoupon && couponConfirmedForDocument(appliedCoupon)) {
    return (
      <p role="status" className="mt-2 mb-4 flex items-center gap-1 text-sm text-green-600">
        <Check className="h-4 w-4 flex-shrink-0" aria-hidden />
        <span>
          Cupón <strong>{appliedCoupon.code}</strong> confirmado para tu documento.
        </span>
      </p>
    );
  }

  return null;
};

export default CouponDocumentStatus;
