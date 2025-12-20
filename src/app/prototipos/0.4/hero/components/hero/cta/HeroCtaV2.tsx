'use client';

/**
 * HeroCtaV2 - Boton + Microcopy
 *
 * Concepto: Texto debajo con beneficio clave
 * Estilo: Boton principal + texto de apoyo
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Check } from 'lucide-react';

interface HeroCtaV2Props {
  onCtaClick?: () => void;
}

export const HeroCtaV2: React.FC<HeroCtaV2Props> = ({ onCtaClick }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        size="lg"
        radius="lg"
        className="bg-[#4654CD] text-white font-semibold px-12 py-6 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
        onPress={onCtaClick}
      >
        Solicitar mi laptop
      </Button>
      <div className="flex items-center gap-4 text-sm text-neutral-500">
        <span className="flex items-center gap-1">
          <Check className="w-4 h-4 text-[#03DBD0]" />
          Sin aval
        </span>
        <span className="flex items-center gap-1">
          <Check className="w-4 h-4 text-[#03DBD0]" />
          Sin historial crediticio
        </span>
        <span className="flex items-center gap-1">
          <Check className="w-4 h-4 text-[#03DBD0]" />
          Respuesta en 24h
        </span>
      </div>
    </div>
  );
};

export default HeroCtaV2;
