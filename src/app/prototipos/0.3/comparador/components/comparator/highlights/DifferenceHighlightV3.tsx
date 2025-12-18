'use client';

/**
 * DifferenceHighlightV3 - Barras Comparativas
 *
 * Barras proporcionales que muestran diferencia visual
 * Mas largo = mejor (o peor para precio)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import { SpecComparison } from '../../../types/comparator';

interface DifferenceHighlightV3Props {
  comparison: SpecComparison;
  productIndex: number;
  showValue?: boolean;
  animate?: boolean;
}

export const DifferenceHighlightV3: React.FC<DifferenceHighlightV3Props> = ({
  comparison,
  productIndex,
  showValue = true,
  animate = true,
}) => {
  const isWinner = comparison.winnerIndex === productIndex;
  const isLoser = comparison.loserIndex === productIndex;
  const value = comparison.formattedValues[productIndex];
  const rawValue = comparison.values[productIndex];
  const rawNumericValue = comparison.rawValues[productIndex];

  // For boolean values, use simple check/minus
  if (typeof rawValue === 'boolean') {
    return (
      <div className="flex items-center gap-2">
        {rawValue ? (
          <div className="flex items-center gap-1.5">
            <div className="w-full max-w-[60px] h-2 rounded-full bg-[#22c55e]" />
            <Check className="w-4 h-4 text-[#22c55e]" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 rounded-full bg-neutral-200" />
            <Minus className="w-4 h-4 text-neutral-300" />
          </div>
        )}
      </div>
    );
  }

  // Calculate percentage for bar width
  const maxValue = Math.max(...comparison.rawValues);
  const minValue = Math.min(...comparison.rawValues);

  let percentage: number;
  if (maxValue === minValue) {
    percentage = 100;
  } else if (comparison.spec.higherIsBetter) {
    // Higher is better: normalize to 0-100 where max = 100
    percentage = ((rawNumericValue - minValue) / (maxValue - minValue)) * 100;
  } else {
    // Lower is better (like price): invert so lowest = 100%
    percentage = ((maxValue - rawNumericValue) / (maxValue - minValue)) * 100;
  }

  // Ensure minimum visible width
  percentage = Math.max(percentage, 20);

  const barColor = isWinner
    ? 'bg-[#22c55e]'
    : isLoser
      ? 'bg-[#ef4444]'
      : 'bg-[#4654CD]';

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
        {animate ? (
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      {showValue && (
        <span
          className={`text-xs font-medium min-w-[60px] text-right ${
            isWinner
              ? 'text-[#22c55e]'
              : isLoser
                ? 'text-[#ef4444]'
                : 'text-neutral-700'
          }`}
        >
          {value}
        </span>
      )}
    </div>
  );
};

export default DifferenceHighlightV3;
