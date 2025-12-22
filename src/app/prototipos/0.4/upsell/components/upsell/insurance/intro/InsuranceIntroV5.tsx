'use client';

import React from 'react';
import { Chip } from '@nextui-org/react';
import { Shield } from 'lucide-react';

/**
 * InsuranceIntroV5 - Split layout
 * "Protección" título + "Para tu tranquilidad" subtítulo
 */
export const InsuranceIntroV5: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#4654CD]" />
          <h2 className="text-xl font-semibold text-neutral-800">
            Protección
          </h2>
        </div>
        <Chip
          size="sm"
          radius="sm"
          classNames={{
            base: 'bg-[#4654CD]/10 px-3 py-1 h-auto',
            content: 'text-[#4654CD] text-xs font-medium',
          }}
        >
          Opcional
        </Chip>
      </div>
      <p className="text-neutral-600 border-l-2 border-[#4654CD] pl-3">
        Para tu tranquilidad. Elige el plan que mejor se adapte a ti.
      </p>
    </div>
  );
};

export default InsuranceIntroV5;
