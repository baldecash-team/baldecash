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
      className="flex justify-center mb-8"
    >
      <div className="relative w-28 h-28">
        {/* Ping effect */}
        <div className="absolute inset-0 bg-[var(--color-primary)] rounded-full animate-ping opacity-25" />

        {/* Main check circle */}
        <div className="relative w-full h-full bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/30">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>

        {/* Clock decoration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-1 -right-1 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-md"
        >
          <Clock className="w-5 h-5 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Illustration;
