'use client';

/**
 * RetryTimeline - Timeline de reintento
 * Versión fija para v0.5 - Estilo V1 (Fecha específica)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface RetryTimelineProps {
  daysUntilRetry?: number;
}

export const RetryTimeline: React.FC<RetryTimelineProps> = ({
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="flex items-center gap-3 py-4 px-5 bg-neutral-50 rounded-lg border border-neutral-200"
    >
      <div className="w-10 h-10 bg-[#4654CD]/10 rounded-full flex items-center justify-center flex-shrink-0">
        <Calendar className="w-5 h-5 text-[#4654CD]" />
      </div>
      <div>
        <p className="text-sm text-neutral-600">Podrás volver a aplicar</p>
        <p className="font-semibold text-neutral-800">
          {formattedDate} <span className="font-normal text-neutral-500">({daysUntilRetry} días)</span>
        </p>
      </div>
    </motion.div>
  );
};

export default RetryTimeline;
