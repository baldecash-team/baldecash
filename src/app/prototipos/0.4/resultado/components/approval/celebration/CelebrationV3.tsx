'use client';

/**
 * CelebrationV3 - Checkmark animado gigante
 * Checkmark con animación de dibujo + iconos flat
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Trophy } from 'lucide-react';

interface CelebrationProps {
  userName: string;
  applicationId: string;
  resultType?: 'aprobado' | 'recibido';
}

export const CelebrationV3: React.FC<CelebrationProps> = ({ userName, applicationId, resultType = 'aprobado' }) => {
  const isRecibido = resultType === 'recibido';
  const statusText = isRecibido ? 'Tu solicitud fue recibida' : 'Tu solicitud fue aprobada';
  const titleText = isRecibido ? '¡Gracias!' : '¡Felicidades!';
  return (
    <div className="text-center">
      {/* Checkmark gigante con animación */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        {/* Círculo exterior */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="absolute inset-0 border-4 border-green-500 rounded-full"
        />

        {/* Checkmark SVG animado */}
        <motion.svg
          className="absolute inset-0 w-full h-full p-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M20 6L9 17L4 12"
            className="text-green-500"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </motion.svg>

        {/* Iconos decorativos */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute -top-3 -left-3"
        >
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="absolute -top-2 -right-4"
        >
          <Sparkles className="w-5 h-5 text-[#4654CD]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute -bottom-2 -right-2"
        >
          <Trophy className="w-6 h-6 text-amber-500" />
        </motion.div>
      </div>

      {/* Mensaje principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2">
          {titleText} {userName}!
        </h1>
        <p className="text-xl text-[#4654CD] font-semibold mb-2">
          {statusText}
        </p>
        <p className="text-neutral-500 text-sm">
          Solicitud #{applicationId}
        </p>
      </motion.div>
    </div>
  );
};

export default CelebrationV3;
