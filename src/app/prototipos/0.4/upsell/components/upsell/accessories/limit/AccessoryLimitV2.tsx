// AccessoryLimitV2 - Contador: "2 de 3 seleccionados" sutil
'use client';

import React from 'react';

interface AccessoryLimitProps {
  selected: number;
  max?: number;
  className?: string;
}

export const AccessoryLimitV2: React.FC<AccessoryLimitProps> = ({
  selected,
  max = 3,
  className = '',
}) => {
  return (
    <div className={`text-sm text-neutral-500 ${className}`}>
      <span className="text-neutral-900 font-medium">{selected}</span>
      <span> de {max} seleccionados</span>
    </div>
  );
};

export default AccessoryLimitV2;
