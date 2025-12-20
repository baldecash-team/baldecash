'use client';

/**
 * ProductInfoHeaderV1 - Layout Actual (Badges + Info vertical)
 *
 * Default layout with badges at top, brand, name, rating, and description
 * vertically stacked. This is the PREFERRED version from 0.3 feedback.
 */

import React from 'react';
import { Chip } from '@nextui-org/react';
import { Star, Monitor, Battery, Package, Sparkles } from 'lucide-react';
import { ProductInfoHeaderProps } from '../../../types/detail';

export const ProductInfoHeaderV1: React.FC<ProductInfoHeaderProps> = ({ product }) => {
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'os': return <Monitor className="w-3 h-3" />;
      case 'battery': return <Battery className="w-3 h-3" />;
      case 'stock': return <Package className="w-3 h-3" />;
      case 'promo': return <Sparkles className="w-3 h-3" />;
      default: return null;
    }
  };

  const getBadgeClasses = (variant?: string) => {
    switch (variant) {
      case 'primary': return 'bg-[#4654CD]/10 text-[#4654CD]';
      case 'success': return 'bg-[#22c55e]/10 text-[#22c55e]';
      case 'warning': return 'bg-amber-100 text-amber-700';
      case 'info':
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="space-y-3">
      {/* Badges Row */}
      <div className="flex flex-wrap gap-2">
        {product.badges.map((badge, index) => (
          <Chip
            key={index}
            size="sm"
            radius="sm"
            startContent={getBadgeIcon(badge.type)}
            classNames={{
              base: `${getBadgeClasses(badge.variant)} px-2.5 py-1 h-auto`,
              content: 'text-xs font-medium',
            }}
          >
            {badge.text}
          </Chip>
        ))}
      </div>

      {/* Brand */}
      <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
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
                  : i < product.rating
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-neutral-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-neutral-700">{product.rating}</span>
        <span className="text-sm text-neutral-500">({product.reviewCount} opiniones)</span>
      </div>

      {/* Short Description */}
      <p className="text-sm text-neutral-600 leading-relaxed">
        {product.shortDescription}
      </p>
    </div>
  );
};

export default ProductInfoHeaderV1;
