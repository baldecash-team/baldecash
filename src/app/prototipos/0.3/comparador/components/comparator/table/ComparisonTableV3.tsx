'use client';

/**
 * ComparisonTableV3 - Scroll Horizontal Mobile
 *
 * Diseño optimizado para mobile con scroll horizontal
 * Header fijo, productos en columnas deslizables
 * Ideal para: mobile, touch gestures
 */

import React, { useRef } from 'react';
import { Chip, Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Trophy,
  X as XIcon,
  Check,
  Minus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ComparisonProduct,
  ComparatorConfig,
  comparableSpecs,
  compareProducts,
  getCategoryLabel,
  getGamaLabel,
  getGamaColor,
  SpecCategory,
} from '../../../types/comparator';

interface ComparisonTableV3Props {
  products: ComparisonProduct[];
  config: ComparatorConfig;
  showOnlyDifferences: boolean;
  highlightWinners: boolean;
  onRemoveProduct?: (productId: string) => void;
}

export const ComparisonTableV3: React.FC<ComparisonTableV3Props> = ({
  products,
  config,
  showOnlyDifferences,
  highlightWinners,
  onRemoveProduct,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const comparisons = compareProducts(products, comparableSpecs);

  // Group specs by category
  const groupedComparisons = comparisons.reduce(
    (acc, comparison) => {
      const category = comparison.spec.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(comparison);
      return acc;
    },
    {} as Record<SpecCategory, typeof comparisons>
  );

  // Filter if showOnlyDifferences is enabled
  const filteredGroups = Object.entries(groupedComparisons).reduce(
    (acc, [category, specs]) => {
      const filtered = showOnlyDifferences
        ? specs.filter((s) => s.isDifferent)
        : specs;
      if (filtered.length > 0) {
        acc[category as SpecCategory] = filtered;
      }
      return acc;
    },
    {} as Record<SpecCategory, typeof comparisons>
  );

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const productWidth = products.length === 2 ? 'w-1/2' : 'w-[45%] md:w-1/3';

  return (
    <div className="relative">
      {/* Navigation Arrows - Desktop */}
      <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10">
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          onPress={() => scroll('left')}
          className="bg-white shadow-md border border-neutral-200 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
      <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10">
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          onPress={() => scroll('right')}
          className="bg-white shadow-md border border-neutral-200 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="inline-flex min-w-full">
          {/* Fixed Label Column */}
          <div className="sticky left-0 z-10 bg-white border-r border-neutral-200 min-w-[120px] w-[120px] flex-shrink-0">
            {/* Empty header cell */}
            <div className="h-[200px] border-b border-neutral-200 bg-neutral-50 flex items-end p-3">
              <span className="text-xs text-neutral-500">
                Desliza para comparar
              </span>
            </div>

            {/* Spec labels */}
            {Object.entries(filteredGroups).map(([category, specs]) => (
              <React.Fragment key={category}>
                {/* Category header */}
                <div className="h-8 bg-neutral-100 flex items-center px-3">
                  <span className="text-xs font-semibold text-neutral-600 uppercase truncate">
                    {getCategoryLabel(category as SpecCategory)}
                  </span>
                </div>
                {/* Spec labels */}
                {specs.map((comparison) => (
                  <div
                    key={comparison.spec.key}
                    className="h-10 border-b border-neutral-100 flex items-center px-3"
                  >
                    <span className="text-xs text-neutral-600 truncate">
                      {comparison.spec.label}
                    </span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Product Columns */}
          {products.map((product, productIdx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: productIdx * 0.1 }}
              className={`${productWidth} min-w-[160px] flex-shrink-0 snap-center border-r border-neutral-100 last:border-r-0`}
            >
              {/* Product Header */}
              <div className="h-[200px] border-b border-neutral-200 bg-neutral-50 p-3 relative">
                {onRemoveProduct && (
                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white border border-neutral-200 hover:bg-[#ef4444] hover:border-[#ef4444] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label={`Quitar ${product.displayName}`}
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                )}

                <div className="flex flex-col items-center h-full justify-between">
                  <img
                    src={product.thumbnail}
                    alt={product.displayName}
                    className="w-16 h-16 object-contain rounded"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-500 uppercase">
                      {product.brand}
                    </p>
                    <p className="text-xs font-medium text-neutral-800 line-clamp-2">
                      {product.displayName}
                    </p>
                  </div>
                  <div className="text-center">
                    <Chip
                      size="sm"
                      radius="sm"
                      classNames={{
                        base: `${getGamaColor(product.gama)} px-1.5 py-0 h-auto`,
                        content: 'text-[10px] font-medium',
                      }}
                    >
                      {getGamaLabel(product.gama)}
                    </Chip>
                    <p className="text-lg font-bold text-[#4654CD] font-['Baloo_2'] mt-1">
                      S/{product.lowestQuota}
                      <span className="text-[10px] font-normal text-neutral-500">
                        /mes
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Spec Values */}
              {Object.entries(filteredGroups).map(([category, specs]) => (
                <React.Fragment key={category}>
                  {/* Category spacer */}
                  <div className="h-8 bg-neutral-100" />
                  {/* Spec values */}
                  {specs.map((comparison) => {
                    const isWinner =
                      highlightWinners &&
                      comparison.winnerIndex === productIdx;
                    const isLoser =
                      highlightWinners && comparison.loserIndex === productIdx;
                    const value = comparison.formattedValues[productIdx];
                    const rawValue = comparison.values[productIdx];

                    return (
                      <div
                        key={comparison.spec.key}
                        className={`h-10 border-b border-neutral-100 flex items-center justify-center px-2 ${
                          isWinner
                            ? 'bg-[#22c55e]/10'
                            : isLoser
                              ? 'bg-[#ef4444]/10'
                              : ''
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {typeof rawValue === 'boolean' ? (
                            rawValue ? (
                              <Check className="w-4 h-4 text-[#22c55e]" />
                            ) : (
                              <Minus className="w-4 h-4 text-neutral-300" />
                            )
                          ) : (
                            <span
                              className={`text-xs font-medium text-center ${
                                isWinner
                                  ? 'text-[#22c55e]'
                                  : isLoser
                                    ? 'text-[#ef4444]'
                                    : 'text-neutral-800'
                              }`}
                            >
                              {value}
                            </span>
                          )}
                          {isWinner && comparison.isDifferent && (
                            <Trophy className="w-3 h-3 text-[#22c55e] flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator - Mobile */}
      <div className="md:hidden flex justify-center gap-1 mt-3">
        {products.map((_, idx) => (
          <div
            key={idx}
            className="w-2 h-2 rounded-full bg-neutral-300"
          />
        ))}
      </div>
    </div>
  );
};

export default ComparisonTableV3;
