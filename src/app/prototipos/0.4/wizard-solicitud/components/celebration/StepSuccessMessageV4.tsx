'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import type { StepSuccessMessageProps } from './StepSuccessMessageV1';

/**
 * StepSuccessMessageV4 - Celebracion estilo fintech con glow
 *
 * C.20 V4: Efectos de brillo + colores marca BaldeCash
 * Duracion: 1200ms
 */

const stepMessages: Record<number, string> = {
  1: 'Datos personales listos',
  2: 'Perfil academico verificado',
  3: 'Informacion economica guardada',
  4: 'Solicitud completada',
};

export const StepSuccessMessageV4: React.FC<StepSuccessMessageProps> = ({
  stepName,
  stepNumber,
  onComplete,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const message = stepMessages[stepNumber] || 'Paso completado';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4654CD]/5 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
        className="text-center"
      >
        {/* Glow circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="relative w-24 h-24 mx-auto mb-6"
        >
          {/* Outer glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-[#4654CD]/20 blur-xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Main circle */}
          <div className="relative w-full h-full rounded-full bg-[#4654CD] flex items-center justify-center shadow-lg shadow-[#4654CD]/30">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Check className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>

        {/* Message with Zap icon */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <Zap className="w-5 h-5 text-[#4654CD]" fill="currentColor" />
          <p className="text-xl font-bold text-neutral-800">
            {message}
          </p>
        </motion.div>

        {/* Step counter */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-neutral-500"
        >
          Paso {stepNumber} de 4
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default StepSuccessMessageV4;
