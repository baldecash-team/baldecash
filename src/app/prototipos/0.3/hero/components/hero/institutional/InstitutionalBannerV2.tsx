'use client';

/**
 * InstitutionalBannerV2 - Chip flotante
 *
 * Caracteristicas:
 * - Chip pequeno junto al contenido
 * - Sutil pero presente
 * - No ocupa espacio vertical
 */

import React from 'react';
import { Chip } from '@nextui-org/react';
import { Building, CheckCircle } from 'lucide-react';
import { InstitutionalBannerProps } from '../../../types/hero';
import { conveniosStats } from '@/app/prototipos/_shared/data/conveniosLogos';

export const InstitutionalBannerV2: React.FC<InstitutionalBannerProps> = ({
  institution,
}) => {
  if (!institution) {
    return (
      <Chip
        startContent={<Building className="w-3 h-3" />}
        variant="flat"
        className="bg-[#4654CD]/10 text-[#4654CD]"
        size="sm"
      >
        {conveniosStats.totalConvenios}+ convenios institucionales
      </Chip>
    );
  }

  return (
    <Chip
      startContent={<CheckCircle className="w-3 h-3" />}
      variant="flat"
      className="bg-[#22c55e]/10 text-[#22c55e]"
      size="sm"
    >
      Convenio {institution.shortName}
    </Chip>
  );
};

export default InstitutionalBannerV2;
