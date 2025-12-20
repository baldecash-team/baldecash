'use client';

/**
 * SocialProofV2 - Grid Estatico
 *
 * Concepto: Todos los logos visibles en grid
 * Estilo: Cards con hover, badge "Convenio"
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SocialProofProps } from '../../../types/hero';
import { conveniosLogos } from '@/app/prototipos/_shared/data/conveniosLogos';
import { UnderlinedText } from '../common/UnderlinedText';

export const SocialProofV2: React.FC<SocialProofProps> = ({ data, underlineStyle = 4 }) => {
  // Show first 16 logos
  const displayLogos = conveniosLogos.slice(0, 16);

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Nuestros{' '}
            <UnderlinedText style={underlineStyle} color="primary">
              convenios
            </UnderlinedText>{' '}
            educativos
          </h2>
          <p className="text-neutral-600">
            Mas de {data.institutionCount} instituciones confian en nosotros
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {displayLogos.map((logo, index) => (
            <motion.div
              key={logo.id}
              className="bg-white rounded-xl p-4 border border-neutral-100 hover:border-[#4654CD]/30 hover:shadow-md transition-all cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <div className="h-12 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="max-h-10 max-w-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-8">
          <a
            href="#convenios"
            className="text-[#4654CD] font-medium hover:underline cursor-pointer"
          >
            Ver todos los convenios
          </a>
        </div>
      </div>
    </section>
  );
};

export default SocialProofV2;
