'use client';

import React from 'react';
import { FileQuestion } from 'lucide-react';

/**
 * IllustrationTypeV5 - Lateral pequeña
 * Ilustración pequeña no central
 * Acompaña sin dominar
 */

interface IllustrationTypeV5Props {
  position?: 'left' | 'right';
}

export const IllustrationTypeV5: React.FC<IllustrationTypeV5Props> = ({ position = 'left' }) => {
  return (
    <div className={`flex ${position === 'right' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
          <FileQuestion className="w-6 h-6 text-neutral-400" />
        </div>
        {/* Decoración pequeña */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#4654CD]/10" />
      </div>
    </div>
  );
};
