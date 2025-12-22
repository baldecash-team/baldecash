'use client';

/**
 * CelebrationV6 - Explosión de impacto
 * Máximo impacto visual: icono grande + texto prominente
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Zap, Heart } from 'lucide-react';

interface CelebrationProps {
  userName: string;
  applicationId: string;
}

export const CelebrationV6: React.FC<CelebrationProps> = ({ userName, applicationId }) => {
  // Iconos decorativos flotantes
  const floatingIcons = [
    { Icon: Star, color: 'text-amber-400', x: -80, y: -60, delay: 0.3 },
    { Icon: Star, color: 'text-amber-400', x: 90, y: -40, delay: 0.4 },
    { Icon: Zap, color: 'text-[#4654CD]', x: -70, y: 40, delay: 0.5 },
    { Icon: Heart, color: 'text-pink-400', x: 80, y: 50, delay: 0.6 },
    { Icon: Star, color: 'text-green-400', x: 0, y: -80, delay: 0.35 },
  ];

  return (
    <div className="text-center py-4">
      {/* Container del icono con decoraciones */}
      <div className="relative w-40 h-40 mx-auto mb-8">
        {/* Anillos animados */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
          className="absolute inset-0 border-4 border-green-500 rounded-full"
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5, delay: 0.2 }}
          className="absolute inset-0 border-2 border-[#4654CD] rounded-full"
        />

        {/* Icono principal gigante */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40"
        >
          <CheckCircle className="w-24 h-24 text-white" />
        </motion.div>

        {/* Iconos flotantes */}
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: item.delay, type: 'spring' }}
            className={`absolute left-1/2 top-1/2 ${item.color}`}
            style={{ transform: `translate(${item.x}px, ${item.y}px)` }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: item.delay }}
            >
              <item.Icon className="w-6 h-6 fill-current" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Mensaje de impacto */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="text-4xl md:text-5xl font-bold text-neutral-800 mb-3"
        >
          ¡Felicidades {userName}!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl text-[#4654CD] font-bold mb-4"
        >
          Solicitud Aprobada
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium"
        >
          <CheckCircle className="w-5 h-5" />
          #{applicationId}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CelebrationV6;
