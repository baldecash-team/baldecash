'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface RetryTimelineV1Props {
  daysUntilRetry?: number;
}

/**
 * RetryTimelineV1 - Fecha Específica
 * "Puedes intentar de nuevo en 90 días" con fecha exacta
 */
export const RetryTimelineV1: React.FC<RetryTimelineV1Props> = ({
  daysUntilRetry = 90,
}) => {
  const retryDate = new Date();
  retryDate.setDate(retryDate.getDate() + daysUntilRetry);

  const formattedDate = retryDate.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex items-center gap-3 py-4 px-5 bg-neutral-50 rounded-lg border border-neutral-200">
      <div className="w-10 h-10 bg-[#4654CD]/10 rounded-full flex items-center justify-center flex-shrink-0">
        <Calendar className="w-5 h-5 text-[#4654CD]" />
      </div>
      <div>
        <p className="text-sm text-neutral-600">Podrás volver a aplicar</p>
        <p className="font-semibold text-neutral-800">
          {formattedDate} <span className="font-normal text-neutral-500">({daysUntilRetry} días)</span>
        </p>
      </div>
    </div>
  );
};
