'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import type { StepSuccessMessageProps } from './StepSuccessMessageV1';

/**
 * StepSuccessMessageV5 - Celebracion con preview del siguiente paso
 *
 * C.20 V5: Muestra que viene despues + transicion fluida
 * Duracion: 1800ms
 */

const stepInfo: Record<number, { current: string; next: string }> = {
  1: { current: 'Datos Personales', next: 'Datos Academicos' },
  2: { current: 'Datos Academicos', next: 'Datos Economicos' },
  3: { current: 'Datos Economicos', next: 'Confirmar Solicitud' },
  4: { current: 'Confirmar Solicitud', next: 'Enviado' },
};

export const StepSuccessMessageV5: React.FC<StepSuccessMessageProps> = ({
  stepName,
  stepNumber,
  onComplete,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const info = stepInfo[stepNumber] || { current: stepName, next: 'Siguiente' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
        className="text-center px-4"
      >
        {/* Success badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white rounded-full mb-6"
        >
          <Check className="w-5 h-5" strokeWidth={3} />
          <span className="font-medium">{info.current} completado</span>
        </motion.div>

        {/* Next step preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <p className="text-sm text-neutral-500">A continuacion:</p>

          <motion.div
            className="flex items-center justify-center gap-3 text-xl font-semibold text-neutral-800"
            animate={{ x: [0, 5, 0] }}
            transition={{ delay: 0.8, duration: 0.6, repeat: 2 }}
          >
            <span>{info.next}</span>
            <ChevronRight className="w-6 h-6 text-[#4654CD]" />
          </motion.div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.6 }}
          className="w-48 h-1 bg-neutral-200 rounded-full mx-auto mt-8 overflow-hidden"
        >
          <motion.div
            className="h-full bg-[#4654CD] rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(stepNumber / 4) * 100}%` }}
            transition={{ delay: 0.8, duration: 0.5 }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StepSuccessMessageV5;
