'use client';

/**
 * SocialProofV1 - Marquee Continuo
 *
 * Concepto: Logos en movimiento horizontal infinito
 * Estilo: Fondo neutro, logos grayscale, hover a color
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SocialProofProps } from '../../../types/hero';
import { conveniosLogos } from '@/app/prototipos/_shared/data/conveniosLogos';

export const SocialProofV1: React.FC<SocialProofProps> = ({ data }) => {
  // Duplicate logos for seamless loop
  const allLogos = [...conveniosLogos, ...conveniosLogos];

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-neutral-500 text-sm font-medium uppercase tracking-wider">
            Convenios con +{data.institutionCount} instituciones
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Scrolling logos */}
          <motion.div
            className="flex gap-12 items-center"
            animate={{ x: [0, -100 * conveniosLogos.length] }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {allLogos.map((logo, index) => (
              <div
                key={`${logo.id}-${index}`}
                className="flex-shrink-0 h-12 w-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="max-h-10 max-w-28 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofV1;
