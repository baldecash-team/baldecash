'use client';

import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';

/**
 * ExplanationFramingV6 - Enfoque en acción
 * "Qué hacer ahora" prominente
 * Orientación clara hacia siguiente paso
 */

export const ExplanationFramingV6: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#4654CD]/10 mb-4">
          <Zap className="w-6 h-6 text-[#4654CD]" />
        </div>

        <h3 className="text-lg font-semibold text-neutral-800 mb-2">
          Esto es lo que puedes hacer ahora
        </h3>

        <p className="text-neutral-600 mb-4 max-w-md mx-auto">
          No te preocupes, hay varias opciones disponibles para ti.
          Elige la que mejor se adapte a tu situación.
        </p>

        <div className="flex items-center justify-center gap-2 text-[#4654CD]">
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm font-medium">Revisa las opciones debajo</span>
        </div>
      </div>
    </div>
  );
};
