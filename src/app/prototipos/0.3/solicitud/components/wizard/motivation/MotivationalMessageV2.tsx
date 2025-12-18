'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Target, PartyPopper, Clock } from 'lucide-react';
import type { MotivationalMessageProps } from '../../../types/wizard';

/**
 * MotivationalMessageV2 - Mensaje dinámico que cambia
 *
 * C.9 V2: Mensaje que cambia cada cierto tiempo
 * C.10 V2: Basado en progreso general
 * C.11 V2: Barra de tiempo animada
 */

const progressMessages = [
  { threshold: 0, message: '¡Comencemos juntos!', icon: Zap },
  { threshold: 25, message: '¡Vas muy bien! Sigue así.', icon: TrendingUp },
  { threshold: 50, message: '¡A mitad de camino! Ya casi.', icon: Target },
  { threshold: 75, message: '¡Último esfuerzo! Tu laptop te espera.', icon: PartyPopper },
  { threshold: 100, message: '¡Listo para enviar!', icon: PartyPopper },
];

export const MotivationalMessageV2: React.FC<MotivationalMessageProps> = ({
  currentStep,
  stepCode,
  remainingMinutes,
  completedSteps,
  totalSteps,
}) => {
  const progress = Math.round(((currentStep) / (totalSteps - 1)) * 100);

  // Find appropriate message based on progress
  const messageData = [...progressMessages]
    .reverse()
    .find((m) => progress >= m.threshold) || progressMessages[0];

  const Icon = messageData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-r from-[#4654CD]/5 to-transparent rounded-xl p-4"
    >
      {/* Animated message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={messageData.message}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-[#4654CD]" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-800">
              {messageData.message}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span className="text-xs text-neutral-500">
                {remainingMinutes > 0
                  ? `${remainingMinutes} min para completar`
                  : 'Solo queda confirmar'}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Animated time bar */}
      <div className="mt-3 h-1 bg-neutral-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#4654CD]"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
};

export default MotivationalMessageV2;
