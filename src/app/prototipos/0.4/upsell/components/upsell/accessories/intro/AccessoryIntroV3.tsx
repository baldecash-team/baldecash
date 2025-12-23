'use client';

import React from 'react';
import { Users } from 'lucide-react';

/**
 * AccessoryIntroV3 - Social proof con ilustración
 * "Los estudiantes también llevan..."
 */
export const AccessoryIntroV3: React.FC = () => {
  return (
    <div className="mb-6 bg-[#4654CD]/5 rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#4654CD]/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-[#4654CD]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 mb-1">
            Los estudiantes también llevan...
          </h2>
          <p className="text-sm text-neutral-600">
            7 de cada 10 estudiantes agregan al menos un accesorio a su compra.{' '}
            <span className="text-neutral-400">Todos son opcionales.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessoryIntroV3;
