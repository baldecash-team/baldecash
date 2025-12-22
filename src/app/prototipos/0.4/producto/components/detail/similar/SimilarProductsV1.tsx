'use client';

/**
 * SimilarProductsV1 - Grid con Cards Premium
 *
 * Clean grid layout with premium card design,
 * quota difference highlighting, and smooth interactions.
 */

import React, { useState } from 'react';
import { ArrowRight, TrendingDown, TrendingUp, Sparkles, Check } from 'lucide-react';
import { SimilarProductsProps } from '../../../types/detail';

export const SimilarProductsV1: React.FC<SimilarProductsProps> = ({ products, currentQuota }) => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/200x200/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/prototipos/0.4/producto/${slug}`;
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Productos Similares</h3>
            <p className="text-sm text-neutral-500">Compara cuotas con tu selección actual</p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-neutral-100 rounded-full">
          <span className="text-sm font-medium text-neutral-600">Tu cuota: S/{currentQuota}/mes</span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const isCheaper = product.quotaDifference < 0;
          const isSelected = selectedProduct === product.id;

          return (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product.id)}
              className={`group relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? 'border-[#4654CD] shadow-lg shadow-[#4654CD]/10'
                  : 'border-neutral-200 hover:border-[#4654CD]/50'
              }`}
            >
              {/* Savings Badge */}
              {isCheaper && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-lg">
                  <TrendingDown className="w-3 h-3" />
                  <span>Ahorras S/{Math.abs(product.quotaDifference)}</span>
                </div>
              )}

              {/* Match Score */}
              <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-neutral-700 shadow">
                {product.matchScore}% similar
              </div>

              {/* Image */}
              <div className="aspect-square bg-neutral-100 overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={handleImageError}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-semibold text-neutral-800 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h4>

                {/* Quota Display */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-neutral-900">
                    S/{product.monthlyQuota}
                  </span>
                  <span className="text-sm text-neutral-500">/mes</span>
                </div>

                {/* Difference */}
                <div className={`flex items-center gap-1.5 mb-3 ${isCheaper ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isCheaper ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isCheaper ? '' : '+'}S/{Math.abs(product.quotaDifference)}/mes vs actual
                  </span>
                </div>

                {/* Differentiators */}
                <div className="space-y-1 mb-4">
                  {product.differentiators.slice(0, 2).map((diff, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-neutral-600">
                      <Check className="w-3 h-3 text-[#4654CD]" />
                      <span>{diff}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product.slug);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                    isCheaper
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
                  }`}
                >
                  {isCheaper ? 'Ahorra aquí' : 'Ver producto'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarProductsV1;
