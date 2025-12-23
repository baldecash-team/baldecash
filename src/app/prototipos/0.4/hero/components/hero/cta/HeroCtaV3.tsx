'use client';

/**
 * HeroCtaV3 - Doble Acción
 *
 * Concepto: Botón primario + botón secundario lado a lado
 * Estilo: Ofrece dos caminos claros al usuario
 * Uso: Cuando hay una acción principal y una alternativa (ej: ver productos vs simular)
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Laptop, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroCtaV3Props {
  onCtaClick?: () => void;
}

export const HeroCtaV3: React.FC<HeroCtaV3Props> = ({ onCtaClick }) => {
  const router = useRouter();

  const handleCatalogo = () => {
    onCtaClick?.();
    router.push('/prototipos/0.4/catalogo/catalog-preview?layout=4&brand=3&card=6&techfilters=3&cols=4&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=1');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <Button
        size="lg"
        radius="lg"
        className="bg-[#4654CD] text-white font-semibold px-8 h-14 text-base cursor-pointer hover:bg-[#3a47b3] transition-colors shadow-lg shadow-[#4654CD]/25 group"
        startContent={<Laptop className="w-5 h-5" />}
        onPress={handleCatalogo}
      >
        Ver productos
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
