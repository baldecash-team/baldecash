'use client';

import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Star, ArrowRight, ChevronRight } from 'lucide-react';
import type { AlternativeProduct } from '../../../types/rejection';

/**
 * ProductAlternativesV5 - Featured + lista
 * Un producto destacado + lista de otros
 * Jerarquía clara
 */

interface ProductAlternativesProps {
  products: AlternativeProduct[];
  onSelect?: (product: AlternativeProduct) => void;
}

export const ProductAlternativesV5: React.FC<ProductAlternativesProps> = ({ products, onSelect }) => {
  const featured = products[0];
  const others = products.slice(1);

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-neutral-800 mb-3">Productos recomendados</h3>

      {/* Producto destacado */}
      {featured && (
        <Card className="border-2 border-[#4654CD] mb-4">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-[#4654CD]" fill="currentColor" />
              <span className="text-xs font-medium text-[#4654CD]">Mejor opción para ti</span>
            </div>

            <div className="flex gap-4">
              <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <img
                  src={featured.image}
                  alt={featured.name}
                  className="w-16 h-16 object-contain"
                  loading="lazy"
                />
              </div>

              <div className="flex-1">
                <p className="text-xs text-neutral-500">{featured.brand}</p>
                <h4 className="font-semibold text-neutral-800">{featured.name}</h4>
                <div className="mt-2">
                  <p className="text-lg font-bold text-[#4654CD]">S/{featured.monthlyQuota}/mes</p>
                  <p className="text-xs text-neutral-500">Precio: S/{featured.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-4 bg-[#4654CD] text-white cursor-pointer"
              endContent={<ArrowRight className="w-4 h-4" />}
              onPress={() => onSelect?.(featured)}
            >
              Ver este producto
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Lista de otros */}
      {others.length > 0 && (
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-500 mb-2 px-1">Otras opciones</p>
          <div className="space-y-1">
            {others.map((product) => (
              <button
                key={product.id}
                onClick={() => onSelect?.(product)}
                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-white transition-colors cursor-pointer"
              >
                <span className="text-sm text-neutral-700">{product.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#4654CD]">S/{product.monthlyQuota}/mes</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
