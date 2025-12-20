'use client';

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ShoppingCart, Heart, Cpu, HardDrive, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { CatalogProduct } from '../../types/catalog';

interface ProductCardProps {
  product: CatalogProduct;
  onAddToCart?: () => void;
  onFavorite?: () => void;
  onMouseEnter?: () => void;
}

const gamaColors: Record<string, { bg: string; text: string }> = {
  entry: { bg: 'bg-neutral-100', text: 'text-neutral-700' },
  media: { bg: 'bg-blue-100', text: 'text-blue-700' },
  alta: { bg: 'bg-[#4654CD]/10', text: 'text-[#4654CD]' },
  premium: { bg: 'bg-amber-100', text: 'text-amber-700' },
};

const gamaLabels: Record<string, string> = {
  entry: 'Básica',
  media: 'Recomendada',
  alta: 'Avanzada',
  premium: 'Premium',
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onFavorite,
  onMouseEnter,
}) => {
  const gamaColor = gamaColors[product.gama] || gamaColors.entry;

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
    >
      <Card className="h-full border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all cursor-pointer">
        <CardBody className="p-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.isNew && (
              <Chip
                size="sm"
                radius="sm"
                classNames={{
                  base: 'bg-[#4654CD] px-2 py-0.5 h-auto',
                  content: 'text-white text-[10px] font-medium',
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
                  base: 'bg-[#22c55e] px-2 py-0.5 h-auto',
                  content: 'text-white text-[10px] font-medium',
                }}
              >
                Ahorras S/{Math.floor(product.originalPrice! - product.price)}
              </Chip>
            )}
            <Chip
              size="sm"
              radius="sm"
              classNames={{
                base: `${gamaColor.bg} px-2 py-0.5 h-auto`,
                content: `${gamaColor.text} text-[10px] font-medium`,
              }}
            >
              {gamaLabels[product.gama]}
            </Chip>
          </div>

          {/* Image */}
          <div className="relative mb-4">
            <img
              src={product.thumbnail}
              alt={product.displayName}
              className="w-full h-40 object-contain"
              loading="lazy"
            />
            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.();
              }}
              className="absolute top-0 right-0 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm cursor-pointer transition-all"
            >
              <Heart className="w-4 h-4 text-neutral-400 hover:text-red-500" />
            </button>
          </div>

          {/* Brand */}
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
            {product.brand}
          </p>

          {/* Title */}
          <h3 className="font-semibold text-neutral-800 text-sm line-clamp-2 mb-2 min-h-[40px]">
            {product.displayName}
          </h3>

          {/* Specs Icons */}
          <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>{product.specs.processor.brand === 'intel' ? 'Intel' : 'AMD'}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              <span>{product.specs.ram.size}GB</span>
            </div>
            <div className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              <span>{product.specs.display.size}"</span>
            </div>
          </div>

          {/* Price - Cuota prominente */}
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#4654CD]">
                S/{product.quotaMonthly}
              </span>
              <span className="text-sm text-neutral-500">/mes</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              {product.originalPrice && (
                <span className="line-through">S/{product.originalPrice.toLocaleString()}</span>
              )}
              <span>Precio total: S/{product.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Stock indicator */}
          {product.stock === 'limited' && (
            <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Últimas unidades
            </p>
          )}
          {product.stock === 'on_demand' && (
            <p className="text-xs text-neutral-500 mb-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              Disponible por encargo
            </p>
          )}

          {/* Actions */}
          <Button
            className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] transition-colors"
            startContent={<ShoppingCart className="w-4 h-4" />}
            onPress={onAddToCart}
          >
            Lo quiero
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
};
