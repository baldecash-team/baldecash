'use client';

import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';

/**
 * IllustrationTypeV2 - Camino bifurcado
 * Ilustración de opciones: "hay otras rutas"
 * Transmite posibilidades y alternativas
 */

export const IllustrationTypeV2: React.FC = () => {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative w-48 h-32">
        {/* Camino principal */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-4 h-16 bg-neutral-200 rounded-t-full" />

        {/* Bifurcación izquierda */}
        <div className="absolute left-1/4 top-0 w-4 h-16 bg-[#4654CD]/20 rounded-full transform -rotate-45 origin-bottom" />

        {/* Bifurcación derecha */}
        <div className="absolute right-1/4 top-0 w-4 h-16 bg-[#4654CD]/30 rounded-full transform rotate-45 origin-bottom" />

        {/* Compass en el centro */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center">
            <Compass className="w-6 h-6 text-[#4654CD]" />
          </div>
        </div>

        {/* Flechas indicando opciones */}
        <div className="absolute left-4 top-2">
          <ArrowRight className="w-4 h-4 text-[#4654CD]/60 transform -rotate-45" />
        </div>
        <div className="absolute right-4 top-2">
          <ArrowRight className="w-4 h-4 text-[#4654CD]/60 transform rotate-45" />
        </div>
      </div>
    </div>
  );
};
