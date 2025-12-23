'use client';

/**
 * SimilarProductsV2 - Carousel Horizontal Premium
 *
 * Smooth horizontal carousel with swipe support,
 * large cards, and quota-focused design.
 */

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Star } from 'lucide-react';
import { SimilarProductsProps } from '../../../types/detail';

export const SimilarProductsV2: React.FC<SimilarProductsProps> = ({ products, currentQuota }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/200x200/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/prototipos/0.4/producto/detail-preview?infoHeader=3&gallery=1&tabs=1&specs=2&pricing=4&cronograma=2&similar=2&limitations=6&certifications=1&mode=clean`;
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
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-1">También te puede interesar</h3>
          <p className="text-sm text-neutral-500">Desliza para explorar más opciones</p>
        </div>

        {/* Navigation Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              canScrollLeft
                ? 'bg-[#4654CD] text-white hover:bg-[#3a47b3] shadow-lg'
                : 'bg-neutral-100 text-neutral-300'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              canScrollRight
                ? 'bg-[#4654CD] text-white hover:bg-[#3a47b3] shadow-lg'
                : 'bg-neutral-100 text-neutral-300'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-2 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => {
          const isCheaper = product.quotaDifference < 0;

          return (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.slug)}
              className="min-w-[280px] md:min-w-[300px] bg-gradient-to-b from-neutral-50 to-white rounded-2xl border border-neutral-200 overflow-hidden snap-start cursor-pointer hover:shadow-xl hover:border-[#4654CD]/30 transition-all group"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={handleImageError}
                />

                {/* Quota Badge Overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/80 text-xs mb-0.5">Cuota mensual</p>
                      <p className="text-white text-2xl font-bold">S/{product.monthlyQuota}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                      isCheaper ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {isCheaper ? '' : '+'}S/{Math.abs(product.quotaDifference)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-bold text-neutral-800 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h4>

                {/* Match & Comparison */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm text-neutral-600">{product.matchScore}% match</span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    isCheaper ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {isCheaper ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    <span>vs S/{currentQuota}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {product.differentiators.slice(0, 2).map((diff, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#4654CD]/10 text-[#4654CD] text-xs font-medium rounded-full"
                    >
                      {diff}
                    </span>
                  ))}
                </div>

                {/* CTA - Dynamic based on product differences */}
                <button className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  isCheaper
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
                }`}>
                  {isCheaper
                    ? `Ahorra S/${Math.abs(product.quotaDifference)}/mes`
                    : product.differentiators.some(d => d.toLowerCase().includes('procesador') || d.toLowerCase().includes('cpu') || d.toLowerCase().includes('ryzen') || d.toLowerCase().includes('intel'))
                      ? 'Mejora tu procesador'
                      : product.differentiators.some(d => d.toLowerCase().includes('ssd') || d.toLowerCase().includes('almacenamiento') || d.toLowerCase().includes('tb') || d.toLowerCase().includes('512'))
                        ? 'Mejora tu almacenamiento'
                        : product.differentiators.some(d => d.toLowerCase().includes('ram') || d.toLowerCase().includes('memoria') || d.toLowerCase().includes('16gb') || d.toLowerCase().includes('32gb'))
                          ? 'Mejora tu RAM'
                          : `+S/${Math.abs(product.quotaDifference)}/mes más`
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Scroll Hint */}
      <p className="md:hidden text-center text-xs text-neutral-400 mt-3">
        Desliza para ver más →
      </p>
    </div>
  );
};

export default SimilarProductsV2;
