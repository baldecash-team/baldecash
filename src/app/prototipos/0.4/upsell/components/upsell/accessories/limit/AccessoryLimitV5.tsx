// AccessoryLimitV5 - Split Warning: Contador + warning si excede
'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AccessoryLimitProps {
  selected: number;
  max?: number;
  className?: string;
}

export const AccessoryLimitV5: React.FC<AccessoryLimitProps> = ({
  selected,
  max = 3,
  className = '',
}) => {
  const isAtLimit = selected >= max;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-600">Seleccionados:</span>
        <div className="flex gap-1">
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < selected ? 'bg-[#4654CD]' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>
      </div>
      {isAtLimit && (
        <div className="flex items-center gap-1 text-amber-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">Límite alcanzado</span>
        </div>
      )}
    </div>
  );
};

export default AccessoryLimitV5;
