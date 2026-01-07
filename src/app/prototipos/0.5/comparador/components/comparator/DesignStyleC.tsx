'use client';

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Trophy, Sparkles, ArrowRight, Check, X, Star, TrendingDown } from 'lucide-react';
import { ComparableSpec, ComparisonProduct, ComparatorConfig, calculatePriceDifference } from '../../types/comparator';

interface DesignStyleCProps {
  products: ComparisonProduct[];
  specs: ComparableSpec[];
  config: ComparatorConfig;
  showBestOption: boolean;
  bestProductIndex: number;
  onRemoveProduct: (productId: string) => void;
  onSelectProduct?: (productId: string) => void;
  priceDiff: ReturnType<typeof calculatePriceDifference>;
}

/**
 * DesignStyleC - Hero del Ganador
 * Mejor opción destacada arriba, tabla resumida abajo
 * Diseño orientado a la decisión con héroe visual
 * Referencia: Netflix winner selection, Kayak best option
 */
export const DesignStyleC: React.FC<DesignStyleCProps> = ({
  products,
  specs,
  config,
  showBestOption,
  bestProductIndex,
  onRemoveProduct,
  onSelectProduct,
  priceDiff,
}) => {
  const bestProduct = bestProductIndex >= 0 ? products[bestProductIndex] : products[0];
  const otherProducts = products.filter((_, index) => index !== bestProductIndex);

  // Get key specs (top 4 most relevant)
  const keySpecs = specs.slice(0, 4);

  // Count wins for a product
  const countWins = (productIndex: number): number => {
    return specs.filter(spec => spec.isDifferent && spec.winner === productIndex).length;
  };

  // Get winner icon
  const getWinnerIcon = (spec: ComparableSpec, productIndex: number) => {
    if (!spec.isDifferent || spec.winner !== productIndex) return null;

    if (config.highlightVersion === 1) {
      return <Trophy className="w-3.5 h-3.5 text-[#22c55e]" />;
    }
    return <Check className="w-3.5 h-3.5 text-[#4654CD]" />;
  };

  // Render price difference
  const renderPriceDiff = (index: number) => {
    const diff = priceDiff.quota[index];
    if (diff === 0) return null;

    if (config.priceDiffVersion === 1) {
      return <span className="text-xs text-red-500">+S/{diff}/mes</span>;
    }
    return <span className="text-xs text-red-500">+S/{diff * 12}/año</span>;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section - Best Product */}
      <Card className="border-2 border-[#22c55e] bg-gradient-to-br from-[#22c55e]/5 to-white overflow-hidden">
        <CardBody className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Hero Image & Badge */}
            <div className="relative md:w-1/3 p-6 flex flex-col items-center justify-center bg-[#22c55e]/5">
              {/* Winner crown badge */}
              <div className="absolute top-4 left-4 right-4 flex justify-center">
                <div className="bg-[#22c55e] text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <Trophy className="w-5 h-5" />
                  Mejor opción para ti
                </div>
              </div>

              {/* Product image */}
              <div className="mt-12 w-40 h-40 rounded-2xl bg-white shadow-md flex items-center justify-center p-4">
                <img
                  src={bestProduct.thumbnail}
                  alt={bestProduct.displayName}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Star rating decoration */}
              <div className="flex items-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#22c55e] text-[#22c55e]" />
                ))}
              </div>
            </div>

            {/* Hero Content */}
            <div className="md:w-2/3 p-6">
              {/* Product Info */}
              <div className="mb-4">
                <p className="text-sm text-neutral-500 mb-1">{bestProduct.brand}</p>
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">
                  {bestProduct.displayName}
                </h3>
                <p className="text-sm text-neutral-600">
                  La mejor relación precio-calidad basada en tus preferencias
                </p>
              </div>

              {/* Price highlight */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-[#22c55e]">
                  S/{bestProduct.quotaMonthly}
                </span>
                <span className="text-lg text-neutral-500">/mes</span>
                <div className="ml-2 px-3 py-1 bg-[#22c55e]/10 rounded-full">
                  <span className="text-sm font-semibold text-[#22c55e]">
                    {countWins(bestProductIndex)}/{specs.filter(s => s.isDifferent).length} ventajas
                  </span>
                </div>
              </div>

              {/* Key specs grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {keySpecs.map((spec) => {
                  const isWinner = spec.isDifferent && spec.winner === bestProductIndex;
                  return (
                    <div
                      key={spec.key}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        isWinner ? 'bg-[#22c55e]/10' : 'bg-neutral-50'
                      }`}
                    >
                      <span className="text-xs text-neutral-500">{spec.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${isWinner ? 'text-[#22c55e]' : 'text-neutral-700'}`}>
                          {spec.values[bestProductIndex]}
                        </span>
                        {isWinner && <Check className="w-3.5 h-3.5 text-[#22c55e]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="bg-[#22c55e] text-white cursor-pointer font-bold px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                onPress={() => onSelectProduct?.(bestProduct.id)}
                startContent={<Sparkles className="w-5 h-5" />}
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                Lo quiero
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Other Products - Compact Cards */}
      {otherProducts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
            Otras opciones
          </h4>

          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(otherProducts.length, 2)}, 1fr)` }}>
            {otherProducts.map((product) => {
              const originalIndex = products.findIndex(p => p.id === product.id);
              const isCheapest = priceDiff.quota[originalIndex] === 0;
              const wins = countWins(originalIndex);

              return (
                <Card
                  key={product.id}
                  className={`border border-neutral-200 hover:border-[#4654CD]/30 transition-all cursor-pointer group ${
                    showBestOption ? 'opacity-70' : ''
                  }`}
                >
                  <CardBody className="p-4">
                    <div className="flex gap-4">
                      {/* Product thumbnail */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveProduct(product.id);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-neutral-200 hover:bg-red-50 hover:border-red-200 flex items-center justify-center cursor-pointer transition-all z-10 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3 text-neutral-500 hover:text-red-500" />
                        </button>
                        <div className="w-20 h-20 rounded-xl bg-neutral-50 flex items-center justify-center p-2">
                          <img
                            src={product.thumbnail}
                            alt={product.displayName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="text-xs text-neutral-500">{product.brand}</p>
                            <p className="text-sm font-semibold text-neutral-800 line-clamp-1">
                              {product.displayName}
                            </p>
                          </div>

                          {/* Badge */}
                          {isCheapest ? (
                            <div className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] flex-shrink-0">
                              <TrendingDown className="w-3 h-3" />
                              Más barato
                            </div>
                          ) : wins > 0 ? (
                            <div className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                              {wins} {wins === 1 ? 'ventaja' : 'ventajas'}
                            </div>
                          ) : null}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-lg font-bold text-[#4654CD]">
                            S/{product.quotaMonthly}
                          </span>
                          <span className="text-xs text-neutral-500">/mes</span>
                          {renderPriceDiff(originalIndex)}
                        </div>

                        {/* Mini specs (top 2) */}
                        <div className="flex flex-wrap gap-2">
                          {keySpecs.slice(0, 2).map((spec) => {
                            const isWinner = spec.isDifferent && spec.winner === originalIndex;
                            return (
                              <div
                                key={spec.key}
                                className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md ${
                                  isWinner
                                    ? 'bg-[#22c55e]/10 text-[#22c55e]'
                                    : 'bg-neutral-100 text-neutral-600'
                                }`}
                              >
                                <span>{spec.values[originalIndex]}</span>
                                {getWinnerIcon(spec, originalIndex)}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="flex items-center">
                        <Button
                          size="sm"
                          variant="bordered"
                          className="border-neutral-200 cursor-pointer hover:bg-neutral-50"
                          onPress={() => onSelectProduct?.(product.id)}
                        >
                          Elegir
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Table (Condensed) */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 bg-white">
          <h4 className="text-sm font-semibold text-neutral-700">Comparación resumida</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="p-3 text-left text-xs font-medium text-neutral-500 w-[150px]">
                  Spec
                </th>
                {products.map((product, index) => (
                  <th
                    key={product.id}
                    className={`p-3 text-center text-xs font-medium ${
                      index === bestProductIndex ? 'text-[#22c55e] bg-[#22c55e]/5' : 'text-neutral-500'
                    }`}
                  >
                    {index === bestProductIndex && <Trophy className="w-3 h-3 inline mr-1" />}
                    {product.brand}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map((spec, specIndex) => (
                <tr
                  key={spec.key}
                  className={`${specIndex % 2 === 0 ? 'bg-white' : ''} border-b border-neutral-100 last:border-b-0`}
                >
                  <td className="p-3 text-xs text-neutral-600 font-medium">
                    {spec.label}
                  </td>
                  {products.map((product, index) => {
                    const isWinner = spec.isDifferent && spec.winner === index;
                    return (
                      <td
                        key={`${product.id}-${spec.key}`}
                        className={`p-3 text-center text-xs ${
                          index === bestProductIndex ? 'bg-[#22c55e]/5' : ''
                        } ${isWinner ? 'font-semibold text-[#22c55e]' : 'text-neutral-700'}`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {spec.values[index]}
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

        {/* Annual saving for priceDiffVersion V2 */}
        {config.priceDiffVersion === 2 && priceDiff.annualSaving > 0 && (
          <div className="p-3 bg-[#22c55e]/10 border-t border-[#22c55e]/20 text-center">
            <p className="text-xs text-neutral-600">Ahorro anual eligiendo el más económico:</p>
            <p className="text-lg font-bold text-[#22c55e]">S/{priceDiff.annualSaving}</p>
          </div>
        )}
      </div>
    </div>
  );
};
