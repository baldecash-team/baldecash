'use client';

/**
 * SocialProofV2 - Grid estatico con todos los logos
 *
 * Caracteristicas:
 * - Todos los logos visibles sin animacion
 * - Grid responsive
 * - Hover para destacar cada logo
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SocialProofProps } from '../../../types/hero';
import { mockSocialProof } from '../../../data/mockHeroData';
import { conveniosLogos, conveniosStats } from '@/app/prototipos/_shared/data/conveniosLogos';

export const SocialProofV2: React.FC<SocialProofProps> = ({
  data = mockSocialProof,
}) => {
  // Show first 16 logos in grid (2 rows of 8)
  const displayLogos = conveniosLogos.slice(0, 16);

  return (
    <div className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-neutral-500 mb-2">
            Instituciones aliadas
          </p>
          <h3 className="text-xl font-semibold text-neutral-800">
            {conveniosStats.totalConvenios}+ convenios educativos en todo el Peru
          </h3>
        </div>

        {/* Grid of logos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {displayLogos.map((logo, index) => (
            <motion.div
              key={logo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group"
            >
              <div className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-[#4654CD]/30 hover:shadow-md transition-all duration-300 h-full flex flex-col items-center justify-center min-h-[100px]">
                {/* Logo image */}
                <div className="w-16 h-12 flex items-center justify-center mb-2 grayscale group-hover:grayscale-0 transition-all duration-300">
                  <img
                    src={logo.url}
                    alt={logo.name}
                    className="max-h-10 max-w-14 object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-xs text-neutral-500 text-center group-hover:text-neutral-700 transition-colors">
                  {logo.shortName}
                </span>
                <span className="mt-1 text-[10px] text-[#22c55e] font-medium">
                  Convenio
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-8">
          <a
            href="#instituciones"
            className="text-sm text-[#4654CD] font-medium hover:underline cursor-pointer"
          >
            Ver todas las instituciones aliadas
          </a>
        </div>
      </div>
    </div>
  );
};

export default SocialProofV2;
