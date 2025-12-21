'use client';

import React from 'react';
import { Crown, Check, X } from 'lucide-react';
import { ComparisonTableProps, ComparableSpec } from '../../../types/comparator';

/**
 * ComparisonTableV2 - Iconos Crown
 * Icons instead of colors: Crown/Trophy for winner, Check for good, X for worst
 * Clean minimal style
 */
export const ComparisonTableV2: React.FC<ComparisonTableProps> = ({
  products,
  specs,
  showOnlyDifferences,
  highlightVersion,
  config,
}) => {
  const filteredSpecs = showOnlyDifferences
    ? specs.filter(s => s.isDifferent)
    : specs;

  const getIcon = (spec: ComparableSpec, index: number) => {
    if (!spec.isDifferent) return null;

    // Winner gets Crown
    if (spec.winner === index) {
      return <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />;
    }

    // Check if this is the worst value
    const isWorst = spec.higherIsBetter
      ? spec.rawValues[index] === Math.min(...spec.rawValues)
      : spec.rawValues[index] === Math.max(...spec.rawValues);

    // Worst gets X
    if (isWorst && spec.rawValues.filter(v => v === spec.rawValues[index]).length === 1) {
      return <X className="w-5 h-5 text-[#ef4444]" />;
    }

    // Others get Check
    return <Check className="w-5 h-5 text-neutral-400" />;
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
              className={`${specIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'} border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors cursor-pointer`}
            >
              {/* Spec label */}
              <td className="p-4 font-medium text-neutral-700 border-r border-neutral-200 w-[200px]">
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
                  className={`p-4 text-center ${
                    index < products.length - 1 ? 'border-r border-neutral-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-medium text-neutral-800">{spec.values[index]}</span>
                    {getIcon(spec, index)}
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
