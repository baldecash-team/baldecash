'use client';

/**
 * SimilarProductsV3 - Comparison Table Layout
 *
 * Side-by-side comparison layout with emphasis on
 * quota differences and key differentiators.
 */

import React from 'react';
import { TrendingDown, TrendingUp, Award, ArrowRight, Percent } from 'lucide-react';
import { SimilarProductsProps } from '../../../types/detail';

export const SimilarProductsV3: React.FC<SimilarProductsProps> = ({ products, currentQuota }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/200x200/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/prototipos/0.4/producto/detail-preview?infoHeader=3&gallery=1&tabs=1&specs=2&pricing=4&cronograma=2&similar=2&limitations=6&certifications=1&mode=clean`;
    }
  };

  // Sort: cheaper products first
  const sortedProducts = [...products].sort((a, b) => a.quotaDifference - b.quotaDifference);
  const cheapest = sortedProducts[0];

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-1">Compara y Elige Mejor</h3>
          <p className="text-sm text-neutral-500">Ordenados por cuota mensual, de menor a mayor</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-xl">
          <span className="text-sm text-neutral-600">Tu cuota actual:</span>
          <span className="text-lg font-bold text-neutral-900">S/{currentQuota}/mes</span>
        </div>
      </div>

      {/* Best Deal Highlight */}
      {cheapest && cheapest.quotaDifference < 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-800">¡Mejor opción encontrada!</p>
              <p className="text-xs text-emerald-600">
                {cheapest.name} te ahorra S/{Math.abs(cheapest.quotaDifference)}/mes
              </p>
            </div>
            <button
              onClick={() => handleProductClick(cheapest.slug)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              Ver ahora
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-3">
        {sortedProducts.map((product, index) => {
          const isCheaper = product.quotaDifference < 0;
          const isBest = index === 0 && isCheaper;

          return (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.slug)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                isBest
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-neutral-200 hover:border-[#4654CD]/30 bg-white'
              }`}
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                isBest ? 'bg-emerald-500 text-white' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {index + 1}
              </div>

              {/* Image */}
              <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-neutral-800 text-sm truncate mb-1">
                  {product.name}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {product.differentiators.slice(0, 2).map((diff, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full"
                    >
                      {diff}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match Score */}
              <div className="hidden md:flex flex-col items-center px-4">
                <div className="flex items-center gap-1">
                  <Percent className="w-3 h-3 text-[#4654CD]" />
                  <span className="text-sm font-bold text-[#4654CD]">{product.matchScore}%</span>
                </div>
                <span className="text-[10px] text-neutral-500">similar</span>
              </div>

              {/* Quota & Difference */}
              <div className="text-right">
                <p className="text-xl font-bold text-neutral-900">
                  S/{product.monthlyQuota}<span className="text-sm font-normal text-neutral-500">/mes</span>
                </p>
                <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
                  isCheaper ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {isCheaper ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  <span>{isCheaper ? '' : '+'}S/{Math.abs(product.quotaDifference)}</span>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-5 h-5 text-neutral-400" />
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            Mostrando {products.length} productos similares
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <TrendingDown className="w-4 h-4" />
              Menor cuota
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <TrendingUp className="w-4 h-4" />
              Mayor cuota
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarProductsV3;
