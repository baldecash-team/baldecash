'use client';

/**
 * HeroCtaV1 - Botón Simple
 *
 * Concepto: Un solo botón minimalista sin distracciones
 * Estilo: Limpio, directo, máxima claridad
 * Uso: Cuando se quiere una llamada a la acción sin ruido visual
 */

import React from 'react';
import { Button } from '@nextui-org/react';

interface HeroCtaV1Props {
  onCtaClick?: () => void;
}

export const HeroCtaV1: React.FC<HeroCtaV1Props> = ({ onCtaClick }) => {
  return (
    <Button
      size="lg"
      radius="lg"
      className="bg-[#4654CD] text-white font-semibold px-10 h-14 text-base cursor-pointer hover:bg-[#3a47b3] transition-colors shadow-lg shadow-[#4654CD]/25"
      onPress={onCtaClick}
    >
      Solicitar mi laptop
    </Button>
  );
};

export default HeroCtaV1;
