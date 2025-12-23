'use client';

import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';

/**
 * ExplanationFramingV4 - Positivo realista
 * Oportunidades con contexto honesto
 * Balance entre esperanza y realismo
 */

export const ExplanationFramingV4: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium mb-1">Hay un camino adelante</p>
            <p className="text-sm text-amber-700 mb-3">
              Aunque no podemos aprobar esta solicitud específica, existen opciones reales que puedes considerar.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <ArrowRight className="w-3 h-3" />
              <span>Revisa las alternativas a continuación</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
