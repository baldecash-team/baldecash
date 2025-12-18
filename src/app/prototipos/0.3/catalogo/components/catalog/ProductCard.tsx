'use client';

/**
 * ProductCard - Tarjeta de producto del catalogo
 *
 * Placeholder para el PROMPT_03 (Catalogo Cards)
 * Muestra info basica del producto con cuota prominente
 */

import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Heart, Cpu, HardDrive, Monitor } from 'lucide-react';
import { CatalogProduct } from '../../types/catalog';
import { getGamaLabel, getGamaColor } from '../../data/mockCatalogData';

interface ProductCardProps {
  product: CatalogProduct;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className="border border-neutral-200 hover:border-[#4654CD]/50 transition-all hover:shadow-md cursor-pointer group"
        isPressable
      >
        <CardBody className="p-0">
          {/* Image Container */}
          <div className="relative aspect-[4/3] bg-neutral-50 p-4">
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
              {product.isNew && (
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: 'bg-[#4654CD] px-2.5 py-1 h-auto',
                    content: 'text-white text-xs font-medium',
                  }}
                >
                  Nuevo
                </Chip>
              )}
              {product.discount && (
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: 'bg-[#22c55e] px-2.5 py-1 h-auto',
                    content: 'text-white text-xs font-medium',
                  }}
                >
                  Ahorras S/{product.discount}
                </Chip>
              )}
            </div>

            {/* Favorite Button - Using div to avoid button nesting with isPressable Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                }
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-neutral-50 transition-colors cursor-pointer z-10"
            >
              <Heart className="w-4 h-4 text-neutral-400 group-hover:text-[#4654CD] transition-colors" />
            </div>

            {/* Product Image */}
            <img
              src={product.thumbnail}
              alt={product.displayName}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                const fallback = document.createElement('div');
                fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-300"><rect width="18" height="12" x="3" y="4" rx="2" ry="2"/><line x1="2" x2="22" y1="20" y2="20"/></svg>';
                target.parentElement?.appendChild(fallback);
              }}
            />
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Brand & Gama */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">
                {product.brand}
              </span>
              <Chip
                size="sm"
                radius="sm"
                classNames={{
                  base: `${getGamaColor(product.gama)} px-2 py-0.5 h-auto`,
                  content: 'text-xs font-medium',
                }}
              >
                {getGamaLabel(product.gama)}
              </Chip>
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-neutral-800 text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
              {product.displayName}
            </h3>

            {/* Quick Specs */}
            <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {product.specs.ram}GB
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {product.specs.storage}GB
              </span>
              <span className="flex items-center gap-1">
                <Monitor className="w-3 h-3" />
                {product.specs.displaySize}&quot;
              </span>
            </div>

            {/* Price - Cuota prominente */}
            <div className="border-t border-neutral-100 pt-3">
              <p className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
                S/{product.lowestQuota}
                <span className="text-sm font-normal text-neutral-500">/mes</span>
              </p>
              <p className="text-sm text-neutral-500">
                Precio total: S/{product.price.toLocaleString('es-PE')}
              </p>
            </div>

            {/* Stock Status */}
            {product.stock === 'limited' && (
              <p className="text-xs text-amber-600 mt-2">
                Quedan pocas unidades
              </p>
            )}
            {product.stock === 'on_demand' && (
              <p className="text-xs text-neutral-500 mt-2">
                Por encargo (7-10 dias)
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
