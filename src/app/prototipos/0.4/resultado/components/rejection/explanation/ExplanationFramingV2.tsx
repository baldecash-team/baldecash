'use client';

import React from 'react';
import { Info } from 'lucide-react';

/**
 * ExplanationFramingV2 - Neutral balanceado
 * Explicación sin juicio ni optimismo excesivo
 * Tono profesional y equilibrado
 */

export const ExplanationFramingV2: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="bg-neutral-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-neutral-700">
              Basándonos en la información disponible, no es posible aprobar tu solicitud en este momento.
              A continuación encontrarás algunas opciones que podrías considerar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
