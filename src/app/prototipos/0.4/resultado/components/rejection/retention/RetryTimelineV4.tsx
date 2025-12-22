'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface RetryTimelineV4Props {
  daysUntilRetry?: number;
}

/**
 * RetryTimelineV4 - Countdown Sutil
 * Cuenta regresiva estilo fintech
 */
export const RetryTimelineV4: React.FC<RetryTimelineV4Props> = ({
  daysUntilRetry = 90,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const months = Math.floor(daysUntilRetry / 30);
  const remainingDays = daysUntilRetry % 30;

  if (!mounted) return null;

  return (
    <div className="bg-gradient-to-r from-[#4654CD]/5 to-[#03DBD0]/5 rounded-xl p-4 border border-[#4654CD]/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Próximo intento en</p>
            <p className="font-bold text-neutral-800">
              {months > 0 && `${months} ${months === 1 ? 'mes' : 'meses'} `}
              {remainingDays > 0 && `${remainingDays} ${remainingDays === 1 ? 'día' : 'días'}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {[months, remainingDays].map((value, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center"
            >
              <span className="text-xl font-bold text-[#4654CD]">{value}</span>
              <span className="text-[10px] text-neutral-400 uppercase">
                {i === 0 ? 'mes' : 'días'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
