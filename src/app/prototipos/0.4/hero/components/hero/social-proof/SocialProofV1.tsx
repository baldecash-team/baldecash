'use client';

/**
 * SocialProofV1 - Marquee Continuo Premium
 *
 * Concepto: Logos en movimiento horizontal infinito
 * Estilo: Fondo neutro, logos grayscale, hover a color, mejor header
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Chip } from '@nextui-org/react';
import { Building2, GraduationCap, Users } from 'lucide-react';
import { SocialProofProps } from '../../../types/hero';
import { conveniosLogos } from '@/app/prototipos/_shared/data/conveniosLogos';

export const SocialProofV1: React.FC<SocialProofProps> = ({ data }) => {
  // Duplicate logos for seamless loop
  const allLogos = [...conveniosLogos, ...conveniosLogos];

  return (
    <section className="py-16 bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Improved */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Chip
              startContent={<Building2 className="w-3.5 h-3.5" />}
              classNames={{
                base: 'bg-[#4654CD]/10 px-4 py-2 h-auto',
                content: 'text-[#4654CD] text-sm font-medium',
              }}
            >
              Convenios educativos
            </Chip>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-neutral-800 font-['Baloo_2'] mb-3">
            +{data.institutionCount}{' '}
            <span className="text-[#4654CD]">instituciones</span>{' '}
            confían en nosotros
          </h3>

          <p className="text-neutral-500 max-w-xl mx-auto">
            Universidades, institutos y centros de formación en todo el Perú
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#4654CD]" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-neutral-800">+10,000</p>
                <p className="text-xs text-neutral-500">Estudiantes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#03DBD0]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#03DBD0]" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-neutral-800">{data.institutionCount}</p>
                <p className="text-xs text-neutral-500">Convenios</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-neutral-800">5 años</p>
                <p className="text-xs text-neutral-500">En el mercado</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Scrolling logos */}
          <motion.div
            className="flex gap-16 items-center"
            animate={{ x: [0, -120 * conveniosLogos.length] }}
            transition={{
              duration: 50,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {allLogos.map((logo, index) => (
              <div
                key={`${logo.id}-${index}`}
                className="flex-shrink-0 h-16 w-36 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="max-h-12 max-w-32 object-contain"
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
