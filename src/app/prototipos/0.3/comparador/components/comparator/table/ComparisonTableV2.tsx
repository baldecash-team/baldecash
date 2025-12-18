'use client';

/**
 * ComparisonTableV2 - Cards Lado a Lado
 *
 * Productos como cards verticales con specs en lista
 * Mas visual y escaneable
 * Ideal para: comparaciones rapidas, mobile-friendly
 */

import React from 'react';
import { Card, CardBody, Chip, Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Trophy,
  X as XIcon,
  Check,
  Minus,
  Cpu,
  MemoryStick,
  Monitor,
  Keyboard,
  Cable,
  DollarSign,
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
  SpecComparison,
} from '../../../types/comparator';

interface ComparisonTableV2Props {
  products: ComparisonProduct[];
  config: ComparatorConfig;
  showOnlyDifferences: boolean;
  highlightWinners: boolean;
  onRemoveProduct?: (productId: string) => void;
}

const categoryIcons: Record<SpecCategory, React.ComponentType<{ className?: string }>> = {
  performance: Cpu,
  memory: MemoryStick,
  display: Monitor,
  features: Keyboard,
  connectivity: Cable,
  price: DollarSign,
};

export const ComparisonTableV2: React.FC<ComparisonTableV2Props> = ({
  products,
  config,
  showOnlyDifferences,
  highlightWinners,
  onRemoveProduct,
}) => {
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
    {} as Record<SpecCategory, SpecComparison[]>
  );

  // Count wins per product
  const winsPerProduct = products.map((_, idx) =>
    comparisons.filter((c) => c.winnerIndex === idx && c.isDifferent).length
  );

  const maxWins = Math.max(...winsPerProduct);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, productIdx) => {
        const isOverallWinner =
          highlightWinners &&
          winsPerProduct[productIdx] === maxWins &&
          maxWins > 0;

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: productIdx * 0.1 }}
          >
            <Card
              className={`border transition-all ${
                isOverallWinner
                  ? 'border-[#22c55e] ring-2 ring-[#22c55e]/20'
                  : 'border-neutral-200 hover:border-[#4654CD]/50'
              }`}
            >
              <CardBody className="p-0">
                {/* Product Header */}
                <div className="relative p-4 bg-neutral-50 border-b border-neutral-100">
                  {onRemoveProduct && (
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-neutral-200 hover:bg-[#ef4444] hover:border-[#ef4444] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label={`Quitar ${product.displayName}`}
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  )}

                  {isOverallWinner && (
                    <div className="absolute top-2 left-2">
                      <Chip
                        size="sm"
                        radius="sm"
                        startContent={<Trophy className="w-3 h-3" />}
                        classNames={{
                          base: 'bg-[#22c55e] px-2 py-0.5 h-auto',
                          content: 'text-white text-xs font-medium',
                        }}
                      >
                        Mejor opcion
                      </Chip>
                    </div>
                  )}

                  <div className="flex flex-col items-center pt-4">
                    <img
                      src={product.thumbnail}
                      alt={product.displayName}
                      className="w-24 h-24 object-contain mb-3 rounded-lg"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <p className="text-xs text-neutral-500 uppercase mb-1">
                      {product.brand}
                    </p>
                    <h3 className="font-semibold text-sm text-neutral-800 text-center line-clamp-2 mb-2">
                      {product.displayName}
                    </h3>
                    <Chip
                      size="sm"
                      radius="sm"
                      classNames={{
                        base: `${getGamaColor(product.gama)} px-2 py-0.5 h-auto mb-3`,
                        content: 'text-xs font-medium',
                      }}
                    >
                      {getGamaLabel(product.gama)}
                    </Chip>
                  </div>

                  {/* Price */}
                  <div className="text-center border-t border-neutral-200 pt-3 mt-2">
                    <p className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
                      S/{product.lowestQuota}
                      <span className="text-sm font-normal text-neutral-500">
                        /mes
                      </span>
                    </p>
                    <p className="text-xs text-neutral-500">
                      Total: S/{product.price.toLocaleString('es-PE')}
                    </p>
                    {product.discount && (
                      <Chip
                        size="sm"
                        radius="sm"
                        classNames={{
                          base: 'bg-[#ef4444] px-2 py-0.5 h-auto mt-1',
                          content: 'text-white text-xs font-medium',
                        }}
                      >
                        Ahorras S/{product.discount}
                      </Chip>
                    )}
                  </div>
                </div>

                {/* Specs by Category */}
                <div className="p-4 space-y-4">
                  {Object.entries(groupedComparisons).map(
                    ([category, specs]) => {
                      const CategoryIcon =
                        categoryIcons[category as SpecCategory];
                      const filteredSpecs = showOnlyDifferences
                        ? specs.filter((s) => s.isDifferent)
                        : specs;

                      if (filteredSpecs.length === 0) return null;

                      return (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-2">
                            <CategoryIcon className="w-4 h-4 text-[#4654CD]" />
                            <span className="text-xs font-semibold text-neutral-600 uppercase">
                              {getCategoryLabel(category as SpecCategory)}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {filteredSpecs.map((comparison) => {
                              const isWinner =
                                highlightWinners &&
                                comparison.winnerIndex === productIdx;
                              const isLoser =
                                highlightWinners &&
                                comparison.loserIndex === productIdx;
                              const value =
                                comparison.formattedValues[productIdx];
                              const rawValue = comparison.values[productIdx];

                              return (
                                <div
                                  key={comparison.spec.key}
                                  className={`flex justify-between items-center py-1 px-2 rounded ${
                                    isWinner
                                      ? 'bg-[#22c55e]/10'
                                      : isLoser
                                        ? 'bg-[#ef4444]/10'
                                        : ''
                                  }`}
                                >
                                  <span className="text-xs text-neutral-600">
                                    {comparison.spec.label}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {typeof rawValue === 'boolean' ? (
                                      rawValue ? (
                                        <Check className="w-4 h-4 text-[#22c55e]" />
                                      ) : (
                                        <Minus className="w-4 h-4 text-neutral-300" />
                                      )
                                    ) : (
                                      <span
                                        className={`text-xs font-medium ${
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
                                      <Trophy className="w-3 h-3 text-[#22c55e]" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Win Count */}
                {highlightWinners && (
                  <div className="px-4 pb-4">
                    <div className="bg-neutral-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-neutral-500 mb-1">
                        Ventajas sobre otros
                      </p>
                      <p className="text-lg font-bold text-[#4654CD]">
                        {winsPerProduct[productIdx]} de {comparisons.filter((c) => c.isDifferent).length}
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ComparisonTableV2;
