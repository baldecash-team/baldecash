'use client';

/**
 * ProductInfoHeader - Horizontal Split Layout (basado en V3)
 * Clean horizontal layout with brand emphasis, inline specs, and minimal visual noise.
 * Includes color selector below product name.
 */

import React from 'react';
import { Star, Package, ChevronRight } from 'lucide-react';
import { ProductInfoHeaderProps } from '../../../types/detail';
import { ColorSelector } from '../color-selector/ColorSelector';

export const ProductInfoHeader: React.FC<ProductInfoHeaderProps> = ({
  product,
  selectedColorId,
  onColorSelect,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      {/* Top Section */}
      <div className="p-5">
        {/* Brand + Rating Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-[#4654CD] text-white text-sm font-bold rounded-lg">
              {product.brand}
            </span>
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-base font-bold text-neutral-800">{product.rating}</span>
              <span className="text-sm text-neutral-400">({product.reviewCount})</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
            <Package className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">{product.stock} en stock</span>
          </div>
        </div>

        {/* Product Name */}
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 font-['Baloo_2'] leading-tight">
          {product.displayName}
        </h1>

        {/* Color Selector */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-4">
            <ColorSelector
              colors={product.colors}
              selectedColorId={selectedColorId}
              onColorSelect={onColorSelect}
            />
          </div>
        )}
      </div>

      {/* Specs Strip - Responsive */}
      <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-neutral-600">Ryzen 5</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-neutral-200" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-neutral-600">8GB RAM</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-neutral-200" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-neutral-600">256GB SSD</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-neutral-200" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-neutral-600">15.6" FHD</span>
          </div>

          <button
            onClick={() => {
              const element = document.getElementById('section-specs');
              if (element) {
                const offset = 120; // Navbar + promo banner offset
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                  top: elementPosition - offset,
                  behavior: 'smooth',
                });
              }
            }}
            className="w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0 flex items-center justify-center sm:justify-start gap-1 text-[#4654CD] font-medium hover:underline cursor-pointer"
          >
            <span>Ver todo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoHeader;
