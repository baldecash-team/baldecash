'use client';

/**
 * DifferenceHighlightV1 - Colores Semanticos
 *
 * Verde = mejor, Rojo = peor
 * Simple y directo, facil de entender
 */

import React from 'react';
import { SpecComparison } from '../../../types/comparator';

interface DifferenceHighlightV1Props {
  comparison: SpecComparison;
  productIndex: number;
}

export const DifferenceHighlightV1: React.FC<DifferenceHighlightV1Props> = ({
  comparison,
  productIndex,
}) => {
  const isWinner = comparison.winnerIndex === productIndex;
  const isLoser = comparison.loserIndex === productIndex;
  const value = comparison.formattedValues[productIndex];

  if (!comparison.isDifferent) {
    return (
      <span className="text-neutral-700">{value}</span>
    );
  }

  return (
    <span
      className={`font-medium ${
        isWinner
          ? 'text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded'
          : isLoser
            ? 'text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded'
            : 'text-neutral-700'
      }`}
    >
      {value}
    </span>
  );
};

export default DifferenceHighlightV1;
