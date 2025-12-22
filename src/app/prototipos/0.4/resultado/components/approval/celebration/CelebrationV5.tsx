'use client';

/**
 * CelebrationV5 - Split
 * Diseño dividido: visual izquierda + mensaje derecha
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Rocket } from 'lucide-react';

interface CelebrationProps {
  userName: string;
  applicationId: string;
}

export const CelebrationV5: React.FC<CelebrationProps> = ({ userName, applicationId }) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
      {/* Lado izquierdo - Visual */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex-shrink-0"
      >
        {/* Círculo decorativo de fondo */}
        <div className="absolute inset-0 bg-green-500/10 rounded-full scale-125" />

        {/* Icono principal */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
          <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-white" />
        </div>

        {/* Elementos decorativos */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-2"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="absolute -bottom-1 -left-1 bg-[#4654CD] rounded-full p-2"
        >
          <Rocket className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>

      {/* Lado derecho - Mensaje */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center md:text-left"
      >
        <p className="text-green-600 font-semibold text-sm uppercase tracking-wide mb-2">
          Solicitud Aprobada
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-3">
          ¡Felicidades {userName}!
        </h1>
        <p className="text-lg text-neutral-600 mb-2">
          Tu solicitud de financiamiento fue aprobada
        </p>
        <p className="text-neutral-400 text-sm font-mono bg-neutral-100 inline-block px-3 py-1 rounded">
          #{applicationId}
        </p>
      </motion.div>
    </div>
  );
};

export default CelebrationV5;
