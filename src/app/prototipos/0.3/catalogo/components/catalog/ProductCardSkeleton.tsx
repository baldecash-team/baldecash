'use client';

/**
 * ProductCardSkeleton - Skeleton loading para tarjeta de producto
 *
 * Muestra placeholder animado con spinner centrado mientras cargan los productos
 */

import React from 'react';
import { Card, CardBody, Skeleton } from '@nextui-org/react';
import { Loader2 } from 'lucide-react';

interface ProductCardSkeletonProps {
  index?: number;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ index = 0 }) => {
  return (
    <Card
      className="border border-neutral-200 relative"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Centered Spinner Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/70 rounded-lg">
        <Loader2 className="w-10 h-10 text-[#4654CD] animate-spin" />
      </div>

      <CardBody className="p-0">
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-neutral-50 p-4">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand & Gama */}
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>

          {/* Product Name */}
          <Skeleton className="h-4 w-full rounded mb-1" />
          <Skeleton className="h-4 w-3/4 rounded mb-3" />

          {/* Quick Specs */}
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-3 w-14 rounded" />
            <Skeleton className="h-3 w-10 rounded" />
          </div>

          {/* Price */}
          <div className="border-t border-neutral-100 pt-3">
            <Skeleton className="h-8 w-24 rounded mb-1" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProductCardSkeleton;
