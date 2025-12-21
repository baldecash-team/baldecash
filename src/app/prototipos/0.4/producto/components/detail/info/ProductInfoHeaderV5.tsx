'use client';

/**
 * ProductInfoHeaderV5 - Layout Split (Info izquierda, badges derecha)
 *
 * Two-column desktop layout with info aligned left and badges
 * stacked on the right in a bordered container.
 */

import React from 'react';
import { Chip } from '@nextui-org/react';
import { Star, Monitor, Battery, Package } from 'lucide-react';
import { ProductInfoHeaderProps } from '../../../types/detail';

export const ProductInfoHeaderV5: React.FC<ProductInfoHeaderProps> = ({ product }) => {
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'os': return <Monitor className="w-4 h-4" />;
      case 'battery': return <Battery className="w-4 h-4" />;
      case 'stock': return <Package className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
      {/* Left Column: Main Info */}
      <div className="flex-1 space-y-3">
        {/* Brand */}
        <p className="text-sm font-semibold text-[#4654CD] uppercase tracking-wide">
          {product.brand}
        </p>

        {/* Product Name */}
        <h1 className="text-xl md:text-2xl font-bold text-neutral-900 font-['Baloo_2'] leading-tight">
          {product.displayName}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-neutral-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-neutral-700">{product.rating}</span>
          <span className="text-sm text-neutral-500">({product.reviewCount} opiniones)</span>
        </div>

        {/* Short Description - Desktop only */}
        <p className="hidden lg:block text-sm text-neutral-600 leading-relaxed">
          {product.shortDescription}
        </p>
      </div>

      {/* Right Column: Badges in bordered container */}
      <div className="lg:w-48 flex flex-row lg:flex-col gap-2 lg:gap-3">
        {product.badges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg"
          >
            <div className="text-[#4654CD]">
              {getBadgeIcon(badge.type)}
            </div>
            <span className="text-sm text-neutral-700 font-medium">
              {badge.text}
            </span>
          </div>
        ))}
      </div>

      {/* Short Description - Mobile only */}
      <p className="lg:hidden text-sm text-neutral-600 leading-relaxed">
        {product.shortDescription}
      </p>
    </div>
  );
};

export default ProductInfoHeaderV5;
