'use client';

/**
 * ProductInfoHeaderV2 - Layout Compacto (Mobile-optimized)
 *
 * Compact layout optimized for mobile with inline brand and stock,
 * badges as small chips below name.
 */

import React from 'react';
import { Chip } from '@nextui-org/react';
import { Star, Monitor, Battery } from 'lucide-react';
import { ProductInfoHeaderProps } from '../../../types/detail';

export const ProductInfoHeaderV2: React.FC<ProductInfoHeaderProps> = ({ product }) => {
  // Only show OS and battery badges in this compact version
  const compactBadges = product.badges.filter(b => b.type === 'os' || b.type === 'battery');

  return (
    <div className="space-y-2">
      {/* Brand + Stock inline */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-neutral-700">{product.brand}</span>
        <span className="text-neutral-300">•</span>
        <span className="text-neutral-500">{product.stock} disponibles</span>
      </div>

      {/* Product Name */}
      <h1 className="text-lg font-bold text-neutral-900 font-['Baloo_2'] leading-snug">
        {product.displayName}
      </h1>

      {/* Compact Badges */}
      <div className="flex flex-wrap gap-1.5">
        {compactBadges.map((badge, index) => (
          <Chip
            key={index}
            size="sm"
            radius="sm"
            startContent={
              badge.type === 'os'
                ? <Monitor className="w-3 h-3" />
                : <Battery className="w-3 h-3" />
            }
            classNames={{
              base: 'bg-neutral-100 px-2 py-0.5 h-auto',
              content: 'text-xs text-neutral-600',
            }}
          >
            {badge.type === 'os' ? 'Windows 11' : badge.text.replace('Hasta ', '')}
          </Chip>
        ))}
      </div>

      {/* Rating - Compact */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.floor(product.rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-neutral-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-neutral-700">{product.rating}</span>
        <span className="text-xs text-neutral-500">({product.reviewCount})</span>
      </div>
    </div>
  );
};

export default ProductInfoHeaderV2;
