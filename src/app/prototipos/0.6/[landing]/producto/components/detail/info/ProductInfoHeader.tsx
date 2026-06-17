'use client';

/**
 * ProductInfoHeader - Horizontal Split Layout (basado en V3)
 * Clean horizontal layout with brand emphasis, inline specs, and minimal visual noise.
 * Includes color selector below product name.
 */

import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { ProductInfoHeaderProps } from '../../../types/detail';
import { ColorSelector } from '../color-selector/ColorSelector';

export const ProductInfoHeader: React.FC<ProductInfoHeaderProps> = ({
  product,
  selectedColorId,
  onColorSelect,
}) => {
  return (
    <div className="bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border-soft,#e5e7eb)] overflow-hidden">
      {/* Top Section */}
      <div className="p-5">
        {/* Brand + Rating Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-lg">
              {product.brand}
            </span>
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-base font-bold text-[var(--text-strong,#1f2937)]">{product.rating}</span>
              <span className="text-sm text-[var(--text-faint,#9ca3af)]">({product.reviewCount})</span>
            </div>
          </div>

          </div>

        {/* Product Name */}
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-strong,#111827)] font-['Baloo_2',_sans-serif] leading-tight">
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
      <div className="px-5 py-4 bg-[var(--surface-bg,#fafafa)] border-t border-[var(--border-soft,#f3f4f6)]">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[var(--text-muted,#4b5563)]">Ryzen 5</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-[var(--surface-2,#e5e7eb)]" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[var(--text-muted,#4b5563)]">8GB RAM</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-[var(--surface-2,#e5e7eb)]" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[var(--text-muted,#4b5563)]">256GB SSD</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-[var(--surface-2,#e5e7eb)]" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-[var(--text-muted,#4b5563)]">15.6" FHD</span>
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
            className="w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0 flex items-center justify-center sm:justify-start gap-1 text-[var(--color-primary)] font-medium hover:underline cursor-pointer"
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
