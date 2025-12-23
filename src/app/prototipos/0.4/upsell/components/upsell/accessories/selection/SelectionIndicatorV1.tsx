// SelectionIndicatorV1 - Check + Border: Checkmark verde + borde primario
'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface SelectionIndicatorProps {
  isSelected: boolean;
  className?: string;
}

export const SelectionIndicatorV1: React.FC<SelectionIndicatorProps> = ({
  isSelected,
  className = '',
}) => {
  if (!isSelected) return null;

  return (
    <div className={`absolute top-2 right-2 z-10 ${className}`}>
      <div className="w-6 h-6 rounded-full bg-[#4654CD] flex items-center justify-center">
        <Check className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};

export default SelectionIndicatorV1;
