'use client';

/**
 * CelebrationV2 - Lifestyle
 * Ilustración grande de estudiante con laptop (usando placeholder)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Laptop } from 'lucide-react';

interface CelebrationProps {
  userName: string;
  applicationId: string;
}

export const CelebrationV2: React.FC<CelebrationProps> = ({ userName, applicationId }) => {
  return (
    <div className="text-center">
      {/* Ilustración lifestyle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-48 h-48 mx-auto mb-6"
      >
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-[#4654CD]/10 rounded-full" />

        {/* Iconos representativos */}
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative">
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Laptop className="w-20 h-20 text-[#4654CD]" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -top-4 -right-4 bg-green-500 rounded-full p-2"
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Mensaje principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2">
          ¡Felicidades {userName}!
        </h1>
        <p className="text-xl text-[#4654CD] font-semibold mb-2">
          Tu solicitud fue aprobada
        </p>
        <p className="text-neutral-500 text-sm mb-4">
          Solicitud #{applicationId}
        </p>
        <p className="text-neutral-600 text-sm max-w-md mx-auto">
          Pronto tendrás tu equipo para impulsar tus estudios
        </p>
      </motion.div>
    </div>
  );
};

export default CelebrationV2;
