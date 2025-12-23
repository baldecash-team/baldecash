'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EmptyIllustrationProps } from '../../../types/empty';

/**
 * EmptyIllustrationV6 - Mensaje Gigante
 * "0 resultados" centrado con impacto visual
 * Referencia: Spotify, Apple - tipografía como elemento visual
 */
export const EmptyIllustrationV6: React.FC<EmptyIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Número gigante */}
      <motion.div
        className="relative mb-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* El "0" grande */}
        <span className="text-[120px] md:text-[160px] font-black text-[#4654CD]/10 leading-none select-none">
          0
        </span>

        {/* Overlay con texto */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl md:text-5xl font-black text-[#4654CD]">
            0
          </span>
        </div>
      </motion.div>

      {/* Texto descriptivo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h3 className="text-2xl font-bold text-neutral-800 mb-2">
          resultados
        </h3>
        <p className="text-neutral-500 max-w-md text-lg">
          Los filtros aplicados no coinciden con ningún equipo en el catálogo
        </p>
      </motion.div>

      {/* Línea decorativa */}
      <motion.div
        className="w-24 h-1 bg-[#4654CD]/20 rounded-full mt-6"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      />
    </div>
  );
};
