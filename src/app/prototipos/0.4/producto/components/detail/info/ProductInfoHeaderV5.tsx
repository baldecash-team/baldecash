'use client';

/**
 * ProductInfoHeaderV5 - Visual Price Comparator
 *
 * Focus on price comparison with visual context.
 * Shows savings relative to cash price, credit cards,
 * and competitors. Animated value propositions.
 */

import React, { useState } from 'react';
import { Star, TrendingDown, CreditCard, Banknote, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { ProductInfoHeaderProps } from '../../../types/detail';

export const ProductInfoHeaderV5: React.FC<ProductInfoHeaderProps> = ({ product }) => {
  const [selectedComparison, setSelectedComparison] = useState<'cash' | 'credit' | 'competitor'>('cash');

  // Mock comparison data
  const comparisons = {
    cash: {
      label: 'Precio contado',
      icon: Banknote,
      price: Math.round(product.lowestQuota * 36),
      monthly: Math.round((product.lowestQuota * 36) / 12),
      color: 'emerald',
    },
    credit: {
      label: 'Tarjeta de crédito',
      icon: CreditCard,
      price: Math.round(product.lowestQuota * 36 * 1.45),
      monthly: Math.round((product.lowestQuota * 36 * 1.45) / 36),
      color: 'red',
    },
    competitor: {
      label: 'Otra financiera',
      icon: ShoppingBag,
      price: Math.round(product.lowestQuota * 36 * 1.25),
      monthly: Math.round((product.lowestQuota * 36 * 1.25) / 36),
      color: 'amber',
    },
  };

  const selectedData = comparisons[selectedComparison];
  const savings = selectedData.monthly - product.lowestQuota;

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-[#4654CD]/10 text-[#4654CD] text-xs font-bold rounded">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm text-neutral-600">{product.rating}</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 font-['Baloo_2'] leading-snug max-w-md">
            {product.displayName}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-emerald-700">{product.stock} en stock</span>
        </div>
      </div>

      {/* Main Price Comparison */}
      <div className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl border border-neutral-200 overflow-hidden">
        {/* Tab Selector */}
        <div className="flex border-b border-neutral-200">
          {(Object.keys(comparisons) as Array<keyof typeof comparisons>).map((key) => {
            const comp = comparisons[key];
            const Icon = comp.icon;
            const isSelected = selectedComparison === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedComparison(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#4654CD] border-b-2 border-[#4654CD]'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{comp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Comparison Content */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Their Price */}
            <div className="p-4 bg-neutral-100 rounded-xl">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
                {selectedData.label}
              </p>
              <p className="text-2xl font-bold text-neutral-400 line-through">
                S/{selectedData.monthly}/mes
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Total: S/{selectedData.price.toLocaleString()}
              </p>
            </div>

            {/* BaldeCash Price */}
            <div className="p-4 bg-[#4654CD] rounded-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl" />
              <p className="text-xs text-white/70 uppercase tracking-wide mb-2">
                BaldeCash
              </p>
              <p className="text-2xl font-black relative z-10">
                S/{product.lowestQuota}/mes
              </p>
              <p className="text-xs text-white/70 mt-1">
                Total: S/{(product.lowestQuota * 36).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Savings Banner */}
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    Ahorras S/{savings}/mes
                  </p>
                  <p className="text-xs text-emerald-600">
                    S/{(savings * 36).toLocaleString()} en total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-emerald-600">
                  -{Math.round((savings / selectedData.monthly) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sin inicial', desc: 'Empieza hoy' },
          { label: 'Sin tarjeta', desc: 'Solo tu DNI' },
          { label: 'Cuota fija', desc: 'Sin sorpresas' },
        ].map((prop, idx) => (
          <div key={idx} className="p-3 bg-neutral-50 rounded-xl text-center border border-neutral-100">
            <div className="w-6 h-6 mx-auto mb-2 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-[#4654CD]" />
            </div>
            <p className="text-sm font-bold text-neutral-800">{prop.label}</p>
            <p className="text-[10px] text-neutral-500">{prop.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductInfoHeaderV5;
