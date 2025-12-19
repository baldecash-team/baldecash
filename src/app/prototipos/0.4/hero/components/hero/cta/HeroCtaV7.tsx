'use client';

/**
 * HeroCtaV7 - Boton con Social Proof
 *
 * Concepto: "+500 solicitudes esta semana"
 * Estilo: Numeros que generan confianza
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Users, TrendingUp, ArrowRight } from 'lucide-react';

interface HeroCtaV7Props {
  onCtaClick?: () => void;
}

export const HeroCtaV7: React.FC<HeroCtaV7Props> = ({ onCtaClick }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Social Proof Stats */}
      <div className="flex items-center gap-6 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-[#4654CD]" />
          </div>
          <div>
            <p className="font-bold text-neutral-800">+500</p>
            <p className="text-xs text-neutral-500">esta semana</p>
          </div>
        </div>
        <div className="w-px h-8 bg-neutral-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#03DBD0]/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#03DBD0]" />
          </div>
          <div>
            <p className="font-bold text-neutral-800">85%</p>
            <p className="text-xs text-neutral-500">aprobados</p>
          </div>
        </div>
      </div>

      <Button
        size="lg"
        className="bg-[#4654CD] text-white font-semibold px-12 py-6 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
        endContent={<ArrowRight className="w-5 h-5" />}
        onPress={onCtaClick}
      >
        Únete ahora
      </Button>

      {/* Avatars */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-neutral-500"
            >
              {String.fromCharCode(64 + i)}
            </div>
          ))}
        </div>
        <span className="text-sm text-neutral-500">
          +1,200 estudiantes ya tienen su laptop
        </span>
      </div>
    </div>
  );
};

export default HeroCtaV7;
