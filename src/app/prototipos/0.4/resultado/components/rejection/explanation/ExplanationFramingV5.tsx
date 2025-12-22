'use client';

import React from 'react';
import { Info, ArrowDown } from 'lucide-react';

/**
 * ExplanationFramingV5 - Split
 * Razón breve arriba + acciones positivas debajo
 * Separación visual clara
 */

export const ExplanationFramingV5: React.FC = () => {
  return (
    <div className="mb-6">
      {/* Parte superior: Razón breve */}
      <div className="bg-neutral-100 rounded-t-lg p-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-neutral-500" />
          <p className="text-sm text-neutral-600">
            Tu solicitud no pudo ser aprobada en este momento.
          </p>
        </div>
      </div>

      {/* Parte inferior: Acciones positivas */}
      <div className="bg-[#4654CD]/5 rounded-b-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <ArrowDown className="w-4 h-4 text-[#4654CD]" />
          <p className="text-sm text-[#4654CD] font-medium">
            Pero tienes opciones
          </p>
        </div>
        <p className="text-xs text-neutral-600 pl-6">
          Explora las alternativas que tenemos para ti a continuación.
        </p>
      </div>
    </div>
  );
};
