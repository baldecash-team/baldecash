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
  totalSteps: number;
  onComplete?: () => void;
}

/**
 * Genera mensaje dinámico basado en porcentaje de avance.
 * Escala para cualquier cantidad de pasos (2, 4, 6, 10+).
 *
 * Puntos clave (no se repiten):
 * - Primer paso: "¡Excelente inicio!"
 * - ~25%: "¡Buen avance!"
 * - ~50%: "¡Vas por la mitad!"
 * - ~75%: "¡Ya casi terminamos!"
 * - Penúltimo: "¡Un paso más!"
 * - Último: "¡Información completa!"
 * - Resto: pool rotativo para variedad
 */
const ROTATING_MESSAGES = ['¡Vas muy bien!', '¡Sigue así!', '¡Buen trabajo!'];

const getMessage = (stepNumber: number, totalSteps: number): string => {
  const progress = stepNumber / totalSteps;

  // Fixed milestones
  if (stepNumber === totalSteps) return '¡Información completa!';
  if (stepNumber === 1) return '¡Excelente inicio!';
  if (stepNumber === totalSteps - 1) return '¡Un paso más!';

  // Progress-based milestones (only trigger if there are enough steps)
  if (totalSteps >= 4 && progress >= 0.7) return '¡Ya casi terminamos!';
  if (totalSteps >= 4 && progress >= 0.45 && progress <= 0.55) return '¡Vas por la mitad!';
  if (totalSteps >= 5 && progress >= 0.2 && progress <= 0.3) return '¡Buen avance!';

  // Rotating pool for remaining steps
  return ROTATING_MESSAGES[(stepNumber - 1) % ROTATING_MESSAGES.length];
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
  totalSteps,
  onComplete,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1300);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const message = getMessage(stepNumber, totalSteps);
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.3,
    x: (i - 6) * 15,
    color: i % 3 === 0 ? 'var(--color-primary)' : i % 3 === 1 ? '#22c55e' : 'var(--color-secondary)',
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
            Paso {stepNumber} de {totalSteps} completado
          </p>
        </motion.div>

        {/* Progress dots - dinámico basado en totalSteps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 mt-6"
        >
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
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
