'use client';

/**
 * HeroCtaV1 - Boton Simple
 *
 * Concepto: Solo texto claro y directo
 * Estilo: Minimalista, sin distracciones
 */

import React from 'react';
import { Button } from '@nextui-org/react';

interface HeroCtaV1Props {
  onCtaClick?: () => void;
}

export const HeroCtaV1: React.FC<HeroCtaV1Props> = ({ onCtaClick }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        size="lg"
        className="bg-[#4654CD] text-white font-semibold px-12 py-6 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
        onPress={onCtaClick}
      >
        Solicitar mi laptop
      </Button>
    </div>
  );
};

export default HeroCtaV1;
