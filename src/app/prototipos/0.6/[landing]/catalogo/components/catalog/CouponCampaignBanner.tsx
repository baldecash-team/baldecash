'use client';

import React from 'react';
import { Tag, Lock, Info } from 'lucide-react';
import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

interface CouponCampaignBannerProps {
  coupon: AppliedCoupon;
  isValidating?: boolean;
}

/**
 * Banner bajo los filtros de uso: indica cupón de campaña activo y restricciones.
 */
export const CouponCampaignBanner: React.FC<CouponCampaignBannerProps> = ({
  coupon,
  isValidating = false,
}) => {
  const firstQuotaOnly = (coupon.quotasAffected ?? 1) <= 1;

  return (
    <div
      className="mt-4 rounded-xl border-2 border-[rgba(var(--color-primary-rgb),0.25)] bg-[rgba(var(--color-primary-rgb),0.06)] overflow-hidden"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5 text-white" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-800 flex flex-wrap items-center gap-2">
              {isValidating ? (
                'Validando cupón de campaña…'
              ) : (
                <>
                  <span>Cupón</span>
                  <span className="font-mono tracking-wide text-[var(--color-primary)] uppercase">
                    {coupon.code}
                  </span>
                  <span className="text-xs font-semibold text-white bg-[var(--color-primary)] px-2 py-0.5 rounded-full">
                    Aplicado automáticamente
                  </span>
                </>
              )}
            </p>
            {!isValidating && (
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                {coupon.label}
                {firstQuotaOnly && (
                  <span className="block mt-0.5 text-neutral-500">
                    El descuento aplica solo en tu <strong className="text-neutral-700">primera cuota</strong>.
                    Las siguientes cuotas mantienen el precio de lista.
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {!isValidating && (
          <div className="flex items-center gap-2 shrink-0 sm:pl-2 sm:border-l sm:border-[rgba(var(--color-primary-rgb),0.15)]">
            <Lock className="w-4 h-4 text-neutral-400" aria-hidden />
            <span className="text-xs font-medium text-neutral-500">
              No se puede quitar en esta campaña
            </span>
          </div>
        )}
      </div>

      {!isValidating && firstQuotaOnly && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/70 border-t border-[rgba(var(--color-primary-rgb),0.12)]">
          <Info className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" aria-hidden />
          <p className="text-[11px] text-neutral-600">
            Los precios en las tarjetas muestran la <strong>oferta de primera cuota</strong> con el precio de lista tachado.
          </p>
        </div>
      )}
    </div>
  );
};

export default CouponCampaignBanner;
