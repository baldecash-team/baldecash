'use client';

/**
 * HeroCtaV3 - Doble Acción
 *
 * Concepto: Botón primario + botón secundario lado a lado
 * Estilo: Ofrece dos caminos claros al usuario
 * Uso: Cuando hay una acción principal y una alternativa (ej: solicitar vs simular)
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowRight, Calculator } from 'lucide-react';

interface HeroCtaV3Props {
  onCtaClick?: () => void;
}

export const HeroCtaV3: React.FC<HeroCtaV3Props> = ({ onCtaClick }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <Button
        size="lg"
        radius="lg"
        className="bg-[#4654CD] text-white font-semibold px-8 h-14 text-base cursor-pointer hover:bg-[#3a47b3] transition-colors shadow-lg shadow-[#4654CD]/25 group"
        endContent={
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        }
        onPress={onCtaClick}
      >
        Solicitar ahora
      </Button>
      <Button
        size="lg"
        radius="lg"
        variant="bordered"
        className="border-2 border-neutral-200 text-neutral-700 font-semibold px-8 h-14 text-base cursor-pointer hover:border-[#4654CD] hover:text-[#4654CD] transition-colors"
        startContent={<Calculator className="w-5 h-5" />}
      >
        Simular cuota
      </Button>
    </div>
  );
};

export default HeroCtaV3;
