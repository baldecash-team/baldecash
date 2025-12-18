'use client';

/**
 * ProductAlternativesV2 - Carrusel de productos alternativos
 *
 * G.11 V2: Carrusel horizontal con scroll
 */

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Package, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { AlternativeProduct } from '../../../types/rejection';

interface ProductAlternativesV2Props {
  products: AlternativeProduct[];
  onSelectProduct?: (product: AlternativeProduct) => void;
}

export const ProductAlternativesV2: React.FC<ProductAlternativesV2Props> = ({
  products,
  onSelectProduct,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#4654CD]" />
          Alternativas para ti
        </h3>

        <div className="flex gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="bordered"
            onPress={() => scroll('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="bordered"
            onPress={() => scroll('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            className="flex-shrink-0 w-64 snap-start"
          >
            <Card className="border border-neutral-200 h-full">
              <CardBody className="p-4">
                <div className="w-full h-32 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg mb-3 flex items-center justify-center">
                  <Package className="w-12 h-12 text-neutral-300" />
                </div>

                <h4 className="font-medium text-neutral-800 mb-1">
                  {product.name}
                </h4>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-bold text-[#4654CD]">
                    S/ {product.monthlyQuota}
                  </span>
                  <span className="text-sm text-neutral-500">/mes</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-green-600 mb-3">
                  <Check className="w-3 h-3" />
                  <span>Pre-aprobado para ti</span>
                </div>

                <Button
                  size="sm"
                  variant="bordered"
                  className="w-full border-[#4654CD] text-[#4654CD]"
                  onPress={() => onSelectProduct?.(product)}
                >
                  Seleccionar
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductAlternativesV2;
