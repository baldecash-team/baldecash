'use client';

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ArrowRight, Check } from 'lucide-react';
import type { AlternativeProduct } from '../../../types/rejection';

/**
 * ProductAlternativesV6 - Cards hero
 * Productos alternativos grandes y prominentes
 * Máximo impacto visual
 */

interface ProductAlternativesProps {
  products: AlternativeProduct[];
  onSelect?: (product: AlternativeProduct) => void;
}

export const ProductAlternativesV6: React.FC<ProductAlternativesProps> = ({ products, onSelect }) => {
  return (
    <div className="mb-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-neutral-800 mb-2">
          Productos que sí puedes obtener
        </h3>
        <p className="text-neutral-600">
          Estas opciones están pre-aprobadas para ti
        </p>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <Card key={product.id} className={`border-2 ${index === 0 ? 'border-green-500' : 'border-neutral-200'}`}>
            <CardBody className="p-6">
              {index === 0 && (
                <Chip
                  size="sm"
                  className="bg-green-500 text-white mb-4"
                  startContent={<Check className="w-3 h-3" />}
                >
                  Alta probabilidad de aprobación
                </Chip>
              )}

              <div className="flex flex-col sm:flex-row gap-6">
                {/* Imagen grande */}
                <div className="w-full sm:w-32 h-32 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto sm:mx-0 flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-neutral-500 mb-1">{product.brand}</p>
                  <h4 className="text-xl font-bold text-neutral-800 mb-2">{product.name}</h4>

                  {product.specs && (
                    <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                      {product.specs.map((spec, i) => (
                        <Chip key={i} size="sm" variant="flat" className="bg-neutral-100">
                          {spec}
                        </Chip>
                      ))}
                    </div>
                  )}

                  <div className="flex items-baseline gap-2 justify-center sm:justify-start mb-4">
                    <span className="text-2xl font-bold text-[#4654CD]">S/{product.monthlyQuota}</span>
                    <span className="text-neutral-500">/mes</span>
                  </div>

                  <Button
                    color={index === 0 ? 'success' : 'primary'}
                    className={`${index === 0 ? 'bg-green-500' : 'bg-[#4654CD]'} text-white cursor-pointer`}
                    endContent={<ArrowRight className="w-4 h-4" />}
                    onPress={() => onSelect?.(product)}
                  >
                    Solicitar este producto
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
