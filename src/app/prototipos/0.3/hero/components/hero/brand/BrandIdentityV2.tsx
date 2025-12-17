'use client';

/**
 * BrandIdentityV2 - Producto destacado con specs
 *
 * Enfoque: E-commerce, producto como protagonista
 * Mensaje: "Financiamiento para estudiantes sin historial crediticio"
 * Caracteristicas:
 * - Laptop como elemento visual principal
 * - Specs resumidas visibles
 * - Layout centrado
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, Monitor } from 'lucide-react';
import { BrandIdentityProps } from '../../../types/hero';

export const BrandIdentityV2: React.FC<BrandIdentityProps> = ({
  headline = 'Financiamiento para estudiantes',
  subheadline = 'Tu primera laptop sin necesidad de historial bancario',
  minQuota = 49,
  imageSrc = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop',
}) => {
  const specs = [
    { icon: Cpu, label: 'Intel Core i5', desc: '11va Gen' },
    { icon: HardDrive, label: '256GB SSD', desc: 'Almacenamiento' },
    { icon: Monitor, label: '15.6"', desc: 'Full HD' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <div className="text-center">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-['Baloo_2'] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#4654CD] leading-tight">
              {headline}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
              {subheadline}
            </p>
          </motion.div>

          {/* Product showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 relative max-w-3xl mx-auto"
          >
            {/* Product image */}
            <div className="relative">
              <img
                src={imageSrc}
                alt="Laptop destacada"
                className="w-full rounded-2xl shadow-2xl"
              />

              {/* Price tag */}
              <div className="absolute -top-4 -right-4 bg-[#4654CD] text-white px-6 py-3 rounded-xl shadow-lg">
                <p className="text-sm opacity-80">Desde</p>
                <p className="text-3xl font-bold">S/{minQuota}/mes</p>
              </div>
            </div>

            {/* Specs cards */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {specs.map((spec, index) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
                >
                  <spec.icon className="w-6 h-6 text-[#4654CD] mx-auto" />
                  <p className="mt-2 font-semibold text-neutral-900">
                    {spec.label}
                  </p>
                  <p className="text-sm text-neutral-500">{spec.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-neutral-500"
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#22c55e]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Garantia de fabrica
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#22c55e]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Envio a todo Peru
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#22c55e]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Soporte tecnico
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BrandIdentityV2;
