'use client';

import React from 'react';
import { Package, Mouse, Headphones, HardDrive } from 'lucide-react';

/**
 * AccessoryIntroV1 - Título sutil con iconos
 * "Complementa tu laptop" - sutil y no agresivo
 */
export const AccessoryIntroV1: React.FC = () => {
  const icons = [
    { Icon: Mouse, label: 'Mouse' },
    { Icon: Headphones, label: 'Audio' },
    { Icon: HardDrive, label: 'Almacenamiento' },
    { Icon: Package, label: 'Accesorios' },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-semibold text-neutral-800">
          Complementa tu laptop
        </h2>
        <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded">
          Opcional
        </span>
      </div>
      <p className="text-sm text-neutral-600 mb-4">
        Agrega los accesorios que necesites. Se suman a tu cuota mensual.
      </p>
      <div className="flex gap-4">
        {icons.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 text-neutral-400"
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessoryIntroV1;
