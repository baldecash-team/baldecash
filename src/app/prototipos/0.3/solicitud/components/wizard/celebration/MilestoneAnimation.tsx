'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Target, Rocket } from 'lucide-react';
import type { MilestoneAnimationProps } from '../../../types/wizard';

/**
 * MilestoneAnimation - Animación para hitos especiales
 *
 * Muestra animación cuando se alcanza un milestone (ej: 50% completado)
 */

const milestoneConfig: Record<number, { icon: React.ElementType; message: string; color: string }> = {
  25: {
    icon: Target,
    message: '¡Un cuarto del camino!',
    color: '#4654CD',
  },
  50: {
    icon: Star,
    message: '¡Vas a la mitad!',
    color: '#03DBD0',
  },
  75: {
    icon: Rocket,
    message: '¡Ya casi llegas!',
    color: '#22c55e',
  },
  100: {
    icon: Trophy,
    message: '¡Lo lograste!',
    color: '#f59e0b',
  },
};

export const MilestoneAnimation: React.FC<MilestoneAnimationProps> = ({
  milestone,
  onComplete,
}) => {
  const config = milestoneConfig[milestone];

  React.useEffect(() => {
    if (config) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      onComplete?.();
    }
  }, [config, onComplete]);

  if (!config) return null;

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20"
        />

        {/* Content */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative bg-white rounded-2xl p-8 shadow-2xl text-center max-w-xs mx-4"
        >
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: config.color }}
              initial={{
                opacity: 0,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                x: (Math.random() - 0.5) * 100,
                y: -50 - Math.random() * 50,
              }}
              transition={{
                duration: 1,
                delay: 0.3 + i * 0.1,
              }}
            />
          ))}

          {/* Icon */}
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Icon className="w-8 h-8" style={{ color: config.color }} />
          </motion.div>

          {/* Percentage */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-2"
          >
            <span
              className="text-4xl font-black"
              style={{ color: config.color }}
            >
              {milestone}%
            </span>
          </motion.div>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-semibold text-neutral-800"
          >
            {config.message}
          </motion.p>

          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 h-2 rounded-full overflow-hidden bg-neutral-200 origin-left"
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: config.color, width: `${milestone}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${milestone}%` }}
              transition={{ delay: 0.8, duration: 0.5 }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MilestoneAnimation;
