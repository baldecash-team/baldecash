'use client';

/**
 * ProductInfoHeaderV4 - Mobile Compact Layout
 *
 * Ultra-minimal design optimized for mobile.
 * Single column with swipeable spec pills.
 * No price section (shown in PricingCalculator).
 */

import React, { useRef } from 'react';
import { Star, ChevronRight, Cpu, MemoryStick, HardDrive, Monitor, Package } from 'lucide-react';
import { ProductInfoHeaderProps } from '../../../types/detail';

export const ProductInfoHeaderV4: React.FC<ProductInfoHeaderProps> = ({ product }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickSpecs = [
    { icon: Cpu, label: 'Ryzen 5', color: 'bg-amber-100 text-amber-700' },
    { icon: MemoryStick, label: '8GB RAM', color: 'bg-blue-100 text-blue-700' },
    { icon: HardDrive, label: '256GB SSD', color: 'bg-purple-100 text-purple-700' },
    { icon: Monitor, label: '15.6" FHD', color: 'bg-cyan-100 text-cyan-700' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Row: Brand + Stock */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#4654CD] text-white text-xs font-bold rounded-lg">
            {product.brand}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-neutral-700">{product.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg">
          <Package className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">{product.stock} disp.</span>
        </div>
      </div>

      {/* Product Name - Compact */}
      <h1 className="text-xl font-bold text-neutral-900 font-['Baloo_2'] leading-snug">
        {product.displayName}
      </h1>

      {/* Swipeable Specs Row */}
      <div className="relative -mx-4 px-4">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {quickSpecs.map((spec, idx) => {
            const Icon = spec.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0 ${spec.color}`}
                style={{ scrollSnapAlign: 'start' }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{spec.label}</span>
              </div>
            );
          })}

          {/* See More */}
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-100 text-neutral-600 flex-shrink-0 cursor-pointer hover:bg-neutral-200 transition-colors">
            <span className="text-sm font-medium">Más</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Fade indicator */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* Trust Row - Minimal */}
      <div className="flex items-center justify-center gap-6 py-2 text-neutral-500">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          <span className="text-xs">Garantía</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          <span className="text-xs">Envío gratis</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
          <span className="text-xs">Sin tarjeta</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoHeaderV4;
