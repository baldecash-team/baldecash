'use client';

/**
 * Illustration - Icono de solicitud en proceso
 * Versión fija para v0.5
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Clock } from 'lucide-react';

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
        {/* Pulse effect */}
        <div className="absolute inset-0 bg-[#4654CD] rounded-full animate-ping opacity-20" />

        {/* Main circle */}
        <div className="relative w-full h-full bg-[#4654CD] rounded-full flex items-center justify-center shadow-lg shadow-[#4654CD]/30">
          <FileCheck className="w-14 h-14 text-white" />
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
