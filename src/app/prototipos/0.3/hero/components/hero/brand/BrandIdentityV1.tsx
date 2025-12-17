'use client';

/**
 * BrandIdentityV1 - Imagen de estudiante con laptop
 *
 * Enfoque: Aspiracional, conexion emocional
 * Mensaje: "La laptop que necesitas, desde S/49/mes"
 * Caracteristicas:
 * - Imagen de estudiante como elemento principal
 * - Layout asimetrico (texto izquierda, imagen derecha)
 * - Mobile: imagen arriba, texto abajo
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BrandIdentityProps } from '../../../types/hero';

export const BrandIdentityV1: React.FC<BrandIdentityProps> = ({
  headline = 'La laptop que necesitas',
  subheadline = 'Desde S/49/mes. Sin historial crediticio.',
  minQuota = 49,
  imageSrc = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
}) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1 text-center lg:text-left"
          >
            <h1 className="font-['Baloo_2'] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#4654CD] leading-tight">
              {headline}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-neutral-600 max-w-lg mx-auto lg:mx-0">
              {subheadline}
            </p>

            {/* Price highlight */}
            <div className="mt-6 inline-flex items-center gap-2 bg-[#4654CD]/5 px-4 py-2 rounded-full">
              <span className="text-sm text-neutral-600">Cuotas desde</span>
              <span className="text-2xl font-bold text-[#4654CD]">
                S/{minQuota}/mes
              </span>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative aspect-[4/3] lg:aspect-square max-w-md mx-auto lg:max-w-none">
              {/* Background decoration */}
              <div className="absolute inset-4 bg-[#4654CD]/10 rounded-2xl -rotate-3" />
              <div className="absolute inset-4 bg-[#03DBD0]/10 rounded-2xl rotate-3" />

              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={imageSrc}
                  alt="Estudiante con laptop"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#22c55e]/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#22c55e]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      +10,000
                    </p>
                    <p className="text-xs text-neutral-500">
                      estudiantes financiados
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-50" />
      </div>
    </div>
  );
};

export default BrandIdentityV1;
