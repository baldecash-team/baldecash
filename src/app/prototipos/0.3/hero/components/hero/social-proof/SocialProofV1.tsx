'use client';

/**
 * SocialProofV1 - Logos en movimiento (Marquee)
 *
 * Caracteristicas:
 * - Logos de instituciones en movimiento continuo
 * - Efecto marquee infinito
 * - Muestra todas las instituciones aliadas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SocialProofProps } from '../../../types/hero';
import { mockSocialProof } from '../../../data/mockHeroData';

export const SocialProofV1: React.FC<SocialProofProps> = ({
  data = mockSocialProof,
}) => {
  // Duplicar instituciones para efecto infinito
  const allInstitutions = [...data.institutions, ...data.institutions];

  return (
    <div className="py-8 bg-white border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <p className="text-center text-sm text-neutral-500 mb-6">
          Convenios con <span className="font-semibold text-neutral-700">{data.institutionCount}+ instituciones educativas</span>
        </p>

        {/* Marquee container */}
        <div className="relative overflow-hidden">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Scrolling logos */}
          <motion.div
            className="flex gap-12 items-center"
            animate={{ x: [0, -50 * data.institutions.length] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {allInstitutions.map((institution, index) => (
              <div
                key={`${institution.id}-${index}`}
                className="flex-shrink-0 flex items-center justify-center h-12 w-32 grayscale hover:grayscale-0 transition-all duration-300"
              >
                {/* Placeholder for logo - in production use actual logos */}
                <div className="bg-neutral-100 rounded-lg px-4 py-2 text-center">
                  <span className="text-sm font-semibold text-neutral-600">
                    {institution.shortName}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofV1;
