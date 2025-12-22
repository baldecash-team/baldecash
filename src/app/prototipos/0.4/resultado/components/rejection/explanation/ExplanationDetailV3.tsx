'use client';

import React from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import type { RejectionCategory } from '../../../types/rejection';

/**
 * ExplanationDetailV3 - Accionable
 * "Qué puedes hacer para mejorar" con lista
 * Enfocado en acciones positivas
 */

interface ExplanationDetailProps {
  category?: RejectionCategory;
}

const improvementTips: Record<RejectionCategory, string[]> = {
  credit: [
    'Paga tus deudas pendientes a tiempo',
    'Evita tener muchas consultas de crédito seguidas',
    'Mantén un buen historial de pagos por al menos 3 meses',
  ],
  income: [
    'Asegúrate de tener comprobantes de ingresos actualizados',
    'Si eres independiente, mantén registros de tus ingresos',
    'Considera opciones con un codeudor que tenga ingresos estables',
  ],
  documentation: [
    'Verifica que todos tus documentos estén vigentes',
    'Asegúrate de que la información sea legible y clara',
    'Revisa que los datos coincidan con tu identificación',
  ],
  other: [
    'Revisa que toda tu información esté actualizada',
    'Considera aplicar por un monto menor',
    'Consulta con un asesor para más opciones',
  ],
};

export const ExplanationDetailV3: React.FC<ExplanationDetailProps> = ({ category = 'other' }) => {
  const tips = improvementTips[category];

  return (
    <div className="bg-[#4654CD]/5 rounded-lg p-4 mb-6 border border-[#4654CD]/10">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-[#4654CD]" />
        <h3 className="font-semibold text-neutral-800">Qué puedes hacer para mejorar</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4654CD] mt-0.5 flex-shrink-0" />
            <span className="text-sm text-neutral-700">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
