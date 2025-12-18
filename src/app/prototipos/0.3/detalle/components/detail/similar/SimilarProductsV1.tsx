'use client';

/**
 * SimilarProductsV1 - Carousel Horizontal
 *
 * Caracteristicas:
 * - Carousel swipeable
 * - 4 productos visibles en desktop
 * - Navegacion con flechas
 * - Ideal para: desktop, exploracion rapida
 */

import React, { useRef, useState } from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ChevronLeft, ChevronRight, ArrowRight, Percent } from 'lucide-react';
import { SimilarProductsProps } from '../../../types/detail';
import { formatCurrency } from '../../../data/mockDetailData';

export const SimilarProductsV1: React.FC<SimilarProductsProps> = ({
  products,
  currentProductId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;

    const scrollAmount = 300;
    const newScrollLeft =
      direction === 'left'
        ? containerRef.current.scrollLeft - scrollAmount
        : containerRef.current.scrollLeft + scrollAmount;

    containerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const filteredProducts = products.filter((p) => p.id !== currentProductId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">Productos similares</h3>
          <p className="text-sm text-neutral-500">Que tambien podrian interesarte</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              canScrollLeft
                ? 'border-neutral-300 hover:border-[#4654CD] hover:bg-[#4654CD]/5'
                : 'border-neutral-200 opacity-50 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              canScrollRight
                ? 'border-neutral-300 hover:border-[#4654CD] hover:bg-[#4654CD]/5'
                : 'border-neutral-200 opacity-50 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            isPressable
            className="flex-shrink-0 w-64 border border-neutral-200 hover:border-[#4654CD]/30 transition-colors"
          >
            <CardBody className="p-4">
              {/* Match score */}
              <div className="flex justify-between items-start mb-3">
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: 'bg-[#4654CD]/10 px-2 py-0.5 h-auto',
                    content: 'text-[#4654CD] text-xs font-medium',
                  }}
                >
                  {product.matchScore}% similar
                </Chip>
              </div>

              {/* Image */}
              <div className="w-full h-32 bg-neutral-50 rounded-lg mb-4 overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
              </div>

              {/* Name */}
              <h4 className="font-medium text-neutral-800 mb-2 line-clamp-2">
                {product.name}
              </h4>

              {/* Differentiators */}
              <div className="flex flex-wrap gap-1 mb-3">
                {product.differentiators.slice(0, 2).map((diff, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded"
                  >
                    {diff}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-lg font-bold text-[#4654CD]">
                    {formatCurrency(product.lowestQuota)}/mes
                  </p>
                  <p className="text-xs text-neutral-500">
                    Total: {formatCurrency(product.price)}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-400" />
              </div>
            </CardBody>
          </Card>
        ))}

        {/* Ver todo */}
        <Card className="flex-shrink-0 w-64 border border-dashed border-neutral-300 hover:border-[#4654CD] transition-colors bg-neutral-50/50">
          <CardBody className="p-4 flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 rounded-full bg-[#4654CD]/10 flex items-center justify-center mb-3">
              <ArrowRight className="w-6 h-6 text-[#4654CD]" />
            </div>
            <p className="font-medium text-[#4654CD] text-center">Ver todo el catalogo</p>
            <p className="text-xs text-neutral-500 text-center mt-1">
              +50 laptops disponibles
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SimilarProductsV1;
