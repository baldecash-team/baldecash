'use client';

/**
 * HeroCtaV8 - Boton con Preview
 *
 * Concepto: Muestra simulacion rapida de cuota
 * Estilo: Inline calculator preview
 */

import React, { useState } from 'react';
import { Button, Slider } from '@nextui-org/react';
import { ArrowRight, Calculator } from 'lucide-react';

interface HeroCtaV8Props {
  onCtaClick?: () => void;
}

export const HeroCtaV8: React.FC<HeroCtaV8Props> = ({ onCtaClick }) => {
  const [months, setMonths] = useState(24);
  const basePrice = 2499;
  const monthlyQuota = Math.round(basePrice / months * 1.15);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Quick Calculator */}
      <div className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-[#4654CD]" />
          <span className="text-sm font-medium text-neutral-700">Simulador rápido</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-neutral-500">Plazo</span>
          <span className="text-sm font-semibold text-neutral-700">{months} meses</span>
        </div>

        <Slider
          aria-label="Plazo en meses"
          size="sm"
          step={6}
          minValue={12}
          maxValue={48}
          value={months}
          onChange={(value) => setMonths(value as number)}
          classNames={{
            base: 'max-w-full mb-4',
            filler: 'bg-[#4654CD]/70',
            thumb: 'bg-white border-2 border-[#4654CD] w-4 h-4 shadow-sm cursor-pointer',
            track: 'bg-neutral-200 h-1',
          }}
        />

        <div className="flex items-baseline justify-center gap-1">
          <span className="text-xs text-neutral-500">Tu cuota:</span>
          <span className="text-3xl font-bold text-[#4654CD] font-['Baloo_2']">S/{monthlyQuota}</span>
          <span className="text-sm text-neutral-500">/mes</span>
        </div>
      </div>

      <Button
        size="lg"
        className="bg-[#4654CD] text-white font-semibold px-12 py-6 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors w-full"
        endContent={<ArrowRight className="w-5 h-5" />}
        onPress={onCtaClick}
      >
        Solicitar con esta cuota
      </Button>

      <p className="text-xs text-neutral-400 text-center">
        *Simulación referencial. La cuota final depende de tu perfil crediticio.
      </p>
    </div>
  );
};

export default HeroCtaV8;
