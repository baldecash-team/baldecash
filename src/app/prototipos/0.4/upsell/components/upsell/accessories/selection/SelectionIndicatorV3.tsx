// SelectionIndicatorV3 - Color + Check: Cambio de color con check flat
'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface SelectionIndicatorProps {
  isSelected: boolean;
  className?: string;
}

export const SelectionIndicatorV3: React.FC<SelectionIndicatorProps> = ({
  isSelected,
  className = '',
}) => {
  return (
    <div className={`absolute top-3 right-3 z-10 ${className}`}>
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-[#03DBD0] text-white'
            : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
        }`}
      >
        <Check className={`w-4 h-4 ${isSelected ? '' : 'opacity-50'}`} />
      </div>
    </div>
  );
};
