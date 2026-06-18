'use client';

/**
 * ProductCommitment - Bloque de envío/entrega BaldeCash en el detalle de producto.
 *
 * Muestra "Envío gratis" y, si el producto es de entrega diferida, la fecha
 * estimada ("Entrega: Desde 30 de JUN."). Informativo: no toca pricing.
 */

import React from 'react';
import { Truck } from 'lucide-react';
import { formatDeferredFrom, type DeferredDelivery } from '@/app/prototipos/0.6/utils/deferredDelivery';

interface ProductCommitmentProps {
  /** Entrega diferida (informativa). Solo se muestra el rango si isDeferred === true. */
  deferredDelivery?: DeferredDelivery | null;
}

export const ProductCommitment: React.FC<ProductCommitmentProps> = ({ deferredDelivery }) => {
  const deferredRange = deferredDelivery?.isDeferred
    ? formatDeferredFrom(deferredDelivery.estimatedFrom)
    : '';

  return (
    <div className="bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border-soft,#e5e7eb)] shadow-sm p-5">
      {/* Envío */}
      <div className="flex items-start gap-3">
        <Truck className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[var(--text-strong,#1f2937)] text-sm">Envío gratis</p>
          {deferredRange ? (
            <p className="text-sm text-[var(--text-muted,#6b7280)]">
              Entrega: <span className="font-semibold text-[var(--text-strong,#1f2937)]">{deferredRange}</span>
            </p>
          ) : (
            <p className="text-sm text-[var(--text-muted,#6b7280)]">
              Entrega a domicilio en todo el Perú
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCommitment;
