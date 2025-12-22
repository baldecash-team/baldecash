'use client';

import React, { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { Tooltip } from '@nextui-org/react';
import type { RejectionCategory } from '../../../types/rejection';

/**
 * ExplanationDetailV4 - Técnico amigable
 * Explicación con tooltips para más información
 * Balance entre claridad y profundidad
 */

interface ExplanationDetailProps {
  category?: RejectionCategory;
}

const categoryExplanations: Record<RejectionCategory, { main: string; tooltip: string }> = {
  credit: {
    main: 'Tu puntaje crediticio actual no cumple con el mínimo requerido.',
    tooltip: 'El puntaje crediticio es un número que indica qué tan confiable eres para pagar deudas. Se basa en tu historial de pagos, deudas actuales y otros factores.',
  },
  income: {
    main: 'Los ingresos verificados no alcanzan el mínimo para este monto.',
    tooltip: 'Evaluamos tus ingresos mensuales para asegurar que puedas pagar las cuotas sin comprometer más del 30% de tu ingreso.',
  },
  documentation: {
    main: 'Hay inconsistencias en la documentación presentada.',
    tooltip: 'Verificamos que la información en tus documentos coincida y esté actualizada. Esto incluye DNI, comprobantes de domicilio e ingresos.',
  },
  other: {
    main: 'Factores múltiples afectan la aprobación en este momento.',
    tooltip: 'Nuestro sistema evalúa varios criterios. A veces la combinación de factores no permite aprobar aunque individualmente estén bien.',
  },
};

export const ExplanationDetailV4: React.FC<ExplanationDetailProps> = ({ category = 'other' }) => {
  const explanation = categoryExplanations[category];

  return (
    <div className="bg-neutral-50 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
          <Info className="w-4 h-4 text-neutral-500" />
        </div>
        <div className="flex-1">
          <p className="text-neutral-700 inline">
            {explanation.main}
          </p>
          <Tooltip
            content={
              <div className="max-w-xs p-2 text-sm">
                {explanation.tooltip}
              </div>
            }
            placement="top"
          >
            <button className="inline-flex items-center justify-center ml-1 w-5 h-5 rounded-full bg-neutral-200 hover:bg-neutral-300 cursor-pointer transition-colors">
              <HelpCircle className="w-3 h-3 text-neutral-600" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
