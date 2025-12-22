'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Trophy } from 'lucide-react';
import type { StepSuccessMessageProps } from './StepSuccessMessageV1';

/**
 * StepSuccessMessageV6 - Celebracion grande centrada (hero style)
 *
 * C.20 V6: Texto gigante + emoji/icono + animacion impactante
 * Duracion: 1500ms
 */

const stepEmojis: Record<number, string> = {
  1: '1/4',
  2: '2/4',
  3: '3/4',
  4: '4/4',
};

const stepMessages: Record<number, string> = {
  1: 'DATOS PERSONALES',
  2: 'PERFIL ACADEMICO',
  3: 'INFO ECONOMICA',
  4: 'SOLICITUD LISTA',
};

export const StepSuccessMessageV6: React.FC<StepSuccessMessageProps> = ({
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

  const progress = stepEmojis[stepNumber] || `${stepNumber}/4`;
  const message = stepMessages[stepNumber] || 'COMPLETADO';
  const isLastStep = stepNumber === 4;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4654CD]"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="text-center text-white px-4"
      >
        {/* Big icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="mb-6"
        >
          {isLastStep ? (
            <Trophy className="w-24 h-24 mx-auto text-[#03DBD0]" strokeWidth={1.5} />
          ) : (
            <div className="w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-14 h-14 text-white" strokeWidth={3} />
            </div>
          )}
        </motion.div>

        {/* Progress number */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-black mb-2"
        >
          {progress}
        </motion.p>

        {/* Step name */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-medium tracking-widest text-white/80"
        >
          {message}
        </motion.p>

        {/* Animated line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="w-32 h-1 bg-[#03DBD0] mx-auto mt-6 rounded-full"
        />
      </motion.div>
    </motion.div>
  );
};

export default StepSuccessMessageV6;
