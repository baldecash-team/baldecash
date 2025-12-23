// AccessoryLimitV3 - Badge: "Máximo 3" con ilustración flat
'use client';

import React from 'react';
import { Package } from 'lucide-react';

interface AccessoryLimitProps {
  selected: number;
  max?: number;
  className?: string;
}

export const AccessoryLimitV3: React.FC<AccessoryLimitProps> = ({
  selected,
  max = 3,
  className = '',
}) => {
  const remaining = max - selected;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full ${className}`}>
      <Package className="w-4 h-4 text-neutral-500" />
      <span className="text-sm text-neutral-600">
        Máximo {max} accesorios
        {remaining > 0 && (
          <span className="text-neutral-400"> ({remaining} disponibles)</span>
        )}
      </span>
    </div>
  );
};

export default AccessoryLimitV3;
