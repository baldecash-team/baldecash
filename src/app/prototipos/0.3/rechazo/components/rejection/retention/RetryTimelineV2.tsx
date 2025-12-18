'use client';

/**
 * RetryTimelineV2 - Timeline simple en texto
 *
 * G.15 V2: Texto simple sin visualización elaborada
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';

interface RetryTimelineV2Props {
  canRetryIn: number; // días
}

export const RetryTimelineV2: React.FC<RetryTimelineV2Props> = ({
  canRetryIn,
}) => {
  const retryDate = useMemo(() => {
    const today = new Date();
    const date = new Date(today.getTime() + canRetryIn * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [canRetryIn]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-6"
    >
      <div className="flex items-center gap-3 p-4 bg-neutral-100 rounded-lg">
        <Clock className="w-5 h-5 text-neutral-500" />
        <div className="flex-1">
          <p className="text-sm text-neutral-700">
            Podrás volver a intentarlo a partir del{' '}
            <span className="font-semibold text-[#4654CD]">{retryDate}</span>
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            ({canRetryIn} días desde hoy)
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-neutral-400" />
      </div>
    </motion.div>
  );
};

export default RetryTimelineV2;
