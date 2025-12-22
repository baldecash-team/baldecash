'use client';

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { RejectionCategory } from '../../../types/rejection';

/**
 * ExplanationDetailV5 - Expandible
 * Razón breve + expandible para más detalle
 * Usuario decide cuánta información ver
 */

interface ExplanationDetailProps {
  category?: RejectionCategory;
}

const categoryDetails: Record<RejectionCategory, { brief: string; detailed: string }> = {
  credit: {
    brief: 'Relacionado con tu historial crediticio.',
    detailed: 'Tu historial de pagos y deudas actuales no cumplen con nuestros criterios mínimos. Esto puede deberse a pagos atrasados recientes, alto nivel de endeudamiento, o historial crediticio insuficiente.',
  },
  income: {
    brief: 'Relacionado con la verificación de ingresos.',
    detailed: 'Los ingresos que pudimos verificar no alcanzan el mínimo necesario para el monto solicitado. Consideramos que la cuota mensual no debe superar el 30% de tus ingresos netos.',
  },
  documentation: {
    brief: 'Relacionado con la documentación proporcionada.',
    detailed: 'Encontramos inconsistencias o información incompleta en los documentos presentados. Esto puede incluir documentos vencidos, información no legible, o datos que no coinciden entre sí.',
  },
  other: {
    brief: 'Factores que afectan la aprobación.',
    detailed: 'Nuestro sistema evalúa múltiples criterios simultáneamente. En este caso, la combinación de factores no permite aprobar la solicitud aunque algunos criterios individuales sí se cumplan.',
  },
};

export const ExplanationDetailV5: React.FC<ExplanationDetailProps> = ({ category = 'other' }) => {
  const [expanded, setExpanded] = useState(false);
  const details = categoryDetails[category];

  return (
    <div className="bg-neutral-50 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
          <Info className="w-4 h-4 text-neutral-500" />
        </div>
        <div className="flex-1">
          <p className="text-neutral-700">{details.brief}</p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-2 text-sm text-[#4654CD] hover:underline cursor-pointer"
          >
            {expanded ? 'Ver menos' : 'Saber más'}
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">{details.detailed}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
