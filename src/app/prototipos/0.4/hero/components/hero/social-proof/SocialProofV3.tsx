'use client';

/**
 * SocialProofV3 - Contador + Logos
 *
 * Concepto: Numero grande animado + logos destacados
 * Estilo: Contador con animacion + 6-8 logos
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building, Award } from 'lucide-react';
import { SocialProofProps } from '../../../types/hero';
import { conveniosLogos } from '@/app/prototipos/_shared/data/conveniosLogos';

export const SocialProofV3: React.FC<SocialProofProps> = ({ data }) => {
  const displayLogos = conveniosLogos.slice(0, 8);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#4654CD]/10 flex items-center justify-center">
              <Building className="w-7 h-7 text-[#4654CD]" />
            </div>
            <p className="text-4xl md:text-5xl font-bold text-[#4654CD]">{data.institutionCount}+</p>
            <p className="text-neutral-600 mt-1">Convenios activos</p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#03DBD0]/10 flex items-center justify-center">
              <Users className="w-7 h-7 text-[#03DBD0]" />
            </div>
            <p className="text-4xl md:text-5xl font-bold text-[#03DBD0]">{data.studentCount.toLocaleString()}+</p>
            <p className="text-neutral-600 mt-1">Estudiantes beneficiados</p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center">
              <Award className="w-7 h-7 text-[#22c55e]" />
            </div>
            <p className="text-4xl md:text-5xl font-bold text-[#22c55e]">{data.yearsInMarket}</p>
            <p className="text-neutral-600 mt-1">Anos en el mercado</p>
          </motion.div>
        </div>

        {/* Logos */}
        <div className="border-t border-neutral-100 pt-10">
          <p className="text-center text-neutral-500 text-sm mb-6">
            Instituciones con convenio
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {displayLogos.map((logo, index) => (
              <motion.div
                key={logo.id}
                className="h-10 w-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="max-h-8 max-w-20 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofV3;
