'use client';

/**
 * HeroCtaV4 - Boton Doble
 *
 * Concepto: Principal + secundario lado a lado
 * Estilo: Dos opciones claras, jerarquia visual
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Calculator, FileText } from 'lucide-react';

interface HeroCtaV4Props {
  onCtaClick?: () => void;
}

export const HeroCtaV4: React.FC<HeroCtaV4Props> = ({ onCtaClick }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          size="lg"
          className="bg-[#4654CD] text-white font-bold px-10 py-6 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors w-full sm:w-auto"
          startContent={<FileText className="w-5 h-5" />}
          onPress={onCtaClick}
        >
          Solicitar ahora
        </Button>
        <Button
          size="lg"
          variant="flat"
          className="bg-neutral-100 text-neutral-700 font-semibold px-10 py-6 text-lg cursor-pointer hover:bg-neutral-200 transition-colors w-full sm:w-auto"
          startContent={<Calculator className="w-5 h-5" />}
        >
          Simular cuota
        </Button>
      </div>
      <p className="text-xs text-neutral-400">
        Sin compromiso · Respuesta inmediata
      </p>
    </div>
  );
};

export default HeroCtaV4;
