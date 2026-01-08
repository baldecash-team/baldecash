'use client';

/**
 * SimilarProducts - Carousel con cards estilo catálogo
 * Incluye: match %, comparación vs precio actual, tags diferenciadores
 */

import React, { useRef, useState } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SimilarProductsProps } from '../../../types/detail';

export const SimilarProducts: React.FC<SimilarProductsProps> = ({ products, currentQuota }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/400x300/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/prototipos/0.5/producto/detail-preview?mode=clean`;
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
          const priceDiff = Math.abs(product.quotaDifference);

          return (
            <motion.div
              key={product.id}
              className="min-w-[280px] md:min-w-[300px] snap-start"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white">
                <CardBody className="p-0 flex flex-col">
                  {/* Image */}
                  <div className="relative bg-gradient-to-b from-neutral-50 to-white p-4">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={handleImageError}
                      />
                    </div>

                    {/* Match Badge - Top Left */}
                    <div className="absolute top-6 left-6">
                      <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-md flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#4654CD]" />
                        <span className="text-xs font-bold text-neutral-800">{product.matchScore}% match</span>
                      </div>
                    </div>

                    {/* Price Comparison Badge - Top Right */}
                    <div className="absolute top-6 right-6">
                      <div className={`px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 ${
                        isCheaper
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {isCheaper ? (
                          <TrendingDown className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5" />
                        )}
                        <span className="text-xs font-bold">
                          {isCheaper ? '-' : '+'}S/{priceDiff}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content - Centered like catalog */}
                  <div className="p-5 text-center flex flex-col flex-1">
                    {/* Comparison vs current */}
                    <div className={`inline-flex items-center justify-center gap-1.5 text-xs font-medium mb-2 ${
                      isCheaper ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {isCheaper ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                      <span>vs S/{currentQuota}/mes actual</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-neutral-800 text-base line-clamp-2 mb-3 min-h-[3rem]">
                      {product.name}
                    </h3>

                    {/* Differentiator Tags */}
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                      {product.differentiators.map((diff, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-[#4654CD]/10 text-[#4654CD] text-xs font-medium rounded-full"
                        >
                          {diff}
                        </span>
                      ))}
                    </div>

                    {/* Giant Price */}
                    <div className={`rounded-2xl py-4 px-6 mb-4 ${
                      isCheaper
                        ? 'bg-emerald-50'
                        : 'bg-[#4654CD]/5'
                    }`}>
                      <p className="text-xs text-neutral-500 mb-1">Cuota mensual</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-3xl font-black ${
                          isCheaper ? 'text-emerald-600' : 'text-[#4654CD]'
                        }`}>
                          S/{product.monthlyQuota}
                        </span>
                        <span className="text-base text-neutral-400">/mes</span>
                      </div>
                      {isCheaper && (
                        <p className="text-xs text-emerald-600 font-medium mt-1">
                          Ahorras S/{priceDiff}/mes
                        </p>
                      )}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* CTAs */}
                    <div className="flex gap-2">
                      <Button
                        size="md"
                        variant="bordered"
                        className="flex-1 border-[#4654CD] text-[#4654CD] font-semibold cursor-pointer hover:bg-[#4654CD]/5 rounded-xl"
                        startContent={<Eye className="w-4 h-4" />}
                        onPress={() => handleProductClick(product.slug)}
                      >
                        Detalle
                      </Button>
                      <Button
                        size="md"
                        className={`flex-1 font-semibold cursor-pointer rounded-xl ${
                          isCheaper
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
                        }`}
                        endContent={<ArrowRight className="w-4 h-4" />}
                        onPress={() => handleProductClick(product.slug)}
                      >
                        {isCheaper ? 'Ahorrar' : 'Lo quiero'}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
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

export default SimilarProducts;
