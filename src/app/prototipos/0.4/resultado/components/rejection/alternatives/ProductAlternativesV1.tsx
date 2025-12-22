'use client';

import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { ShoppingCart } from 'lucide-react';
import type { AlternativeProduct } from '../../../types/rejection';

/**
 * ProductAlternativesV1 - Cards completas
 * Imagen + nombre + precio + cuota
 * Vista completa de cada producto
 */

interface ProductAlternativesProps {
  products: AlternativeProduct[];
  onSelect?: (product: AlternativeProduct) => void;
}

export const ProductAlternativesV1: React.FC<ProductAlternativesProps> = ({ products, onSelect }) => {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-neutral-800 mb-3">Productos que sí puedes obtener</h3>

      <div className="grid sm:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="border border-neutral-200">
            <CardBody className="p-4">
              {/* Imagen */}
              <div className="aspect-square bg-neutral-100 rounded-lg mb-3 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-3/4 h-3/4 object-contain"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <p className="text-xs text-neutral-500 mb-1">{product.brand}</p>
              <h4 className="font-medium text-neutral-800 text-sm mb-2 line-clamp-2">{product.name}</h4>

              {/* Precio */}
              <div className="mb-3">
                <p className="text-lg font-bold text-neutral-800">S/{product.price.toLocaleString()}</p>
                <p className="text-sm text-[#4654CD] font-medium">
                  12 cuotas de S/{product.monthlyQuota}/mes
                </p>
              </div>

              {/* CTA */}
              <Button
                size="sm"
                variant="bordered"
                startContent={<ShoppingCart className="w-4 h-4" />}
                className="w-full border-[#4654CD] text-[#4654CD] cursor-pointer"
                onPress={() => onSelect?.(product)}
              >
                Ver producto
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
