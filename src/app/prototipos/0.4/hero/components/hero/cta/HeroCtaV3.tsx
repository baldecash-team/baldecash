'use client';

/**
 * HeroCtaV3 - Boton + Icono
 *
 * Concepto: Flecha o laptop iconizado
 * Estilo: Icono refuerza la accion
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowRight, Laptop } from 'lucide-react';

interface HeroCtaV3Props {
  onCtaClick?: () => void;
}

export const HeroCtaV3: React.FC<HeroCtaV3Props> = ({ onCtaClick }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Button
        size="lg"
        radius="lg"
        className="bg-[#4654CD] text-white font-semibold px-8 py-6 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors group"
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
        className="border-[#4654CD] text-[#4654CD] font-semibold px-8 py-6 text-lg cursor-pointer hover:bg-[#4654CD]/5 transition-colors"
        startContent={<Laptop className="w-5 h-5" />}
      >
        Ver catálogo
      </Button>
    </div>
  );
};

export default HeroCtaV3;
