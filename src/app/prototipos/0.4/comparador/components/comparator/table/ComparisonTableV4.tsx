'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { ComparisonTableProps, ComparableSpec } from '../../../types/comparator';

/**
 * ComparisonTableV4 - Gradientes Fintech
 * Subtle gradients for winners
 * Floating badges
 * Smooth animations with framer-motion
 */
export const ComparisonTableV4: React.FC<ComparisonTableProps> = ({
  products,
  specs,
  showOnlyDifferences,
  highlightVersion,
  config,
}) => {
  const filteredSpecs = showOnlyDifferences
    ? specs.filter(s => s.isDifferent)
    : specs;

  const getCellGradient = (spec: ComparableSpec, index: number): string => {
    if (!spec.isDifferent) return '';

    if (spec.winner === index) {
      return 'bg-gradient-to-br from-[#22c55e]/10 via-[#22c55e]/5 to-transparent';
    }

    const isWorst = spec.higherIsBetter
      ? spec.rawValues[index] === Math.min(...spec.rawValues)
      : spec.rawValues[index] === Math.max(...spec.rawValues);

    if (isWorst && spec.rawValues.filter(v => v === spec.rawValues[index]).length === 1) {
      return 'bg-gradient-to-br from-[#ef4444]/10 via-[#ef4444]/5 to-transparent';
    }

    return 'bg-gradient-to-br from-[#4654CD]/5 via-transparent to-transparent';
  };

  if (filteredSpecs.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500">
        <p>No hay diferencias entre los productos seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <tbody>
          {filteredSpecs.map((spec, specIndex) => (
            <motion.tr
              key={spec.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: specIndex * 0.05 }}
              className={`${specIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50/30'} border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors cursor-pointer`}
            >
              {/* Spec label */}
              <td className="p-4 font-medium text-neutral-700 border-r border-neutral-200 w-[200px]">
                <div className="flex items-center gap-2">
                  <span>{spec.label}</span>
                  {spec.isDifferent && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-1.5 h-1.5 rounded-full bg-[#4654CD]"
                      title="Diferente"
                    />
                  )}
                </div>
              </td>

              {/* Product values with gradients */}
              {products.map((product, index) => (
                <td
                  key={`${product.id}-${spec.key}`}
                  className={`p-4 text-center relative ${
                    getCellGradient(spec, index)
                  } ${index < products.length - 1 ? 'border-r border-neutral-100' : ''}`}
                >
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <span className="font-semibold text-neutral-800">{spec.values[index]}</span>
                    {spec.winner === index && spec.isDifferent && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="absolute -top-1 -right-1 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-full p-1.5 shadow-lg shadow-[#22c55e]/30"
                      >
                        <Trophy className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </div>
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
