'use client';

import React from 'react';
import { Calendar, CheckCircle, ArrowRight } from 'lucide-react';

interface RetryTimelineV5Props {
  daysUntilRetry?: number;
}

/**
 * RetryTimelineV5 - Tiempo + Acción
 * "En 90 días, mientras puedes..."
 */
export const RetryTimelineV5: React.FC<RetryTimelineV5Props> = ({
  daysUntilRetry = 90,
}) => {
  const retryDate = new Date();
  retryDate.setDate(retryDate.getDate() + daysUntilRetry);

  const formattedDate = retryDate.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const actions = [
    'Mantén tus pagos al día',
    'Reduce deudas existentes',
    'Genera historial crediticio',
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="bg-[#4654CD]/5 px-5 py-4 flex items-center gap-3 border-b border-neutral-100">
        <Calendar className="w-5 h-5 text-[#4654CD]" />
        <div>
          <p className="text-sm text-neutral-600">Podrás volver a aplicar el</p>
          <p className="font-semibold text-neutral-800">{formattedDate}</p>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm font-medium text-neutral-700 mb-3">Mientras tanto, te recomendamos:</p>
        <div className="space-y-2">
          {actions.map((action, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{action}</span>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 text-[#4654CD] font-medium text-sm hover:underline cursor-pointer">
          Ver guía para mejorar tu perfil
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
