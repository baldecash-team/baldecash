'use client';

import React from 'react';
import { Users } from 'lucide-react';

/**
 * AccessoryIntro - Social proof con ilustración (basado en V3 de 0.4)
 * "Los estudiantes también llevan..."
 */
export const AccessoryIntro: React.FC = () => {
  return (
    <div className="mb-6 bg-[rgba(var(--color-primary-rgb),0.05)] rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[rgba(var(--color-primary-rgb),0.1)] rounded-full flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-[var(--color-primary)]" />
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

export default AccessoryIntro;
