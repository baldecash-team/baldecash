'use client';

/**
 * CelebrationV4 - Fintech
 * Partículas flotantes + estilo minimalista fintech
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, CircleDot } from 'lucide-react';

interface CelebrationProps {
  userName: string;
  applicationId: string;
}

export const CelebrationV4: React.FC<CelebrationProps> = ({ userName, applicationId }) => {
  // Partículas flotantes
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: Math.random() * 200 - 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div className="text-center relative">
      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
              x: [0, p.x],
              y: [0, p.y],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="absolute left-1/2 top-1/2"
            style={{ width: p.size, height: p.size }}
          >
            <CircleDot
              className="text-[#4654CD]"
              style={{ width: p.size, height: p.size }}
            />
          </motion.div>
        ))}
      </div>

      {/* Icono minimalista */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative w-24 h-24 mx-auto mb-8"
      >
        <div className="absolute inset-0 bg-[#4654CD]/5 rounded-2xl rotate-6" />
        <div className="absolute inset-0 bg-[#4654CD]/10 rounded-2xl -rotate-3" />
        <div className="relative w-full h-full bg-[#4654CD] rounded-2xl flex items-center justify-center shadow-xl shadow-[#4654CD]/20">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
      </motion.div>

      {/* Mensaje principal - estilo fintech */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10"
      >
        <p className="text-sm font-medium text-[#4654CD] uppercase tracking-wider mb-2">
          Aprobado
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-3">
          ¡Felicidades {userName}!
        </h1>
        <p className="text-neutral-500 text-sm font-mono">
          #{applicationId}
        </p>
      </motion.div>
    </div>
  );
};

export default CelebrationV4;
