'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface RetryTimelineV2Props {
  daysUntilRetry?: number;
}

/**
 * RetryTimelineV2 - General Vago
 * "En unos meses podrías aplicar nuevamente"
 */
export const RetryTimelineV2: React.FC<RetryTimelineV2Props> = () => {
  return (
    <div className="flex items-center gap-2 text-neutral-500 text-sm">
      <Clock className="w-4 h-4" />
      <span>En unos meses podrías aplicar nuevamente. Te mantendremos informado.</span>
    </div>
  );
};
