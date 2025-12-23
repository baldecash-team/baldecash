'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { ArrowRight } from 'lucide-react';
import type { AlternativeProduct } from '../../../types/rejection';

/**
 * ProductAlternativesV4 - Mini cards
 * Imagen pequeña + precio destacado
 * Compacto pero visual
 */

interface ProductAlternativesProps {
  products: AlternativeProduct[];
  onSelect?: (product: AlternativeProduct) => void;
}

export const ProductAlternativesV4: React.FC<ProductAlternativesProps> = ({ products, onSelect }) => {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-neutral-800 mb-3">Opciones accesibles</h3>

      <div className="grid gap-2">
        {products.map((product) => (
          <Card
            key={product.id}
            isPressable
            className="border border-neutral-100 hover:border-[#4654CD] transition-all cursor-pointer"
            onPress={() => onSelect?.(product)}
          >
            <CardBody className="flex flex-row items-center gap-3 p-3">
              {/* Mini imagen */}
              <div className="w-14 h-14 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 object-contain"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-800 text-sm truncate">{product.name}</p>
                <p className="text-xs text-neutral-500">{product.brand}</p>
              </div>

              {/* Precio */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-[#4654CD]">S/{product.monthlyQuota}/mes</p>
                <p className="text-xs text-neutral-500">S/{product.price.toLocaleString()}</p>
              </div>

              <ArrowRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
