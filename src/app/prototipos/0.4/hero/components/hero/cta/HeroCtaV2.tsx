'use client';

/**
 * HeroCtaV2 - Botón con Beneficios
 *
 * Concepto: Botón principal + lista de beneficios debajo
 * Estilo: Refuerza la decisión mostrando ventajas clave
 * Uso: Cuando se necesita reducir fricción con microcopy
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Check, Laptop } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroCtaV2Props {
  onCtaClick?: () => void;
}

const benefits = ['Sin aval', 'Sin historial', '100% digital'];

export const HeroCtaV2: React.FC<HeroCtaV2Props> = ({ onCtaClick }) => {
  const router = useRouter();

  const handleClick = () => {
    onCtaClick?.();
    router.push('/prototipos/0.4/catalogo/catalog-preview?layout=4&brand=3&card=6&techfilters=3&cols=4&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=1');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        size="lg"
        radius="lg"
        className="bg-[#4654CD] text-white font-semibold px-10 h-14 text-base cursor-pointer hover:bg-[#3a47b3] transition-colors shadow-lg shadow-[#4654CD]/25"
        startContent={<Laptop className="w-5 h-5" />}
        onPress={handleClick}
      >
        Ver productos
      </Button>
      <div className="flex items-center gap-4 text-sm text-neutral-500">
        {benefits.map((benefit) => (
          <span key={benefit} className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#03DBD0]" />
            {benefit}
          </span>
        ))}
      </div>
    </div>
  );
};

export default HeroCtaV2;
