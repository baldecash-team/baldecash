'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { StepCelebrationProps } from '../../../types/wizard';

/**
 * StepCelebrationV1 - Micro-celebración sutil
 *
 * C.18 V1: Checkmark animado al completar paso
 * C.19 V1: Solo visual, sin mensaje
 * C.20 V1: Animación rápida (300ms)
 */
export const StepCelebrationV1: React.FC<StepCelebrationProps> = ({
  stepName,
  stepNumber,
  onComplete,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className="w-20 h-20 rounded-full bg-[#22c55e] flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StepCelebrationV1;
