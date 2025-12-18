'use client';

/**
 * SimilarProductsV2 - Grid 3 Columnas
 *
 * Caracteristicas:
 * - Grid responsive
 * - Cards con mas detalle
 * - Comparacion directa
 * - Ideal para: comparacion, mobile
 */

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ArrowRight, Check, X, Scale } from 'lucide-react';
import { SimilarProductsProps } from '../../../types/detail';
import { formatCurrency } from '../../../data/mockDetailData';

export const SimilarProductsV2: React.FC<SimilarProductsProps> = ({
  products,
  currentProductId,
}) => {
  const filteredProducts = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">Tambien te puede interesar</h3>
          <p className="text-sm text-neutral-500">
            Basado en tus preferencias y presupuesto
          </p>
        </div>

        <Button
          variant="flat"
          size="sm"
          endContent={<Scale className="w-4 h-4" />}
          className="bg-[#4654CD]/10 text-[#4654CD] font-medium cursor-pointer"
        >
          Comparar
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            isPressable
            className="border border-neutral-200 hover:border-[#4654CD]/30 hover:shadow-md transition-all"
          >
            <CardBody className="p-0">
              {/* Image section */}
              <div className="relative bg-neutral-50 p-4">
                {/* Match badge */}
                <div className="absolute top-3 left-3 z-10">
                  <Chip
                    size="sm"
                    radius="sm"
                    classNames={{
                      base: `px-2 py-0.5 h-auto ${
                        product.matchScore >= 90
                          ? 'bg-[#22c55e]'
                          : product.matchScore >= 80
                          ? 'bg-[#4654CD]'
                          : 'bg-neutral-600'
                      }`,
                      content: 'text-white text-xs font-medium',
                    }}
                  >
                    {product.matchScore}% match
                  </Chip>
                </div>

                {/* Image */}
                <div className="w-full h-40 flex items-center justify-center">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Name */}
                <h4 className="font-semibold text-neutral-800 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h4>

                {/* Differentiators as pros/cons */}
                <div className="space-y-1">
                  {product.differentiators.map((diff, i) => {
                    const isPositive =
                      diff.toLowerCase().includes('mejor') ||
                      diff.toLowerCase().includes('mas') ||
                      diff.toLowerCase().includes('intel');

                    return (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {isPositive ? (
                          <Check className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        )}
                        <span className="text-neutral-600">{diff}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-neutral-100 pt-3">
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-[#4654CD]">
                        {formatCurrency(product.lowestQuota)}
                        <span className="text-sm font-normal text-neutral-500">/mes</span>
                      </p>
                      <p className="text-xs text-neutral-500">
                        Precio: {formatCurrency(product.price)}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      isIconOnly
                      variant="flat"
                      className="bg-[#4654CD]/10 text-[#4654CD] cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button
          variant="bordered"
          endContent={<ArrowRight className="w-4 h-4" />}
          className="border-[#4654CD] text-[#4654CD] font-medium cursor-pointer"
        >
          Ver mas opciones en tu rango de precio
        </Button>
      </div>
    </div>
  );
};

export default SimilarProductsV2;
