'use client';

/**
 * InstitutionalBannerV1 - Banner horizontal debajo del hero
 *
 * Caracteristicas:
 * - Banner horizontal con informacion del convenio
 * - Maxima visibilidad
 * - Muestra beneficios del convenio
 */

import React from 'react';
import { Button, Image } from '@nextui-org/react';
import { Building, Gift, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { InstitutionalBannerProps } from '../../../types/hero';
import { conveniosStats } from '@/app/prototipos/_shared/data/conveniosLogos';

export const InstitutionalBannerV1: React.FC<InstitutionalBannerProps> = ({
  institution,
  onSearch,
}) => {
  if (!institution) {
    return (
      <div className="bg-[#4654CD]/5 border-y border-[#4654CD]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-[#4654CD]" />
              <span className="text-neutral-700">
                Tenemos convenios con{' '}
                <span className="font-semibold">{conveniosStats.totalConvenios}+ instituciones</span>
              </span>
            </div>
            <Button
              variant="light"
              className="text-[#4654CD] font-medium cursor-pointer"
              endContent={<ArrowRight className="w-4 h-4" />}
              onPress={onSearch}
            >
              Buscar mi institucion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#4654CD] text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Institution logo */}
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1.5">
              {institution.logo ? (
                <Image
                  src={institution.logo}
                  alt={institution.name}
                  className="w-full h-full object-contain"
                  removeWrapper
                />
              ) : (
                <span className="text-[#4654CD] font-bold text-xs">
                  {institution.shortName?.substring(0, 3) || institution.code.substring(0, 2)}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold">{institution.name}</p>
              {institution.specialConditions && (
                <p className="text-sm text-white/80 flex items-center gap-1">
                  <Gift className="w-4 h-4" />
                  {institution.specialConditions}
                </p>
              )}
            </div>
          </div>
          <Button
            className="bg-white text-[#4654CD] font-semibold cursor-pointer"
            endContent={<ArrowRight className="w-4 h-4" />}
          >
            Ver beneficios
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default InstitutionalBannerV1;
