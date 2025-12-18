'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Shield, CheckCircle } from 'lucide-react';
import type { MotivationalMessageProps } from '../../../types/wizard';

/**
 * MotivationalMessageV1 - Frase motivacional estática
 *
 * C.9 V1: Frase estática debajo del progreso
 * C.10 V1: Relacionado con el paso actual
 * C.11 V1: Tiempo estimado para completar
 */

const stepMessages: Record<string, { message: string; icon: React.ElementType }> = {
  personal: {
    message: '¡Empezamos! Solo necesitamos conocerte un poco.',
    icon: Sparkles,
  },
  academico: {
    message: 'Cuéntanos sobre tus estudios. ¡Estás a mitad de camino!',
    icon: CheckCircle,
  },
  economico: {
    message: 'Casi terminamos. Esta info nos ayuda a darte la mejor cuota.',
    icon: Shield,
  },
  confirmar: {
    message: '¡Último paso! Revisa tu información y envía tu solicitud.',
    icon: CheckCircle,
  },
};

export const MotivationalMessageV1: React.FC<MotivationalMessageProps> = ({
  currentStep,
  stepCode,
  remainingMinutes,
  completedSteps,
  totalSteps,
}) => {
  const stepData = stepMessages[stepCode] || stepMessages.personal;
  const Icon = stepData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center py-4"
    >
      {/* Motivational message */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-[#4654CD]" />
        <p className="text-sm font-medium text-neutral-700">
          {stepData.message}
        </p>
      </div>

      {/* Time estimate */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
        <Clock className="w-3.5 h-3.5" />
        <span>
          {remainingMinutes > 0
            ? `~${remainingMinutes} min restantes`
            : '¡Ya casi terminas!'}
        </span>
      </div>
    </motion.div>
  );
};

export default MotivationalMessageV1;
