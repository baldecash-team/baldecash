'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Star } from 'lucide-react';

/**
 * StepSuccessMessage - Celebración con confetti y partículas
 * Basado en V3 del 0.4
 */

export interface StepSuccessMessageProps {
  stepName: string;
  stepNumber: number;
  onComplete?: () => void;
}

const stepMessages: Record<number, string> = {
  1: '¡Excelente inicio!',
  2: '¡Vas muy bien!',
  3: '¡Casi lo logras!',
  4: '¡Solicitud enviada!',
};

// Confetti particle component
const Particle: React.FC<{ delay: number; x: number; color: string }> = ({
  delay,
  x,
  color,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 0, x: x, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [-20, -60, -80, -100],
      x: [x, x + (Math.random() - 0.5) * 40],
      scale: [0, 1, 1, 0.5],
      rotate: [0, Math.random() * 360],
    }}
    transition={{
      duration: 1.5,
      delay,
      ease: 'easeOut',
    }}
    className="absolute"
    style={{ color }}
  >
    {Math.random() > 0.5 ? (
      <Star className="w-4 h-4 fill-current" />
    ) : (
      <Sparkles className="w-4 h-4" />
    )}
  </motion.div>
);

export const StepSuccessMessage: React.FC<StepSuccessMessageProps> = ({
  stepName,
  stepNumber,
  onComplete,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const message = stepMessages[stepNumber] || '¡Paso completado!';
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.3,
    x: (i - 6) * 15,
    color: i % 3 === 0 ? '#4654CD' : i % 3 === 1 ? '#22c55e' : '#03DBD0',
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="text-center relative"
      >
        {/* Confetti particles */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {particles.map((p) => (
            <Particle key={p.id} delay={p.delay} x={p.x} color={p.color} />
          ))}
        </div>

        {/* Main check animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, times: [0, 0.6, 1] }}
          className="w-20 h-20 rounded-full bg-[#22c55e] flex items-center justify-center mx-auto mb-4 relative"
        >
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#22c55e]"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#22c55e]"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Step info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-2xl font-bold text-neutral-800 mb-1">
            {message}
          </p>
          <p className="text-sm text-neutral-500">
            Paso {stepNumber} de 4 completado
          </p>
        </motion.div>

        {/* Progress dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 mt-6"
        >
          {[1, 2, 3, 4].map((step) => (
            <motion.div
              key={step}
              className={`w-2 h-2 rounded-full ${
                step <= stepNumber ? 'bg-[#22c55e]' : 'bg-neutral-300'
              }`}
              initial={step === stepNumber ? { scale: 0 } : {}}
              animate={step === stepNumber ? { scale: [0, 1.5, 1] } : {}}
              transition={{ delay: 0.6 + step * 0.1 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StepSuccessMessage;
