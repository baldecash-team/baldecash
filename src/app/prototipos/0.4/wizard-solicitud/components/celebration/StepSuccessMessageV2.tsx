'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import type { StepSuccessMessageProps } from './StepSuccessMessageV1';

/**
 * StepSuccessMessageV2 - Celebracion con mensaje personalizado
 *
 * C.20 V2: Mensaje de felicitacion + indicador de continuacion
 * Duracion: 1500ms
 */

const stepMessages: Record<number, string> = {
  1: '!Genial! Ya te conocemos mejor.',
  2: '!Excelente! Tu perfil academico esta listo.',
  3: '!Perfecto! Solo queda confirmar.',
  4: '!Listo! Tu solicitud esta completa.',
};

export const StepSuccessMessageV2: React.FC<StepSuccessMessageProps> = ({
  stepName,
  stepNumber,
  onComplete,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const message = stepMessages[stepNumber] || '!Paso completado!';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="text-center"
      >
        {/* Animated check circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center mx-auto mb-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-semibold text-neutral-800 mb-2"
        >
          {message}
        </motion.p>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-sm text-neutral-500"
        >
          <span>Continuando</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StepSuccessMessageV2;
