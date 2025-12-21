'use client';

import React from 'react';
import { ComparisonTableProps, ComparableSpec } from '../../../types/comparator';

/**
 * ComparisonTableV3 - Barras Proporcionales
 * Progress bars showing relative values
 * Longer bar = better (or worse for price/weight)
 * Visual comparison at a glance
 */
export const ComparisonTableV3: React.FC<ComparisonTableProps> = ({
  products,
  specs,
  showOnlyDifferences,
  highlightVersion,
  config,
}) => {
  const filteredSpecs = showOnlyDifferences
    ? specs.filter(s => s.isDifferent)
    : specs;

  const getBarWidth = (spec: ComparableSpec, index: number): number => {
    const rawValue = spec.rawValues[index];
    const maxValue = Math.max(...spec.rawValues);
    const minValue = Math.min(...spec.rawValues);

    if (maxValue === minValue) return 100;

    // For specs where higher is better, normalize to max
    if (spec.higherIsBetter) {
      return (rawValue / maxValue) * 100;
    } else {
      // For specs where lower is better (price, weight), invert the scale
      return ((maxValue - rawValue) / (maxValue - minValue)) * 100;
    }
  };

  const getBarColor = (spec: ComparableSpec, index: number): string => {
    if (!spec.isDifferent) return '#d4d4d8'; // neutral-300

    if (spec.winner === index) {
      return '#22c55e'; // success green
    }

    const isWorst = spec.higherIsBetter
      ? spec.rawValues[index] === Math.min(...spec.rawValues)
      : spec.rawValues[index] === Math.max(...spec.rawValues);

    if (isWorst && spec.rawValues.filter(v => v === spec.rawValues[index]).length === 1) {
      return '#ef4444'; // error red
    }

    return '#4654CD'; // primary blue
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

              {/* Product values with progress bars */}
              {products.map((product, index) => (
                <td
                  key={`${product.id}-${spec.key}`}
                  className={`p-4 ${
                    index < products.length - 1 ? 'border-r border-neutral-100' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <span className="font-medium text-neutral-800 text-sm">
                      {spec.values[index]}
                    </span>
                    <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${getBarWidth(spec, index)}%`,
                          backgroundColor: getBarColor(spec, index),
                        }}
                      />
                    </div>
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
