'use client';

/**
 * CelebrationV1 - Confetti + Ilustración
 * Confetti animado colorido + icono de checkmark grande
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, PartyPopper } from 'lucide-react';

interface CelebrationProps {
  userName: string;
  applicationId: string;
  resultType?: 'aprobado' | 'recibido';
}

export const CelebrationV1: React.FC<CelebrationProps> = ({ userName, applicationId, resultType = 'aprobado' }) => {
  const isRecibido = resultType === 'recibido';
  const statusText = isRecibido ? 'Tu solicitud fue recibida' : 'Tu solicitud fue aprobada';
  const titleText = isRecibido ? '¡Gracias!' : '¡Felicidades!';
  return (
    <div className="text-center">
      {/* Icono de éxito animado */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="relative w-28 h-28 mx-auto mb-6"
      >
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25" />
        <div className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>

        {/* Decoraciones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-2 -right-2"
        >
          <PartyPopper className="w-8 h-8 text-amber-500" />
        </motion.div>
      </motion.div>

      {/* Mensaje principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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

export default CelebrationV1;
