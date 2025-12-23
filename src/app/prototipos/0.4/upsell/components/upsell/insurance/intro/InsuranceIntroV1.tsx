'use client';

import React from 'react';
import { Shield } from 'lucide-react';

/**
 * InsuranceIntroV1 - Funcional y directo
 * "Protege tu laptop" - enfoque en el producto
 */
export const InsuranceIntroV1: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-[#4654CD]/10 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-800">
            Protege tu laptop
          </h2>
          <p className="text-sm text-neutral-500">
            Planes de protección opcionales
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsuranceIntroV1;
