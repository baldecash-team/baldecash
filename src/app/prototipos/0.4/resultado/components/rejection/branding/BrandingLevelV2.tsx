'use client';

import React from 'react';
import { Phone } from 'lucide-react';

/**
 * BrandingLevelV2 - Branding completo
 * Logo, colores, header con ayuda
 * Experiencia consistente con el resto del sitio
 */

export const BrandingLevelV2: React.FC = () => {
  return (
    <header className="bg-white border-b border-neutral-200 py-4">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#4654CD] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-semibold text-neutral-800">BaldeCash</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <a href="tel:+51999999999" className="flex items-center gap-1 hover:text-[#4654CD] cursor-pointer">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Ayuda</span>
          </a>
        </div>
      </div>
    </header>
  );
};
