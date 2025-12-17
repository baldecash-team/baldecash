'use client';

import React from 'react';
import { Slider } from '@nextui-org/react';
import type { BrandIdentityProps } from '../../types/hero';
import { mockQuotaCalculator } from '../../data/mockHeroData';

/**
 * BrandIdentityV1 - Logo + Tagline Centrado
 *
 * Diseño clásico con logo centrado prominente
 * Incluye mini-calculadora de cuotas integrada
 *
 * Ideal para: Máxima visibilidad de marca
 */

export const BrandIdentityV1: React.FC<BrandIdentityProps> = ({
  headline = 'La laptop que necesitas',
  subheadline = 'Financiamiento para estudiantes sin historial crediticio',
  showCalculator = true,
  calculatorConfig = mockQuotaCalculator,
}) => {
  const [amount, setAmount] = React.useState(calculatorConfig.defaultAmount);

  // Calcular cuota estimada (fórmula simplificada)
  const monthlyQuota = Math.round(
    (amount * (1 + calculatorConfig.monthlyRate * 24)) / 24
  );

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8 md:py-12 px-4">
      {/* Logo BaldeCash */}
      <div className="relative">
        <div className="bg-[#4247d2] px-8 py-4 md:px-12 md:py-6 rounded-2xl shadow-lg">
          <h1
            className="text-4xl md:text-6xl font-bold text-white text-center"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            BaldeCash
          </h1>
        </div>
        {/* Decorative glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-[#4247d2]/20 blur-xl -z-10" />
      </div>

      {/* Headline */}
      <h2
        className="text-2xl md:text-4xl font-bold text-neutral-800 text-center max-w-2xl"
        style={{ fontFamily: "'Baloo 2', cursive" }}
      >
        {headline}
      </h2>

      {/* Subheadline */}
      <p
        className="text-base md:text-lg text-neutral-600 text-center max-w-md"
        style={{ fontFamily: "'Asap', sans-serif" }}
      >
        {subheadline}
      </p>

      {/* Mini Calculadora */}
      {showCalculator && (
        <div className="w-full max-w-sm bg-neutral-50 rounded-xl p-4 md:p-6 mt-4">
          <p className="text-sm text-neutral-500 mb-2 text-center">
            ¿Cuánto necesitas?
          </p>
          <Slider
            size="lg"
            step={100}
            minValue={calculatorConfig.minAmount}
            maxValue={calculatorConfig.maxAmount}
            value={amount}
            onChange={(val) => setAmount(val as number)}
            className="max-w-full"
            classNames={{
              track: 'bg-neutral-200',
              filler: 'bg-[#4247d2]',
              thumb: 'bg-[#4247d2] border-2 border-white shadow-md',
            }}
            aria-label="Monto del financiamiento"
          />
          <div className="flex justify-between mt-2 text-sm text-neutral-500">
            <span>S/{calculatorConfig.minAmount}</span>
            <span>S/{calculatorConfig.maxAmount}</span>
          </div>

          {/* Resultado */}
          <div className="text-center mt-4 pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-500">Tu cuota desde</p>
            <p className="text-3xl font-bold text-[#4247d2]">
              S/{monthlyQuota}<span className="text-lg font-normal">/mes</span>
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Por S/{amount.toLocaleString()} a 24 meses
            </p>
          </div>
        </div>
      )}

      {/* Decorative underline */}
      <div className="h-1 w-16 bg-[#4247d2] rounded-full" />
    </div>
  );
};

export default BrandIdentityV1;
