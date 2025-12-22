'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ExplanationFramingV3 - Directo honesto
 * Razones claras sin adornar
 * Transparencia total
 */

export const ExplanationFramingV3: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-neutral-800 font-medium mb-1">Por qué no se aprobó</p>
            <p className="text-sm text-neutral-600">
              Tu perfil actual no cumple con los criterios mínimos de riesgo crediticio que manejamos.
              Esto no significa que no puedas obtener financiamiento en el futuro o con otras condiciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
