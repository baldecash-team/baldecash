'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * AccessoryIntroV2 - Elegante lifestyle
 * "Accesorios recomendados" - directo y con estilo
 */
export const AccessoryIntroV2: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-[#4654CD]" />
        <h2 className="text-xl font-semibold text-neutral-800">
          Accesorios recomendados
        </h2>
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">
        Seleccionados para complementar tu experiencia.{' '}
        <span className="text-neutral-400">Todos son opcionales.</span>
      </p>
    </div>
  );
};

export default AccessoryIntroV2;
