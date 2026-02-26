'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EmptyIllustrationProps } from '../../../types/empty';

/**
 * EmptyIllustrationV4 - Shapes Abstractos
 * Formas geométricas flotantes + animación sutil
 * Referencia: Nubank, Revolut - estilo fintech moderno
 */
export const EmptyIllustrationV4: React.FC<EmptyIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Shapes abstractos animados */}
      <div className="relative w-48 h-40 mb-6">
        {/* Shape circular grande */}
        <motion.div
          className="absolute top-4 left-8 w-16 h-16 bg-[rgba(var(--color-primary-rgb),0.1)] rounded-full"
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Shape cuadrado */}
        <motion.div
          className="absolute top-8 right-8 w-12 h-12 bg-[rgba(var(--color-secondary-rgb),0.2)] rounded-lg"
          animate={{
            y: [0, 8, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Shape triangular (usando clip-path) */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-[rgba(var(--color-primary-rgb),0.15)]"
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          }}
          animate={{
            y: [0, -6, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Líneas decorativas */}
        <motion.div
          className="absolute top-1/2 left-4 w-8 h-0.5 bg-[rgba(var(--color-primary-rgb),0.3)] rounded-full"
          animate={{ scaleX: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-4 w-6 h-0.5 bg-[rgba(var(--color-secondary-rgb),0.4)] rounded-full"
          animate={{ scaleX: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Puntos flotantes */}
        <motion.div
          className="absolute top-2 left-1/2 w-2 h-2 bg-[var(--color-primary)] rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-8 right-12 w-3 h-3 bg-[var(--color-secondary)] rounded-full"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Mensaje */}
      <motion.h3
        className="text-xl font-bold text-neutral-800 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Sin resultados
      </motion.h3>
      <motion.p
        className="text-neutral-600 max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Los filtros seleccionados no coinciden con ningún equipo. Amplía tu búsqueda para ver más opciones
      </motion.p>
    </div>
  );
};
