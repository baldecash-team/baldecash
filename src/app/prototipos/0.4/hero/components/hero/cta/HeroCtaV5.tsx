'use client';

/**
 * HeroCtaV5 - Boton Sticky Mobile
 *
 * Concepto: Fixed bottom en mobile
 * Estilo: Siempre visible, conversion constante
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowRight } from 'lucide-react';

interface HeroCtaV5Props {
  onCtaClick?: () => void;
}

export const HeroCtaV5: React.FC<HeroCtaV5Props> = ({ onCtaClick }) => {
  return (
    <>
      {/* Desktop CTA */}
      <div className="hidden md:flex flex-col items-center gap-3">
        <Button
          size="lg"
          radius="lg"
          className="bg-[#4654CD] text-white font-semibold px-12 py-6 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
          endContent={<ArrowRight className="w-5 h-5" />}
          onPress={onCtaClick}
        >
          Solicitar mi laptop
        </Button>
        <p className="text-sm text-neutral-500">
          Cuotas desde S/49/mes · Sin aval requerido
        </p>
      </div>

      {/* Mobile - Info only (button is sticky at bottom) */}
      <div className="md:hidden text-center">
        <p className="text-sm text-neutral-500">
          Cuotas desde <span className="font-bold text-[#4654CD]">S/49/mes</span>
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          Sin aval · Sin historial crediticio
        </p>
      </div>

      {/* Mobile Sticky Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-neutral-500">Desde</p>
            <p className="text-lg font-bold text-[#4654CD]">S/49/mes</p>
          </div>
          <Button
            size="lg"
            radius="lg"
            className="bg-[#4654CD] text-white font-semibold px-8 cursor-pointer hover:bg-[#3a47b3] transition-colors flex-shrink-0"
            endContent={<ArrowRight className="w-4 h-4" />}
            onPress={onCtaClick}
          >
            Solicitar
          </Button>
        </div>
      </div>
    </>
  );
};

export default HeroCtaV5;
