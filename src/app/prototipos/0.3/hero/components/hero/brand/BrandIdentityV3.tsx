'use client';

/**
 * BrandIdentityV3 - Ilustracion abstracta + mensaje potente
 *
 * Enfoque: Moderno, diferenciador, minimalista
 * Mensaje: "Tu equipo para estudiar. Aprobacion en 24 horas."
 * Caracteristicas:
 * - Ilustracion SVG abstracta
 * - Texto como protagonista
 * - Fondo con color primario
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Shield } from 'lucide-react';
import { BrandIdentityProps } from '../../../types/hero';

export const BrandIdentityV3: React.FC<BrandIdentityProps> = ({
  headline = 'Tu equipo para estudiar',
  subheadline = 'Aprobacion en 24 horas. Sin aval ni garante.',
  minQuota = 49,
}) => {
  const features = [
    { icon: Zap, text: '100% Digital' },
    { icon: Clock, text: '24h Respuesta' },
    { icon: Shield, text: 'Datos seguros' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center bg-[#4654CD] overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <svg
          className="absolute w-full h-full opacity-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating shapes */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-3xl hidden lg:block"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-32 left-20 w-24 h-24 bg-[#03DBD0]/20 rounded-2xl hidden lg:block"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <h1 className="font-['Baloo_2'] text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {headline}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-lg mx-auto lg:mx-0">
              {subheadline}
            </p>

            {/* Features */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                >
                  <feature.icon className="w-4 h-4 text-[#03DBD0]" />
                  <span className="text-sm font-medium text-white">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8"
            >
              <p className="text-white/60 text-sm">Cuotas desde</p>
              <p className="text-5xl font-bold text-white">
                S/{minQuota}
                <span className="text-2xl text-white/80">/mes</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <svg
              viewBox="0 0 400 300"
              className="w-full max-w-lg mx-auto"
              fill="none"
            >
              {/* Laptop base */}
              <rect
                x="50"
                y="180"
                width="300"
                height="15"
                rx="4"
                fill="white"
                fillOpacity="0.9"
              />
              {/* Laptop screen */}
              <rect
                x="70"
                y="50"
                width="260"
                height="130"
                rx="8"
                fill="white"
                fillOpacity="0.95"
              />
              {/* Screen content */}
              <rect
                x="85"
                y="65"
                width="230"
                height="100"
                rx="4"
                fill="#4654CD"
                fillOpacity="0.1"
              />
              {/* Code lines */}
              <rect x="95" y="80" width="80" height="6" rx="3" fill="#4654CD" fillOpacity="0.3" />
              <rect x="95" y="95" width="120" height="6" rx="3" fill="#03DBD0" fillOpacity="0.5" />
              <rect x="95" y="110" width="60" height="6" rx="3" fill="#4654CD" fillOpacity="0.3" />
              <rect x="95" y="125" width="100" height="6" rx="3" fill="#4654CD" fillOpacity="0.3" />
              <rect x="95" y="140" width="140" height="6" rx="3" fill="#03DBD0" fillOpacity="0.5" />
              {/* Keyboard hint */}
              <ellipse cx="200" cy="187" rx="40" ry="3" fill="#4654CD" fillOpacity="0.2" />
              {/* Decorative circles */}
              <circle cx="320" cy="80" r="30" fill="#03DBD0" fillOpacity="0.2" />
              <circle cx="80" cy="220" r="20" fill="white" fillOpacity="0.1" />
            </svg>

            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-10 right-0 bg-white rounded-xl shadow-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#22c55e]/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#22c55e]"
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
                    Solicitud aprobada
                  </p>
                  <p className="text-xs text-neutral-500">Hace 2 minutos</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BrandIdentityV3;
