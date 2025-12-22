'use client';

import React from 'react';
import { Info } from 'lucide-react';

/**
 * IllustrationTypeV3 - Sin ilustración
 * Solo iconografía minimalista flat
 * Máxima simplicidad, enfoque en el contenido
 */

export const IllustrationTypeV3: React.FC = () => {
  return (
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center">
        <Info className="w-8 h-8 text-neutral-500" strokeWidth={1.5} />
      </div>
    </div>
  );
};
