'use client';

/**
 * CelebrationV3 - Sin confetti, checkmark animado gigante
 *
 * F.1 V3: Checkmark animado gigante
 * F.2 V3: Sin confetti
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CelebrationV3Props {
  onComplete?: () => void;
}

export const CelebrationV3: React.FC<CelebrationV3Props> = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onAnimationComplete={onComplete}
      className="relative"
    >
      {/* Animated rings */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{
          duration: 1,
          repeat: 2,
          repeatDelay: 0.5,
        }}
        className="absolute inset-0 rounded-full border-4 border-green-400"
      />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.3, opacity: 0 }}
        transition={{
          duration: 1,
          repeat: 2,
          repeatDelay: 0.5,
          delay: 0.2,
        }}
        className="absolute inset-0 rounded-full border-4 border-green-300"
      />

      {/* Main circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/30"
      >
        {/* Checkmark with draw animation */}
        <svg
          className="w-20 h-20"
          viewBox="0 0 52 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M14 27L22 35L38 19"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: 'easeOut',
            }}
          />
        </svg>
      </motion.div>

      {/* Success text below */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <span className="text-sm font-semibold text-green-600 tracking-wide uppercase">
          Aprobado
        </span>
      </motion.div>
    </motion.div>
  );
};

export default CelebrationV3;
