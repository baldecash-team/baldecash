'use client';

import React from 'react';
import { Card, CardBody, CardHeader, CardFooter, Button } from '@nextui-org/react';
import { Trophy, TrendingDown, Check, X, ArrowRight, Cpu, HardDrive, Monitor, MemoryStick, Zap } from 'lucide-react';
import { ComparableSpec, ComparisonProduct, ComparatorConfig, calculatePriceDifference } from '../../types/comparator';
import { formatMoney } from '../../../utils/formatMoney';

interface DesignStyleBProps {
  products: ComparisonProduct[];
  specs: ComparableSpec[];
  config: ComparatorConfig;
  showBestOption: boolean;
  bestProductIndex: number;
  onRemoveProduct: (productId: string) => void;
  onSelectProduct?: (productId: string) => void;
  priceDiff: ReturnType<typeof calculatePriceDifference>;
}

// Icon mapping for specs
const specIcons: Record<string, React.FC<{ className?: string }>> = {
  processor: Cpu,
  ram: MemoryStick,
  storage: HardDrive,
  displaySize: Monitor,
  quota: Zap,
  resolution: Monitor,
  gpu: Cpu,
  battery: Zap,
  weight: Zap,
  price: Zap,
};

/**
 * DesignStyleB - Cards Lado a Lado
 * Cada producto en su propia card con specs internos
 * Diseño visual-first con comparación lado a lado
 * Referencia: Apple comparison, Notion cards
 */
export const DesignStyleB: React.FC<DesignStyleBProps> = ({
  products,
  specs,
  config,
  showBestOption,
  bestProductIndex,
  onRemoveProduct,
  onSelectProduct,
  priceDiff,
}) => {
  // Get winner status for a spec and product
  const isWinnerForSpec = (spec: ComparableSpec, index: number): boolean => {
    return spec.isDifferent && spec.winner === index;
  };

  // Get worst status for a spec and product
  const isWorstForSpec = (spec: ComparableSpec, index: number): boolean => {
    if (!spec.isDifferent) return false;
    const isWorst = spec.higherIsBetter
      ? spec.rawValues[index] === Math.min(...spec.rawValues)
      : spec.rawValues[index] === Math.max(...spec.rawValues);
    return isWorst && spec.rawValues.filter(v => v === spec.rawValues[index]).length === 1;
  };

  // Render price difference
  const renderPriceDiff = (index: number) => {
    const diff = priceDiff.quota[index];
    if (diff === 0) return null;

    if (config.priceDiffVersion === 1) {
      return <span className="text-xs text-red-500 ml-1">+S/{formatMoney(diff)}/mes</span>;
    }
    return <span className="text-xs text-red-500">+S/{formatMoney(diff * 12)}/año</span>;
  };

  // Count wins for a product
  const countWins = (productIndex: number): number => {
    return specs.filter(spec => isWinnerForSpec(spec, productIndex)).length;
  };

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
      {products.map((product, index) => {
        const isBest = showBestOption && index === bestProductIndex;
        const isCheapest = priceDiff.quota[index] === 0;
        const wins = countWins(index);

        return (
          <Card
            key={product.id}
            className={`relative transition-all duration-300 ${
              isBest
                ? 'border-2 border-[#22c55e] shadow-xl scale-[1.02]'
                : showBestOption
                ? 'opacity-70 scale-[0.98]'
                : 'border border-neutral-200 hover:border-[#4654CD]/30 hover:shadow-lg'
            }`}
          >
            {/* Remove button */}
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onPress={() => onRemoveProduct(product.id)}
              className="absolute top-3 right-3 w-7 h-7 min-w-7 rounded-full bg-white/80 backdrop-blur border border-neutral-200 hover:bg-red-50 hover:border-red-200 cursor-pointer z-10 shadow-sm"
            >
              <X className="w-4 h-4 text-neutral-500" />
            </Button>

            <CardHeader className="flex flex-col items-center gap-3 pt-6 pb-4">
              {/* Best badge */}
              {isBest && (
                <div className="bg-[#22c55e] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <Trophy className="w-4 h-4" />
                  Mejor opción
                </div>
              )}

              {/* Cheapest badge */}
              {!isBest && isCheapest && (
                <div className="bg-[#4654CD]/10 text-[#4654CD] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  Mejor precio
                </div>
              )}

              {/* Wins counter */}
              {!isBest && !isCheapest && wins > 0 && (
                <div className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">
                  {wins} {wins === 1 ? 'ventaja' : 'ventajas'}
                </div>
              )}

              {/* Product image */}
              <div className={`w-32 h-32 rounded-xl ${isBest ? 'bg-[#22c55e]/5' : 'bg-neutral-50'} flex items-center justify-center p-4`}>
                <img
                  src={product.thumbnail}
                  alt={product.displayName}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Product info */}
              <div className="text-center">
                <p className="text-sm text-neutral-500">{product.brand}</p>
                <p className="text-base font-semibold text-neutral-800 line-clamp-2">
                  {product.displayName}
                </p>
              </div>

              {/* Price */}
              <div className="text-center">
                <span className={`text-2xl font-bold ${isBest ? 'text-[#22c55e]' : 'text-[#4654CD]'}`}>
                  S/{formatMoney(product.quotaMonthly)}
                </span>
                <span className="text-sm font-normal text-neutral-500">/mes</span>
                {renderPriceDiff(index)}
              </div>
            </CardHeader>

            <CardBody className="px-4 py-3 border-t border-neutral-100">
              {/* Specs list */}
              <div className="space-y-2">
                {specs.map((spec) => {
                  const isWinner = isWinnerForSpec(spec, index);
                  const isWorst = config.highlightVersion === 1 && isWorstForSpec(spec, index);
                  const Icon = specIcons[spec.key] || Zap;

                  return (
                    <div
                      key={spec.key}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                        isWinner
                          ? config.highlightVersion === 1
                            ? 'bg-[#22c55e]/10'
                            : 'bg-[#4654CD]/5'
                          : isWorst
                          ? 'bg-red-50'
                          : 'bg-neutral-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${
                          isWinner ? 'text-[#22c55e]' : isWorst ? 'text-red-400' : 'text-neutral-400'
                        }`} />
                        <span className="text-xs text-neutral-500 truncate">{spec.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        <span className={`text-sm font-medium ${
                          isWinner
                            ? config.highlightVersion === 1 ? 'text-[#22c55e]' : 'text-[#4654CD]'
                            : isWorst
                            ? 'text-red-600'
                            : 'text-neutral-700'
                        }`}>
                          {spec.values[index]}
                        </span>
                        {isWinner && (
                          config.highlightVersion === 1
                            ? <Trophy className="w-3.5 h-3.5 text-[#22c55e]" />
                            : <Check className="w-3.5 h-3.5 text-[#4654CD]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* V2 highlight: progress bar for overall score */}
              {config.highlightVersion === 2 && (
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                    <span>Puntuación general</span>
                    <span className="font-medium text-[#4654CD]">{wins}/{specs.filter(s => s.isDifferent).length}</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4654CD] rounded-full transition-all"
                      style={{
                        width: specs.filter(s => s.isDifferent).length > 0
                          ? `${(wins / specs.filter(s => s.isDifferent).length) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              )}
            </CardBody>

            <CardFooter className="px-4 py-4 border-t border-neutral-100">
              <Button
                fullWidth
                className={`cursor-pointer font-semibold transition-all ${
                  isBest
                    ? 'bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-md hover:shadow-lg'
                    : 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
                }`}
                onPress={() => onSelectProduct?.(product.id)}
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                {isBest ? 'Elegir ganador' : 'Seleccionar'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
