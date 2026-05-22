'use client';

import React from 'react';
import { Sparkles, Crown, Gift } from 'lucide-react';
import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

interface CouponCampaignBannerProps {
  coupon: AppliedCoupon;
  isValidating?: boolean;
}

/** Devuelve solo el primer nombre, capitalizado. "joseph david" → "Joseph" */
function formatFirstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? '';
  return first.length > 0 ? first[0].toUpperCase() + first.slice(1).toLowerCase() : '';
}

/**
 * Banner de campaña de cupón referido: gradient azul primario con
 * elementos decorativos flotantes (estilo ReferralHero).
 */
export const CouponCampaignBanner: React.FC<CouponCampaignBannerProps> = ({
  coupon,
  isValidating = false,
}) => {
  const firstQuotaOnly = (coupon.quotasAffected ?? 1) <= 1;
  const referrerDisplay = coupon.referrerName ? formatFirstName(coupon.referrerName) : null;

  return (
    <section
      className="relative overflow-hidden rounded-2xl shadow-md"
      style={{
        backgroundImage:
          'linear-gradient(to bottom right, var(--color-primary), color-mix(in srgb, var(--color-primary) 90%, white), color-mix(in srgb, var(--color-primary) 70%, white))',
      }}
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes coupon-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .coupon-banner-float { animation: coupon-float 3s ease-in-out infinite; }
        .coupon-banner-float-slow { animation: coupon-float 4.5s ease-in-out infinite; }
      `}</style>

      {/* Capa decorativa flotante (no clickeable) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-6 left-8 w-3 h-3 bg-white/25 rounded-full animate-pulse" />
        <div className="absolute top-10 right-16 w-2.5 h-2.5 bg-amber-300/60 rounded-full coupon-banner-float" />
        <div className="absolute bottom-8 left-1/4 w-4 h-4 bg-white/15 rounded-full coupon-banner-float-slow" />
        <div className="absolute top-4 right-1/3 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
        <Sparkles className="absolute top-8 right-1/4 w-6 h-6 text-amber-200/50 coupon-banner-float" />
        <Sparkles className="absolute bottom-6 left-10 w-5 h-5 text-white/30 coupon-banner-float-slow" />
        <Gift className="absolute top-1/2 left-6 -translate-y-1/2 w-7 h-7 text-white/15 coupon-banner-float-slow" />
        <Crown className="absolute bottom-4 right-6 w-10 h-10 text-amber-200/20" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 px-4 py-6 sm:px-6 sm:py-7 text-center">
        {isValidating ? (
          <p className="text-base font-semibold text-white">
            ✨ Validando cupón de campaña…
          </p>
        ) : (
          <>
            {/* Título personalizado con nombre del referido */}
            <div className="flex flex-col items-center justify-center gap-1 mb-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl" aria-hidden>🎉</span>
                <p className="text-sm sm:text-base font-bold text-white/80 uppercase tracking-wide">
                  Eres referido de
                </p>
                <span className="text-2xl sm:text-3xl" aria-hidden>🎁</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-['Baloo_2',_sans-serif] leading-tight drop-shadow-sm break-words max-w-2xl">
                {referrerDisplay || 'Cupón canjeado'}
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="text-sm sm:text-base font-bold text-white">
                Cupón
              </span>
              <span className="font-mono text-base sm:text-lg font-black tracking-wider text-[var(--color-primary)] bg-white px-3 py-1 rounded-full uppercase shadow-sm">
                {coupon.code}
              </span>
            </div>

            {firstQuotaOnly && (
              <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto leading-relaxed">
                El descuento aplica solo en tu <strong>primera cuota</strong>.
                Las siguientes mantienen el precio de lista.
              </p>
            )}

            <p className="hidden sm:block text-xs sm:text-sm text-white/75 mt-2">
              🔒 No se puede quitar en esta campaña · Las tarjetas muestran la oferta de 1.ª cuota
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default CouponCampaignBanner;
