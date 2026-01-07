'use client';

import React from 'react';
import { SearchX } from 'lucide-react';
import { EmptyIllustrationProps } from '../../../types/empty';

/**
 * EmptyIllustrationV1 - Icono SearchX
 * Icono SearchX grande + mensaje simple centrado
 * Referencia: Producto - Amazon, eBay
 */
export const EmptyIllustrationV1: React.FC<EmptyIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Icono grande */}
      <div className="w-32 h-32 mb-6 text-neutral-300">
        <SearchX className="w-full h-full" />
      </div>

      {/* Mensaje */}
      <h3 className="text-xl font-bold text-neutral-800 mb-2">
        No encontramos laptops con estos filtros
      </h3>
      <p className="text-neutral-600 max-w-md">
        Prueba ajustando tus filtros o explora otras opciones que podrían interesarte
      </p>
    </div>
  );
};
