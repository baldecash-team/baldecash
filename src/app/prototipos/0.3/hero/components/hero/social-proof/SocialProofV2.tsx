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

export const SocialProofV2: React.FC<SocialProofProps> = ({
  data = mockSocialProof,
}) => {
  return (
    <div className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-neutral-500 mb-2">
            Instituciones aliadas
          </p>
          <h3 className="text-xl font-semibold text-neutral-800">
            {data.institutionCount}+ convenios educativos en todo el Peru
          </h3>
        </div>

        {/* Grid of logos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {data.institutions.map((institution, index) => (
            <motion.div
              key={institution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group"
            >
              <div className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-[#4654CD]/30 hover:shadow-md transition-all duration-300 h-full flex flex-col items-center justify-center">
                {/* Logo placeholder */}
                <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-[#4654CD]/5 transition-colors">
                  <span className="text-lg font-bold text-neutral-400 group-hover:text-[#4654CD] transition-colors">
                    {institution.code.substring(0, 2)}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 text-center group-hover:text-neutral-700 transition-colors">
                  {institution.shortName}
                </span>
                {institution.hasAgreement && institution.agreementType && (
                  <span className="mt-1 text-[10px] text-[#22c55e] font-medium">
                    Convenio
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-8">
          <a
            href="#instituciones"
            className="text-sm text-[#4654CD] font-medium hover:underline"
          >
            Ver todas las instituciones aliadas
          </a>
        </div>
      </div>
    </div>
  );
};

export default SocialProofV2;
