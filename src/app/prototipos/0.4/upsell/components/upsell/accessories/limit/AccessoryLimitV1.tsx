// AccessoryLimitV1 - Sin Límite: Libertad total de selección
'use client';

import React from 'react';

interface AccessoryLimitProps {
  selected: number;
  max?: number;
  className?: string;
}

// V1: No muestra nada, libertad total
export const AccessoryLimitV1: React.FC<AccessoryLimitProps> = () => {
  return null;
};
