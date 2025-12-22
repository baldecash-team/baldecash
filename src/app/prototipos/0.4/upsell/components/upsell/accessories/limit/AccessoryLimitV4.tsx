// AccessoryLimitV4 - Progress Bar: Barra animada que se llena
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AccessoryLimitProps {
  selected: number;
  max?: number;
  className?: string;
}

export const AccessoryLimitV4: React.FC<AccessoryLimitProps> = ({
  selected,
  max = 3,
  className = '',
}) => {
  const percentage = (selected / max) * 100;
  const isAtLimit = selected >= max;

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-neutral-600">
          Accesorios seleccionados
        </span>
        <span className={`text-sm font-medium ${isAtLimit ? 'text-[#03DBD0]' : 'text-neutral-900'}`}>
          {selected}/{max}
        </span>
      </div>
      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isAtLimit ? 'bg-[#03DBD0]' : 'bg-[#4654CD]'}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default AccessoryLimitV4;
