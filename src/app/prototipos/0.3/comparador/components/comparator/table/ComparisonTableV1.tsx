'use client';

/**
 * ComparisonTableV1 - Tabla Tradicional
 *
 * Tabla clasica con filas (specs) y columnas (productos)
 * Header sticky con imagen y precio
 * Ideal para: desktop, comparaciones detalladas
 */

import React from 'react';
import { Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Trophy, X as XIcon, Check, Minus } from 'lucide-react';
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

interface ComparisonTableV1Props {
  products: ComparisonProduct[];
  config: ComparatorConfig;
  showOnlyDifferences: boolean;
  highlightWinners: boolean;
  onRemoveProduct?: (productId: string) => void;
}

export const ComparisonTableV1: React.FC<ComparisonTableV1Props> = ({
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

  const getCellStyle = (
    isWinner: boolean,
    isLoser: boolean,
    isDifferent: boolean
  ) => {
    if (!highlightWinners) return '';
    if (isWinner) return 'bg-[#22c55e]/10 text-[#22c55e]';
    if (isLoser) return 'bg-[#ef4444]/10 text-[#ef4444]';
    if (isDifferent && showOnlyDifferences) return 'bg-amber-50';
    return '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        {/* Header with product info */}
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-neutral-200">
            <th className="p-4 text-left bg-neutral-50 w-40 min-w-[160px]">
              <span className="text-sm font-semibold text-neutral-700">
                Comparando {products.length} productos
              </span>
            </th>
            {products.map((product, idx) => (
              <th
                key={product.id}
                className="p-4 text-center bg-neutral-50 min-w-[180px]"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  {onRemoveProduct && (
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-neutral-200 hover:bg-[#ef4444] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label={`Quitar ${product.displayName}`}
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  )}
                  <img
                    src={product.thumbnail}
                    alt={product.displayName}
                    className="w-20 h-20 mx-auto object-contain mb-2 rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <p className="text-xs text-neutral-500 uppercase mb-1">
                    {product.brand}
                  </p>
                  <p className="font-semibold text-sm text-neutral-800 line-clamp-2 mb-2">
                    {product.displayName}
                  </p>
                  <Chip
                    size="sm"
                    radius="sm"
                    classNames={{
                      base: `${getGamaColor(product.gama)} px-2 py-0.5 h-auto mb-2`,
                      content: 'text-xs font-medium',
                    }}
                  >
                    {getGamaLabel(product.gama)}
                  </Chip>
                  <p className="text-xl font-bold text-[#4654CD] font-['Baloo_2']">
                    S/{product.lowestQuota}
                    <span className="text-sm font-normal text-neutral-500">
                      /mes
                    </span>
                  </p>
                  <p className="text-xs text-neutral-500">
                    Total: S/{product.price.toLocaleString('es-PE')}
                  </p>
                </motion.div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body with specs */}
        <tbody>
          {Object.entries(filteredGroups).map(([category, specs]) => (
            <React.Fragment key={category}>
              {/* Category header */}
              <tr className="bg-neutral-100">
                <td
                  colSpan={products.length + 1}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 uppercase tracking-wide"
                >
                  {getCategoryLabel(category as SpecCategory)}
                </td>
              </tr>

              {/* Spec rows */}
              {specs.map((comparison, idx) => (
                <motion.tr
                  key={comparison.spec.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-neutral-100 hover:bg-neutral-50/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                    {comparison.spec.label}
                  </td>
                  {comparison.formattedValues.map((value, productIdx) => {
                    const isWinner =
                      highlightWinners &&
                      comparison.winnerIndex === productIdx;
                    const isLoser =
                      highlightWinners && comparison.loserIndex === productIdx;

                    return (
                      <td
                        key={productIdx}
                        className={`px-4 py-3 text-center text-sm transition-colors ${getCellStyle(isWinner, isLoser, comparison.isDifferent)}`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {typeof comparison.values[productIdx] === 'boolean' ? (
                            comparison.values[productIdx] ? (
                              <Check className="w-4 h-4 text-[#22c55e]" />
                            ) : (
                              <Minus className="w-4 h-4 text-neutral-300" />
                            )
                          ) : (
                            <span
                              className={`${isWinner ? 'font-semibold' : ''}`}
                            >
                              {value}
                            </span>
                          )}
                          {isWinner && comparison.isDifferent && (
                            <Trophy className="w-4 h-4 text-[#22c55e]" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTableV1;
