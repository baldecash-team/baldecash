'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Laptop, GraduationCap, Rocket, Heart, Clock } from 'lucide-react';
import type { MotivationalMessageProps } from '../../../types/wizard';

/**
 * MotivationalMessageV3 - Avatar/mascota con tips
 *
 * C.9 V3: Personaje/mascota que da tips
 * C.10 V3: Tips contextuales por campo
 * C.11 V3: Sin tiempo visible (reduce ansiedad)
 */

const characterTips: Record<string, { tip: string; icon: React.ElementType }> = {
  personal: {
    tip: 'Tip: Usa tu nombre tal como aparece en tu DNI para evitar problemas.',
    icon: Heart,
  },
  academico: {
    tip: 'Tip: Tu carnet universitario nos ayuda a verificar tu inscripción rápidamente.',
    icon: GraduationCap,
  },
  economico: {
    tip: 'Tip: Si tienes ingresos variables, indica el promedio de los últimos 3 meses.',
    icon: Rocket,
  },
  confirmar: {
    tip: 'Tip: Revisa bien tu email, ahí recibirás la respuesta de tu solicitud.',
    icon: Laptop,
  },
};

export const MotivationalMessageV3: React.FC<MotivationalMessageProps> = ({
  currentStep,
  stepCode,
  remainingMinutes,
  completedSteps,
  totalSteps,
}) => {
  const tipData = characterTips[stepCode] || characterTips.personal;
  const Icon = tipData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
      className="flex items-start gap-3 p-4 bg-[#03DBD0]/10 rounded-xl border border-[#03DBD0]/20"
    >
      {/* Character avatar */}
      <motion.div
        className="w-12 h-12 rounded-full bg-[#4654CD] flex items-center justify-center flex-shrink-0"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.div>

      {/* Tip content */}
      <div className="flex-1 pt-1">
        <p className="text-sm font-medium text-[#4654CD] mb-1">
          Balde te dice:
        </p>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {tipData.tip}
        </p>
      </div>
    </motion.div>
  );
};

export default MotivationalMessageV3;
