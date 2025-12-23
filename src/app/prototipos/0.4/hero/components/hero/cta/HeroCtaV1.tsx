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
import { useRouter } from 'next/navigation';
import { Laptop } from 'lucide-react';

interface HeroCtaV1Props {
  onCtaClick?: () => void;
}

export const HeroCtaV1: React.FC<HeroCtaV1Props> = ({ onCtaClick }) => {
  const router = useRouter();

  const handleClick = () => {
    onCtaClick?.();
    router.push('/prototipos/0.4/catalogo');
  };

  return (
    <Button
      size="lg"
      radius="lg"
      className="bg-[#4654CD] text-white font-semibold px-10 h-14 text-base cursor-pointer hover:bg-[#3a47b3] transition-colors shadow-lg shadow-[#4654CD]/25"
      startContent={<Laptop className="w-5 h-5" />}
      onPress={handleClick}
    >
      Ver productos
    </Button>
  );
};

export default HeroCtaV1;
