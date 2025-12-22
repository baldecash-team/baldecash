'use client';

import React from 'react';
import { Laptop, ArrowRight } from 'lucide-react';

/**
 * ProductAlternativesV3 - Solo mención
 * Link a "Ver opciones más accesibles"
 * Mínimo espacio, máxima simplicidad
 */

interface ProductAlternativesProps {
  onViewAll?: () => void;
}

export const ProductAlternativesV3: React.FC<ProductAlternativesProps> = ({ onViewAll }) => {
  return (
    <div className="mb-6">
      <button
        onClick={onViewAll}
        className="w-full flex items-center justify-between p-4 bg-[#4654CD]/5 rounded-lg border border-[#4654CD]/20 hover:bg-[#4654CD]/10 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
            <Laptop className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div className="text-left">
            <p className="font-medium text-neutral-800">Ver opciones más accesibles</p>
            <p className="text-sm text-neutral-500">Laptops con cuotas desde S/49/mes</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-[#4654CD] group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
