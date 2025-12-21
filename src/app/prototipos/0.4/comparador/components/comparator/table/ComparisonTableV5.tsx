'use client';

import React from 'react';
import { Crown } from 'lucide-react';
import { ComparisonTableProps, ComparableSpec } from '../../../types/comparator';

/**
 * ComparisonTableV5 - Columna Resaltada
 * Winner column gets full highlight
 * Shadow and border emphasis
 * Clear visual winner
 */
export const ComparisonTableV5: React.FC<ComparisonTableProps> = ({
  products,
  specs,
  showOnlyDifferences,
  highlightVersion,
  config,
}) => {
  const filteredSpecs = showOnlyDifferences
    ? specs.filter(s => s.isDifferent)
    : specs;

  // Calculate overall winner (product with most wins)
  const winCounts = products.map((_, index) =>
    specs.filter(spec => spec.winner === index).length
  );
  const overallWinnerIndex = winCounts.indexOf(Math.max(...winCounts));

  const isColumnWinner = (index: number): boolean => {
    return index === overallWinnerIndex;
  };

  const getColumnStyle = (index: number): string => {
    if (isColumnWinner(index)) {
      return 'bg-gradient-to-b from-[#4654CD]/10 via-[#4654CD]/5 to-transparent border-l-4 border-r-4 border-[#4654CD]';
    }
    return '';
  };

  const getCellStyle = (spec: ComparableSpec, index: number): string => {
    if (!spec.isDifferent) return '';

    if (spec.winner === index) {
      return 'font-bold text-[#22c55e]';
    }

    const isWorst = spec.higherIsBetter
      ? spec.rawValues[index] === Math.min(...spec.rawValues)
      : spec.rawValues[index] === Math.max(...spec.rawValues);

    if (isWorst && spec.rawValues.filter(v => v === spec.rawValues[index]).length === 1) {
      return 'text-[#ef4444]';
    }

    return '';
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
      <table className="w-full border-separate border-spacing-0">
        {/* Header with product names */}
        <thead>
          <tr>
            <th className="p-4 text-left font-semibold text-neutral-700 border-b-2 border-neutral-200 bg-white sticky top-0 z-10 w-[200px]">
              Especificación
            </th>
            {products.map((product, index) => (
              <th
                key={product.id}
                className={`p-4 text-center font-semibold border-b-2 sticky top-0 z-10 ${
                  isColumnWinner(index)
                    ? 'bg-[#4654CD]/5 border-[#4654CD] text-[#4654CD] border-l-4 border-r-4'
                    : 'bg-white border-neutral-200'
                } ${index < products.length - 1 && !isColumnWinner(index) ? 'border-r border-neutral-100' : ''}`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isColumnWinner(index) && (
                    <Crown className="w-5 h-5 text-[#4654CD] fill-[#4654CD]" />
                  )}
                  <span className="text-sm truncate max-w-[150px]">{product.displayName}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredSpecs.map((spec, specIndex) => (
            <tr
              key={spec.key}
              className={`${specIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'} hover:bg-neutral-50 transition-colors cursor-pointer`}
            >
              {/* Spec label */}
              <td className="p-4 font-medium text-neutral-700 border-r border-neutral-200 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span>{spec.label}</span>
                  {spec.isDifferent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4654CD]" title="Diferente" />
                  )}
                </div>
              </td>

              {/* Product values */}
              {products.map((product, index) => (
                <td
                  key={`${product.id}-${spec.key}`}
                  className={`p-4 text-center border-b border-neutral-100 transition-all ${
                    getColumnStyle(index)
                  } ${index < products.length - 1 && !isColumnWinner(index) ? 'border-r border-neutral-100' : ''}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className={`font-medium ${getCellStyle(spec, index)}`}>
                      {spec.values[index]}
                    </span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Winner summary */}
      {overallWinnerIndex >= 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-[#4654CD]/10 to-transparent border-l-4 border-[#4654CD] rounded">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#4654CD] fill-[#4654CD]" />
            <span className="font-semibold text-[#4654CD]">
              Ganador general: {products[overallWinnerIndex].displayName}
            </span>
            <span className="text-sm text-neutral-600">
              ({winCounts[overallWinnerIndex]} ventajas)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
