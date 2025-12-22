'use client';

/**
 * ProductInfoHeaderV2 - Hero Card con Gradiente
 *
 * Bold hero-style card with gradient background,
 * prominent branding, and floating badges.
 * No image - focused on product info only.
 */

import React from 'react';
import { Star, Shield, Truck, CreditCard, Zap, Package } from 'lucide-react';
import { ProductInfoHeaderProps } from '../../../types/detail';

export const ProductInfoHeaderV2: React.FC<ProductInfoHeaderProps> = ({ product }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4654CD] via-[#5B6AD9] to-[#7B88E5] p-6 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top Row: Brand + Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider rounded-full">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-300" />
              <span className="text-xs text-white/80">Verificado</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
            <Package className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-medium">{product.stock} disponibles</span>
          </div>
        </div>

        {/* Product Name */}
        <h1 className="text-2xl md:text-3xl font-bold font-['Baloo_2'] leading-tight mb-4">
          {product.displayName}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-amber-300 fill-amber-300'
                    : 'text-white/30'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-white/60">({product.reviewCount} opiniones)</span>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl">
            <Shield className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-medium">Garantía 1 año</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl">
            <Truck className="w-4 h-4 text-blue-300" />
            <span className="text-xs font-medium">Envío gratis</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl">
            <CreditCard className="w-4 h-4 text-purple-300" />
            <span className="text-xs font-medium">Sin tarjeta</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoHeaderV2;
