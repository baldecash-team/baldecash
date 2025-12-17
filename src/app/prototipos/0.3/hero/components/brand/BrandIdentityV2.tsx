'use client';

import React from 'react';
import { Monitor, Zap, Shield } from 'lucide-react';
import type { BrandIdentityProps } from '../../types/hero';

/**
 * BrandIdentityV2 - Logo Lateral + Mensaje
 *
 * Diseño asimétrico con logo a la izquierda
 * Contenido principal a la derecha
 *
 * Ideal para: Layouts más dinámicos, espacio para más contenido
 */

export const BrandIdentityV2: React.FC<BrandIdentityProps> = ({
  headline = 'La laptop que necesitas',
  subheadline = 'Financiamiento para estudiantes sin historial crediticio',
}) => {
  return (
    <div className="py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Logo lado izquierdo */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="bg-[#4247d2] px-6 py-3 md:px-8 md:py-4 rounded-xl shadow-lg">
                <span
                  className="text-2xl md:text-3xl font-bold text-white"
                  style={{ fontFamily: "'Baloo 2', cursive" }}
                >
                  BaldeCash
                </span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-[#4247d2]/20 blur-lg -z-10" />
            </div>
          </div>

          {/* Contenido lado derecho */}
          <div className="flex-1 text-center md:text-left">
            <h1
              className="text-3xl md:text-5xl font-bold text-neutral-800 mb-4"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {headline}
            </h1>
            <p
              className="text-lg md:text-xl text-neutral-600 mb-6 max-w-lg"
              style={{ fontFamily: "'Asap', sans-serif" }}
            >
              {subheadline}
            </p>

            {/* Quick benefits */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-neutral-600">
                <Monitor className="w-5 h-5 text-[#4247d2]" />
                <span className="text-sm">Laptops desde S/1,000</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Zap className="w-5 h-5 text-[#4247d2]" />
                <span className="text-sm">Aprobación en 24h</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Shield className="w-5 h-5 text-[#4247d2]" />
                <span className="text-sm">Sin historial crediticio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandIdentityV2;
