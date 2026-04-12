'use client';

/**
 * Illustration - Icono de solicitud recibida
 * Adapted from v0.5 for v0.6
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';

export const Illustration: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      }}
      className="flex justify-center mb-6 sm:mb-8"
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        {/* Ping effect */}
        <div className="absolute inset-0 bg-[var(--color-primary)] rounded-full animate-ping opacity-25" />

        {/* Main check circle */}
        <div className="relative w-full h-full bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/30">
          <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
        </div>

        {/* Clock decoration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-1 -right-1 w-9 h-9 sm:w-10 sm:h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-md"
        >
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Illustration;
