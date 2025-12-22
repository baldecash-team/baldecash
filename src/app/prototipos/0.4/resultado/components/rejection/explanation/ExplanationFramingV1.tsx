'use client';

import React from 'react';
import { Sparkles, TrendingUp, Target } from 'lucide-react';

/**
 * ExplanationFramingV1 - 100% positivo
 * "Qué puedes hacer para el futuro"
 * Enfoque completamente orientado a oportunidades
 */

export const ExplanationFramingV1: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#4654CD]" />
        </div>
        <h3 className="font-semibold text-neutral-800">Tu camino hacia adelante</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-green-800 font-medium">Puedes construir un mejor perfil</p>
            <p className="text-xs text-green-700">Con algunos pasos, podrás calificar pronto</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-[#4654CD]/5 rounded-lg">
          <Target className="w-5 h-5 text-[#4654CD] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-neutral-800 font-medium">Hay opciones disponibles ahora</p>
            <p className="text-xs text-neutral-600">Explora alternativas que sí puedes obtener hoy</p>
          </div>
        </div>
      </div>
    </div>
  );
};
