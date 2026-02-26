'use client';

import React from 'react';
import { Trophy, TrendingDown, Check, X } from 'lucide-react';
import { ComparableSpec, ComparisonProduct, ComparatorConfig, calculatePriceDifference, getDisplayQuota } from '../../types/comparator';
import { formatMoney } from '../../utils/formatMoney';

interface DesignStyleAProps {
  products: ComparisonProduct[];
  specs: ComparableSpec[];
  config: ComparatorConfig;
  showBestOption: boolean;
  bestProductIndex: number;
  onRemoveProduct: (productId: string) => void;
  priceDiff: ReturnType<typeof calculatePriceDifference>;
}

/**
 * DesignStyleA - Columnas Fijas
 * Productos como headers sticky, tabla vertical de specs
 * Referencia: Amazon, Best Buy comparison tables
 */
export const DesignStyleA: React.FC<DesignStyleAProps> = ({
  products,
  specs,
  config,
  showBestOption,
  bestProductIndex,
  onRemoveProduct,
  priceDiff,
}) => {
  const productColumnWidth = products.length > 0 ? `${(100 - 25) / products.length}%` : 'auto';

  // Get winner style based on highlightVersion
  const getWinnerStyle = (spec: ComparableSpec, index: number) => {
    if (!spec.isDifferent) return '';

    const isWinner = spec.winner === index;
    const isWorst = spec.higherIsBetter
      ? spec.rawValues[index] === Math.min(...spec.rawValues)
      : spec.rawValues[index] === Math.max(...spec.rawValues);
    const isOnlyWorst = isWorst && spec.rawValues.filter(v => v === spec.rawValues[index]).length === 1;

    if (config.highlightVersion === 1) {
      if (isWinner) return 'bg-[#22c55e]/10 text-[#22c55e]';
      if (isOnlyWorst) return 'bg-red-50 text-red-600';
    } else {
      if (isWinner) return 'bg-[rgba(var(--color-primary-rgb),0.05)]';
    }
    return '';
  };

  // Get winner icon
  const getWinnerIcon = (spec: ComparableSpec, index: number) => {
    if (!spec.isDifferent || spec.winner !== index) return null;

    if (config.highlightVersion === 1) {
      return <Trophy className="w-4 h-4 text-[#22c55e]" />;
    }
    return <Check className="w-4 h-4 text-[var(--color-primary)]" />;
  };

  // Render price difference
  const renderPriceDiff = (index: number) => {
    const diff = priceDiff.quota[index];
    if (diff === 0) return null;

    if (config.priceDiffVersion === 1) {
      return <span className="text-xs text-red-500 ml-1">+S/{formatMoney(diff)}</span>;
    }
    return <div className="text-xs text-red-500 mt-1">+S/{formatMoney(diff * 12)}/año</div>;
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {specs.length === 0 ? (
        <div className="p-8 text-center text-neutral-500">
          <p>No hay diferencias entre los productos seleccionados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            {/* Sticky Header with Products */}
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="border-b-2 border-neutral-200">
                <th className="p-4 text-left font-semibold text-neutral-600 border-r border-neutral-200 w-[200px] bg-neutral-50">
                  Especificación
                </th>
                {products.map((product, index) => {
                  const isBest = showBestOption && index === bestProductIndex;
                  const isCheapest = priceDiff.quota[index] === 0;
                  return (
                    <th
                      key={product.id}
                      style={{ width: productColumnWidth }}
                      className={`p-4 text-center relative group ${
                        isBest ? 'bg-[#22c55e]/5' : 'bg-white'
                      } ${index < products.length - 1 ? 'border-r border-neutral-100' : ''}`}
                    >
                      {/* Remove button */}
                      <button
                        onClick={() => onRemoveProduct(product.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-neutral-100 hover:bg-red-100 flex items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3 text-neutral-500 hover:text-red-500" />
                      </button>

                      <div className="flex flex-col items-center gap-2">
                        {/* Best badge */}
                        {isBest && (
                          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#22c55e] text-white">
                            <Trophy className="w-3 h-3" />
                            <span>Mejor opción</span>
                          </div>
                        )}

                        {/* Cheapest badge */}
                        {!isBest && isCheapest && (
                          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e]">
                            <TrendingDown className="w-3 h-3" />
                            <span>Mejor precio</span>
                          </div>
                        )}

                        {/* Product image */}
                        <div className={`w-20 h-20 rounded-lg border ${isBest ? 'border-[#22c55e]' : 'border-neutral-100'} flex items-center justify-center p-2 bg-white`}>
                          <img
                            src={product.thumbnail}
                            alt={product.displayName}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Product info */}
                        <div className="text-center">
                          <p className="text-xs text-neutral-500">{product.brand}</p>
                          <p className="text-sm font-semibold text-neutral-800 line-clamp-2 max-w-[140px]">
                            {product.displayName}
                          </p>
                          <div className="mt-1">
                            <span className={`font-bold text-base ${isBest ? 'text-[#22c55e]' : 'text-[var(--color-primary)]'}`}>
                              S/{formatMoney(getDisplayQuota(product))}
                            </span>
                            <span className="text-xs font-normal text-neutral-500">/mes</span>
                            {renderPriceDiff(index)}
                          </div>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Spec Rows */}
            <tbody>
              {specs.map((spec, specIndex) => (
                <tr
                  key={spec.key}
                  className={`${specIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'} border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors`}
                >
                  <td className="p-4 font-medium text-neutral-700 border-r border-neutral-200 w-[200px]">
                    <div className="flex items-center gap-2">
                      <span>{spec.label}</span>
                      {spec.isDifferent && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Diferente" />
                      )}
                    </div>
                  </td>
                  {products.map((product, index) => {
                    const isBest = showBestOption && index === bestProductIndex;
                    return (
                      <td
                        key={`${product.id}-${spec.key}`}
                        className={`p-4 text-center transition-colors ${
                          getWinnerStyle(spec, index)
                        } ${isBest && !getWinnerStyle(spec, index) ? 'bg-[#22c55e]/5' : ''} ${
                          index < products.length - 1 ? 'border-r border-neutral-100' : ''
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {/* V2: Barras Proporcionales */}
                          {config.highlightVersion === 2 && spec.isDifferent && (
                            <div className="w-full max-w-[80px] h-2 bg-neutral-200 rounded-full overflow-hidden mr-2">
                              <div
                                className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                                style={{
                                  width: `${(spec.rawValues[index] / Math.max(...spec.rawValues)) * 100}%`
                                }}
                              />
                            </div>
                          )}
                          <span className="font-medium">
                            {spec.values[index]}
                          </span>
                          {getWinnerIcon(spec, index)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Annual saving for priceDiffVersion V2 */}
      {config.priceDiffVersion === 2 && priceDiff.annualSaving > 0 && (
        <div className="p-4 bg-[#22c55e]/10 border-t border-[#22c55e]/20 text-center">
          <p className="text-sm text-neutral-600">Ahorro anual eligiendo el más económico:</p>
          <p className="text-2xl font-bold text-[#22c55e]">S/{formatMoney(priceDiff.annualSaving)}</p>
        </div>
      )}
    </div>
  );
};
