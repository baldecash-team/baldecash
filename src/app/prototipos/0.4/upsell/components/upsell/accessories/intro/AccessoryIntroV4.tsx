'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

/**
 * AccessoryIntroV4 - Fintech con animación
 * "Potencia tu experiencia" - moderno y dinámico
 */
export const AccessoryIntroV4: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 bg-gradient-to-br from-[#4654CD] to-[#03DBD0] rounded-lg flex items-center justify-center"
        >
          <Zap className="w-4 h-4 text-white" />
        </motion.div>
        <h2 className="text-xl font-semibold text-neutral-800">
          Potencia tu experiencia
        </h2>
      </div>
      <p className="text-sm text-neutral-600">
        Accesorios que hacen la diferencia.{' '}
        <span className="text-[#4654CD] font-medium">Todos opcionales</span>
      </p>
    </motion.div>
  );
};

export default AccessoryIntroV4;
