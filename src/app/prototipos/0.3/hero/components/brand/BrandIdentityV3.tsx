'use client';

import React from 'react';
import type { BrandIdentityProps } from '../../types/hero';

/**
 * BrandIdentityV3 - Logo Minimalista
 *
 * Diseño ultra limpio con foco en el mensaje
 * Logo pequeño, headline grande
 *
 * Ideal para: Máxima claridad, usuarios que prefieren simplicidad
 */

export const BrandIdentityV3: React.FC<BrandIdentityProps> = ({
  headline = 'Tu laptop para estudiar',
  subheadline = 'Aprobación en 24 horas',
}) => {
  return (
    <div className="py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo minimalista - solo texto */}
        <div className="mb-8">
          <span
            className="text-lg md:text-xl font-bold text-[#4247d2] tracking-wide"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            BaldeCash
          </span>
        </div>

        {/* Headline grande y prominente */}
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6 leading-tight"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          {headline}
        </h1>

        {/* Subheadline */}
        <p
          className="text-xl md:text-2xl text-neutral-500 max-w-2xl mx-auto"
          style={{ fontFamily: "'Asap', sans-serif" }}
        >
          {subheadline}
        </p>

        {/* Precio destacado */}
        <div className="mt-8">
          <p className="text-sm text-neutral-400 uppercase tracking-wider mb-2">
            Desde
          </p>
          <p className="text-5xl md:text-6xl font-bold text-[#4247d2]">
            S/49<span className="text-2xl md:text-3xl font-normal text-neutral-400">/mes</span>
          </p>
        </div>

        {/* Línea decorativa minimalista */}
        <div className="mt-12 flex justify-center">
          <div className="h-px w-32 bg-neutral-200" />
        </div>
      </div>
    </div>
  );
};

export default BrandIdentityV3;
