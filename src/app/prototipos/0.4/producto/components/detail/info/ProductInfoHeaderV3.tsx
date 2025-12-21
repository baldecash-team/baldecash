'use client';

/**
 * ProductInfoHeaderV3 - Layout con Chips Flotantes
 *
 * Two-column layout with info on left and floating chips stacked on right.
 * Badges appear beside the product info for a more dynamic look.
 */

import React from 'react';
import { Chip } from '@nextui-org/react';
import { Star, Monitor, Battery, Package, CheckCircle } from 'lucide-react';
import { ProductInfoHeaderProps } from '../../../types/detail';

export const ProductInfoHeaderV3: React.FC<ProductInfoHeaderProps> = ({ product }) => {
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'os': return <CheckCircle className="w-3 h-3" />;
      case 'battery': return <Battery className="w-3 h-3" />;
      case 'stock': return <Package className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      {/* Left: Main Info */}
      <div className="space-y-2 flex-1">
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
                    : 'text-neutral-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-neutral-700">{product.rating}</span>
          <span className="text-sm text-neutral-500">({product.reviewCount} opiniones)</span>
        </div>
      </div>

      {/* Right: Floating Chips (visible on md+) */}
      <div className="hidden md:flex flex-col gap-2 items-end">
        {product.badges.map((badge, index) => (
          <Chip
            key={index}
            size="sm"
            radius="sm"
            startContent={getBadgeIcon(badge.type)}
            classNames={{
              base: 'bg-white border border-neutral-200 shadow-sm px-3 py-1.5 h-auto',
              content: 'text-xs font-medium text-neutral-700',
            }}
          >
            {badge.text}
          </Chip>
        ))}
      </div>

      {/* Mobile: Horizontal badges */}
      <div className="flex md:hidden flex-wrap gap-2">
        {product.badges.map((badge, index) => (
          <Chip
            key={index}
            size="sm"
            radius="sm"
            startContent={getBadgeIcon(badge.type)}
            classNames={{
              base: 'bg-neutral-100 px-2.5 py-1 h-auto',
              content: 'text-xs font-medium text-neutral-700',
            }}
          >
            {badge.text}
          </Chip>
        ))}
      </div>
    </div>
  );
};

export default ProductInfoHeaderV3;
