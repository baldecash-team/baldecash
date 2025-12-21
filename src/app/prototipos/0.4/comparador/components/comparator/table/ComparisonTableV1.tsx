'use client';

import React from 'react';
import { Trophy, Check, X as XIcon } from 'lucide-react';
import { ComparisonTableProps, ComparableSpec } from '../../../types/comparator';

/**
 * ComparisonTableV1 - Tabla Tradicional
 * Verde = mejor, Rojo = peor (semántico clásico)
 * Referencia: Amazon, Best Buy, PCMag
 */
export const ComparisonTableV1: React.FC<ComparisonTableProps> = ({
  products,
  specs,
  showOnlyDifferences,
  highlightVersion,
  config,
}) => {
  const filteredSpecs = showOnlyDifferences
    ? specs.filter(s => s.isDifferent)
    : specs;

  const getWinnerStyle = (spec: ComparableSpec, index: number) => {
    if (!spec.isDifferent) return '';

    if (spec.winner === index) {
      return 'bg-[#22c55e]/10 text-[#22c55e]';
    }

    // Check if this is the worst value
    const isWorst = spec.higherIsBetter
      ? spec.rawValues[index] === Math.min(...spec.rawValues)
      : spec.rawValues[index] === Math.max(...spec.rawValues);

    if (isWorst && spec.rawValues.filter(v => v === spec.rawValues[index]).length === 1) {
      return 'bg-red-50 text-red-600';
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
      <table className="w-full">
        <tbody>
          {filteredSpecs.map((spec, specIndex) => (
            <tr
              key={spec.key}
              className={`${specIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} border-b border-neutral-100 last:border-b-0`}
            >
              {/* Spec label */}
              <td className="p-4 font-medium text-neutral-700 border-r border-neutral-200 w-[200px]">
                <div className="flex items-center gap-2">
                  <span>{spec.label}</span>
                  {spec.isDifferent && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" title="Diferente" />
                  )}
                </div>
              </td>

              {/* Product values */}
              {products.map((product, index) => (
                <td
                  key={`${product.id}-${spec.key}`}
                  className={`p-4 text-center transition-colors ${
                    getWinnerStyle(spec, index)
                  } ${index < products.length - 1 ? 'border-r border-neutral-100' : ''}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-medium">{spec.values[index]}</span>
                    {spec.winner === index && spec.isDifferent && (
                      <Trophy className="w-4 h-4 text-[#22c55e]" />
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
