// SelectionIndicatorV5 - Move Section: Indicator para sección "Seleccionados"
'use client';

import React from 'react';
import { Check, ShoppingBag } from 'lucide-react';

interface SelectionIndicatorProps {
  isSelected: boolean;
  className?: string;
}

export const SelectionIndicatorV5: React.FC<SelectionIndicatorProps> = ({
  isSelected,
  className = '',
}) => {
  if (!isSelected) return null;

  return (
    <div className={`absolute top-0 left-0 right-0 z-10 ${className}`}>
      <div className="bg-[#4654CD] text-white text-xs py-1 px-2 flex items-center justify-center gap-1">
        <ShoppingBag className="w-3 h-3" />
        <span>En tu carrito</span>
        <Check className="w-3 h-3 ml-1" />
      </div>
    </div>
  );
};

export default SelectionIndicatorV5;
