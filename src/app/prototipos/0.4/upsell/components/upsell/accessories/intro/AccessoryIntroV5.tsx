'use client';

import React from 'react';
import { Chip } from '@nextui-org/react';
import { Package } from 'lucide-react';

/**
 * AccessoryIntroV5 - Split layout
 * "Accesorios" izquierda + badge "Opcionales" derecha
 */
export const AccessoryIntroV5: React.FC = () => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Package className="w-5 h-5 text-neutral-600" />
        <h2 className="text-xl font-semibold text-neutral-800">
          Accesorios
        </h2>
      </div>
      <Chip
        size="sm"
        radius="sm"
        classNames={{
          base: 'bg-neutral-100 px-3 py-1 h-auto',
          content: 'text-neutral-600 text-xs font-medium',
        }}
      >
        Todos opcionales
      </Chip>
    </div>
  );
};

export default AccessoryIntroV5;
