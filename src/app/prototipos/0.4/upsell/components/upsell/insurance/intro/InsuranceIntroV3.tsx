'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * InsuranceIntroV3 - Claro con ilustración
 * "Seguro contra accidentes" - directo y educativo
 */
export const InsuranceIntroV3: React.FC = () => {
  return (
    <div className="mb-6 bg-amber-50 rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 mb-1">
            Seguro contra accidentes
          </h2>
          <p className="text-sm text-neutral-600">
            Si se te cae, derrama agua, o te la roban, estás cubierto.{' '}
            <span className="text-neutral-400">Todos los planes son opcionales.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsuranceIntroV3;
