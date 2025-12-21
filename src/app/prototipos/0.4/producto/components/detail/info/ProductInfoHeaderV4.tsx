'use client';

/**
 * ProductInfoHeaderV4 - Layout Hero (Nombre prominente)
 *
 * Hero-style layout with large brand name, horizontal separator,
 * product name split into main and specs, and inline features.
 */

import React from 'react';
import { Star, Monitor, Battery, Package } from 'lucide-react';
import { ProductInfoHeaderProps } from '../../../types/detail';

export const ProductInfoHeaderV4: React.FC<ProductInfoHeaderProps> = ({ product }) => {
  // Extract key specs from display name if possible
  const mainName = product.displayName.split(' - ')[0] || product.displayName;
  const specsSuffix = product.displayName.split(' - ')[1] || '';

  return (
    <div className="space-y-4">
      {/* Brand - Large */}
      <h2 className="text-2xl md:text-3xl font-black text-[#4654CD] uppercase tracking-tight font-['Baloo_2']">
        {product.brand}
      </h2>

      {/* Separator */}
      <div className="h-0.5 bg-gradient-to-r from-[#4654CD] to-[#4654CD]/20 w-full" />

      {/* Product Name - Split */}
      <div className="space-y-1">
        <h1 className="text-lg md:text-xl font-bold text-neutral-900 leading-tight">
          {mainName}
        </h1>
        {specsSuffix && (
          <p className="text-sm text-neutral-600 font-medium">
            {specsSuffix}
          </p>
        )}
      </div>

      {/* Separator */}
      <div className="h-0.5 bg-gradient-to-r from-[#4654CD]/20 to-[#4654CD] w-full" />

      {/* Features Row - Compact */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-medium text-neutral-700">{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>

        <span className="text-neutral-300">|</span>

        {/* OS */}
        {product.hasOS && (
          <>
            <div className="flex items-center gap-1">
              <Monitor className="w-4 h-4 text-neutral-500" />
              <span>{product.osName}</span>
            </div>
            <span className="text-neutral-300">|</span>
          </>
        )}

        {/* Battery */}
        <div className="flex items-center gap-1">
          <Battery className="w-4 h-4 text-neutral-500" />
          <span>{product.batteryLife}</span>
        </div>

        <span className="text-neutral-300">|</span>

        {/* Stock */}
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-neutral-500" />
          <span>{product.stock} disp.</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoHeaderV4;
