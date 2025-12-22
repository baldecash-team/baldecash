'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { AlternativeProduct } from '../../../types/rejection';

/**
 * ProductAlternativesV2 - Lista simple
 * Nombre + precio, sin imágenes
 * Minimalista y compacto
 */

interface ProductAlternativesProps {
  products: AlternativeProduct[];
  onSelect?: (product: AlternativeProduct) => void;
}

export const ProductAlternativesV2: React.FC<ProductAlternativesProps> = ({ products, onSelect }) => {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-neutral-800 mb-3">Productos alternativos</h3>

      <div className="bg-neutral-50 rounded-lg divide-y divide-neutral-100">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onSelect?.(product)}
            className="w-full flex items-center justify-between p-4 hover:bg-neutral-100 transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg"
          >
            <div className="text-left">
              <p className="font-medium text-neutral-800">{product.name}</p>
              <p className="text-sm text-neutral-500">{product.brand}</p>
            </div>
            <div className="text-right flex items-center gap-2">
              <div>
                <p className="font-semibold text-neutral-800">S/{product.price.toLocaleString()}</p>
                <p className="text-xs text-[#4654CD]">S/{product.monthlyQuota}/mes</p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
