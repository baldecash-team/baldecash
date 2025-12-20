'use client';

import { Card, CardBody, Button } from '@nextui-org/react';
import { useState, useRef } from 'react';

export interface SimilarProduct {
  id: string;
  name: string;
  thumbnail: string;
  monthlyQuota: number;
  quotaDifference: number;
  matchScore: number;
  differentiators: string[];
  slug: string;
}

export interface SimilarProductsProps {
  products: SimilarProduct[];
  currentQuota: number;
}

export default function SimilarProductsV2({ products, currentQuota }: SimilarProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/200x200/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/prototipos/0.4/producto/${slug}`;
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-neutral-800 mb-2">
          Productos similares
        </h3>
        <p className="text-neutral-600 text-sm">
          Desliza para ver más opciones y comparar cuotas
        </p>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-colors"
            aria-label="Scroll left"
          >
            <svg
              className="w-5 h-5 text-neutral-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => {
            const isCheaper = product.quotaDifference < 0;

            return (
              <Card
                key={product.id}
                className="min-w-[280px] md:min-w-[300px] cursor-pointer hover:shadow-lg transition-shadow snap-start"
                isPressable
                onPress={() => handleProductClick(product.slug)}
              >
                <CardBody className="p-4">
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-[4/3] mb-3 bg-neutral-100 rounded-lg overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Product Name */}
                  <h4 className="font-semibold text-neutral-800 mb-2 line-clamp-2 h-12">
                    {product.name}
                  </h4>

                  {/* Quota Comparison - CRITICAL */}
                  <div className="bg-neutral-50 rounded-lg p-3 mb-3">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-2xl font-bold text-neutral-800">
                        S/{product.monthlyQuota}
                      </span>
                      <span className="text-sm text-neutral-500">/mes</span>
                    </div>

                    {product.quotaDifference !== 0 && (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isCheaper ? 'text-[#22c55e]' : 'text-amber-600'
                          }`}
                        >
                          {isCheaper ? '' : '+'}S/{Math.abs(product.quotaDifference)}/mes
                        </span>
                        <span className="text-xs text-neutral-500">
                          vs actual
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Match Score */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 bg-neutral-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#4654CD] h-full rounded-full transition-all"
                        style={{ width: `${product.matchScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-neutral-600">
                      {product.matchScore}%
                    </span>
                  </div>

                  {/* Key Differentiators */}
                  {product.differentiators.length > 0 && (
                    <div className="mb-3">
                      <ul className="space-y-1">
                        {product.differentiators.slice(0, 2).map((diff, idx) => (
                          <li key={idx} className="text-xs text-neutral-600 flex items-start gap-1">
                            <span className="text-[#4654CD] mt-0.5">•</span>
                            <span>{diff}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  <Button
                    color={isCheaper ? 'success' : 'primary'}
                    variant="solid"
                    className="w-full"
                    size="sm"
                  >
                    {isCheaper ? `Ahorra S/${Math.abs(product.quotaDifference)}/mes` : 'Ver producto'}
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-colors"
            aria-label="Scroll right"
          >
            <svg
              className="w-5 h-5 text-neutral-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile scroll hint */}
      <p className="md:hidden text-center text-xs text-neutral-500 mt-2">
        Desliza para ver más productos →
      </p>
    </div>
  );
}
