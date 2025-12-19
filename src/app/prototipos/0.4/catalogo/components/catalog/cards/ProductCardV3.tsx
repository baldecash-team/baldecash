'use client';

/**
 * ProductCardV3 - Enfoque Hibrido
 *
 * Combina 2 specs principales + 2 beneficios clave
 * Balance entre informacion tecnica y beneficios
 * Ideal para: la mayoria de usuarios
 */

import React, { useState } from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Cpu,
  MemoryStick,
  GraduationCap,
  Gamepad2,
  Briefcase,
  Palette,
  Code2,
  Check,
  Eye,
} from 'lucide-react';
import { CatalogProduct, UsageType } from '../../../types/catalog';
import { getGamaLabel, getGamaColor } from '../../../data/mockCatalogData';

interface ProductCardV3Props {
  product: CatalogProduct;
  index?: number;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  onCompare?: (productId: string) => void;
  isComparing?: boolean;
}

// Mapeo de uso a iconos
const usageIcons: Record<UsageType, React.ComponentType<{ className?: string }>> = {
  estudios: GraduationCap,
  gaming: Gamepad2,
  oficina: Briefcase,
  diseno: Palette,
  programacion: Code2,
};

// Beneficios clave basados en specs
const getKeyBenefits = (product: CatalogProduct): string[] => {
  const benefits: string[] = [];

  if (product.specs.gpuType === 'dedicated') {
    benefits.push('GPU dedicada');
  }
  if (product.specs.ramExpandable) {
    benefits.push('RAM expandible');
  }
  if (product.specs.touchScreen) {
    benefits.push('Pantalla tactil');
  }
  if (product.specs.backlitKeyboard) {
    benefits.push('Teclado iluminado');
  }
  if (product.specs.fingerprint) {
    benefits.push('Lector de huella');
  }

  return benefits.slice(0, 2);
};

export const ProductCardV3: React.FC<ProductCardV3Props> = ({
  product,
  index = 0,
  onToggleFavorite,
  isFavorite = false,
  onCompare,
  isComparing = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const keyBenefits = getKeyBenefits(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className="border border-neutral-200 hover:border-[#4654CD]/50 transition-all hover:shadow-md cursor-pointer group relative overflow-hidden"
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
                  Ultimas unidades
                </Chip>
              )}
            </div>

            {/* Action Buttons - Visible en hover */}
            <div
              className={`absolute top-2 right-2 flex flex-col gap-2 z-10 transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Favorite */}
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
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-neutral-50 transition-all cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFavorite
                      ? 'fill-[#ef4444] text-[#ef4444]'
                      : 'text-neutral-400 hover:text-[#4654CD]'
                  }`}
                />
              </div>

              {/* Compare */}
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare?.(product.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onCompare?.(product.id);
                  }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${
                  isComparing
                    ? 'bg-[#4654CD] text-white'
                    : 'bg-white text-neutral-400 hover:bg-neutral-50 hover:text-[#4654CD]'
                }`}
              >
                {isComparing ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </div>
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

            {/* Hover Overlay - Descripcion corta */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center p-4"
                >
                  <p className="text-white text-sm text-center">
                    Laptop ideal para {product.usage.slice(0, 2).join(' y ')}.
                    {product.specs.ram}GB RAM, {product.specs.storage}GB SSD.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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

            {/* Hybrid: 2 Specs + 2 Benefits */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Specs */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <Cpu className="w-3 h-3 text-[#4654CD]" />
                <span>{product.specs.processor.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <MemoryStick className="w-3 h-3 text-[#4654CD]" />
                <span>{product.specs.ram}GB RAM</span>
              </div>
            </div>

            {/* Key Benefits as Chips */}
            {keyBenefits.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {keyBenefits.map((benefit, idx) => (
                  <Chip
                    key={idx}
                    size="sm"
                    radius="sm"
                    classNames={{
                      base: 'bg-[#22c55e]/10 px-2 py-0.5 h-auto',
                      content: 'text-[#22c55e] text-xs font-medium',
                    }}
                  >
                    {benefit}
                  </Chip>
                ))}
              </div>
            )}

            {/* Usage Tags */}
            <div className="flex gap-1 mb-3">
              {product.usage.slice(0, 2).map((use) => {
                const IconComponent = usageIcons[use];
                return (
                  <div
                    key={use}
                    className="flex items-center gap-1 text-xs text-neutral-500"
                  >
                    <IconComponent className="w-3 h-3" />
                    <span className="capitalize">{use}</span>
                  </div>
                );
              })}
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
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ProductCardV3;
