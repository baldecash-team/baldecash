'use client';

/**
 * DifferenceHighlightV2 - Iconos Winner/Loser
 *
 * Corona para el mejor, X para el peor
 * Mas visual, gamificado
 */

import React from 'react';
import { Crown, XCircle, Check, Minus } from 'lucide-react';
import { SpecComparison } from '../../../types/comparator';

interface DifferenceHighlightV2Props {
  comparison: SpecComparison;
  productIndex: number;
  showLabel?: boolean;
}

export const DifferenceHighlightV2: React.FC<DifferenceHighlightV2Props> = ({
  comparison,
  productIndex,
  showLabel = true,
}) => {
  const isWinner = comparison.winnerIndex === productIndex;
  const isLoser = comparison.loserIndex === productIndex;
  const value = comparison.formattedValues[productIndex];
  const rawValue = comparison.values[productIndex];

  // For boolean values
  if (typeof rawValue === 'boolean') {
    return (
      <div className="flex items-center gap-1.5">
        {rawValue ? (
          <>
            <Check className="w-4 h-4 text-[#22c55e]" />
            {showLabel && <span className="text-[#22c55e] text-sm">Si</span>}
          </>
        ) : (
          <>
            <Minus className="w-4 h-4 text-neutral-300" />
            {showLabel && <span className="text-neutral-400 text-sm">No</span>}
          </>
        )}
        {isWinner && comparison.isDifferent && (
          <Crown className="w-4 h-4 text-amber-500" />
        )}
      </div>
    );
  }

  // For other values
  return (
    <div className="flex items-center gap-1.5">
      {isWinner && comparison.isDifferent && (
        <Crown className="w-4 h-4 text-amber-500" />
      )}
      <span
        className={`text-sm ${
          isWinner
            ? 'font-bold text-[#22c55e]'
            : isLoser
              ? 'text-[#ef4444]'
              : 'text-neutral-700'
        }`}
      >
        {value}
      </span>
      {isLoser && comparison.isDifferent && (
        <XCircle className="w-4 h-4 text-[#ef4444]/50" />
      )}
    </div>
  );
};

export default DifferenceHighlightV2;
