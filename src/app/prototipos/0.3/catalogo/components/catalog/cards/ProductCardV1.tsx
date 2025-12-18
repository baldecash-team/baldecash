'use client';

/**
 * ProductCardV1 - Enfoque Tecnico
 *
 * Muestra specs tecnicas prominentemente (CPU, RAM, SSD, Pantalla)
 * Ideal para: usuarios que saben que buscan
 * Trade-off: puede abrumar a usuarios no tecnicos
 */

import React, { useState } from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Heart, Cpu, HardDrive, Monitor, MemoryStick, Gpu } from 'lucide-react';
import { CatalogProduct } from '../../../types/catalog';
import { getGamaLabel, getGamaColor } from '../../../data/mockCatalogData';

interface ProductCardV1Props {
  product: CatalogProduct;
  index?: number;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

export const ProductCardV1: React.FC<ProductCardV1Props> = ({
  product,
  index = 0,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className="border border-neutral-200 hover:border-[#4654CD]/50 transition-all hover:shadow-md cursor-pointer group"
        isPressable
      >
        <CardBody className="p-0">
          {/* Image Container */}
          <div className="relative aspect-[4/3] bg-neutral-50 p-4">
            {/* Badges - Esquina superior izquierda */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
              {product.isNew && (
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: 'bg-[#3b82f6] px-2.5 py-1 h-auto',
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
                    base: 'bg-[#ef4444] px-2.5 py-1 h-auto',
                    content: 'text-white text-xs font-medium',
                  }}
                >
                  Ahorras S/{product.discount}
                </Chip>
              )}
              {product.stock === 'limited' && (
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: 'bg-[#f59e0b] px-2.5 py-1 h-auto',
                    content: 'text-white text-xs font-medium',
                  }}
                >
                  Stock limitado
                </Chip>
              )}
            </div>

            {/* Favorite Button - Visible en hover */}
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(product.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onToggleFavorite?.(product.id);
                }
              }}
              className={`absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-neutral-50 transition-all cursor-pointer z-10 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite
                    ? 'fill-[#ef4444] text-[#ef4444]'
                    : 'text-neutral-400 group-hover:text-[#4654CD]'
                }`}
              />
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
            <h3 className="font-semibold text-neutral-800 text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
              {product.displayName}
            </h3>

            {/* Technical Specs - V1 Focus */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <Cpu className="w-3.5 h-3.5 text-[#4654CD]" />
                <span>{product.specs.processor}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <MemoryStick className="w-3.5 h-3.5 text-[#4654CD]" />
                <span>
                  {product.specs.ram}GB RAM
                  {product.specs.ramExpandable && (
                    <span className="text-[#22c55e] ml-1">(expandible)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <HardDrive className="w-3.5 h-3.5 text-[#4654CD]" />
                <span>
                  {product.specs.storage}GB {product.specs.storageType.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <Monitor className="w-3.5 h-3.5 text-[#4654CD]" />
                <span>
                  {product.specs.displaySize}&quot; {product.specs.resolution.toUpperCase()}
                </span>
              </div>
            </div>

            {/* GPU Badge - Solo si es dedicada */}
            {product.specs.gpuType === 'dedicated' && (
              <Chip
                size="sm"
                radius="sm"
                startContent={<Gpu className="w-3 h-3" />}
                classNames={{
                  base: 'bg-[#22c55e]/10 px-2 py-0.5 h-auto mb-3',
                  content: 'text-[#22c55e] text-xs font-medium',
                }}
              >
                {product.specs.gpu}
              </Chip>
            )}

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
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ProductCardV1;
