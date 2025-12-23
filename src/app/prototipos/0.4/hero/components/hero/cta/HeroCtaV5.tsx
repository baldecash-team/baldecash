'use client';

/**
 * HeroCtaV5 - Sticky Mobile
 *
 * Concepto: Botón fijo en la parte inferior en dispositivos móviles
 * Estilo: Siempre visible, maximiza conversión en mobile
 * Uso: Para landing pages con mucho scroll en mobile
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Laptop } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroCtaV5Props {
  onCtaClick?: () => void;
}

export const HeroCtaV5: React.FC<HeroCtaV5Props> = ({ onCtaClick }) => {
  const router = useRouter();

  const handleClick = () => {
    onCtaClick?.();
    router.push('/prototipos/0.4/catalogo/catalog-preview?layout=4&brand=3&card=6&techfilters=3&cols=4&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=1');
  };

  return (
    <>
      {/* Desktop: Botón normal */}
      <div className="hidden md:block">
        <Button
          size="lg"
          radius="lg"
          className="bg-[#4654CD] text-white font-semibold px-10 h-14 text-base cursor-pointer hover:bg-[#3a47b3] transition-colors shadow-lg shadow-[#4654CD]/25"
          startContent={<Laptop className="w-5 h-5" />}
          onPress={handleClick}
        >
          Ver productos
        </Button>
      </div>

      {/* Mobile: Texto informativo */}
      <div className="md:hidden text-center">
        <p className="text-neutral-500 text-sm">
          Cuotas desde <span className="font-bold text-[#4654CD]">S/49/mes</span>
        </p>
      </div>

      {/* Mobile: Botón sticky */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-neutral-100 p-4">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-400">Desde</p>
            <p className="text-lg font-bold text-[#4654CD]">S/49/mes</p>
          </div>
          <Button
            size="lg"
            radius="lg"
            className="bg-[#4654CD] text-white font-semibold px-6 h-12 cursor-pointer hover:bg-[#3a47b3] transition-colors flex-shrink-0"
            startContent={<Laptop className="w-4 h-4" />}
            onPress={handleClick}
          >
            Ver productos
          </Button>
        </div>
      </div>
    </>
  );
};

export default HeroCtaV5;
