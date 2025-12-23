'use client';

import React from 'react';
import { Heart } from 'lucide-react';

/**
 * InsuranceIntroV2 - Emocional lifestyle
 * "Tranquilidad total" - enfoque en el beneficio emocional
 */
export const InsuranceIntroV2: React.FC = () => {
  return (
    <div className="mb-6 text-center">
      <Heart className="w-8 h-8 text-[#4654CD] mx-auto mb-3" />
      <h2 className="text-xl font-semibold text-neutral-800 mb-1">
        Tranquilidad total
      </h2>
      <p className="text-sm text-neutral-600">
        Protección que te permite enfocarte en lo importante: tus estudios.
      </p>
    </div>
  );
};

export default InsuranceIntroV2;
