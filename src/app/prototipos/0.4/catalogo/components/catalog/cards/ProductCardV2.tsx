'use client';

/**
 * ProductCardV2 - Enfoque Beneficios
 *
 * Muestra beneficios y uso recomendado prominentemente
 * Ideal para: usuarios que no saben de specs tecnicas
 * Trade-off: usuarios tecnicos pueden querer mas detalle
 */

import React, { useState } from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Heart,
  GraduationCap,
  Gamepad2,
  Briefcase,
  Palette,
  Code2,
  Battery,
  Feather,
  Zap,
  Shield,
} from 'lucide-react';
import { CatalogProduct, UsageType } from '../../../types/catalog';
import { getGamaLabel, getGamaColor } from '../../../data/mockCatalogData';

interface ProductCardV2Props {
  product: CatalogProduct;
  index?: number;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

// Mapeo de uso a iconos
const usageIcons: Record<UsageType, React.ComponentType<{ className?: string }>> = {
  estudios: GraduationCap,
  gaming: Gamepad2,
  oficina: Briefcase,
  diseno: Palette,
  programacion: Code2,
};

// Beneficios genericos basados en specs
const getBenefits = (product: CatalogProduct): string[] => {
  const benefits: string[] = [];

  if (product.specs.ram >= 16) {
    benefits.push('Multitarea fluida');
  } else if (product.specs.ram >= 8) {
    benefits.push('Ideal para estudios');
  }

  if (product.specs.gpuType === 'dedicated') {
    benefits.push('Potencia para gaming');
  }

  if (product.specs.storage >= 512) {
    benefits.push('Amplio almacenamiento');
  }

  if (product.specs.displaySize >= 15) {
    benefits.push('Pantalla grande');
  } else if (product.specs.displaySize <= 14) {
    benefits.push('Liviana y portatil');
  }

  if (product.specs.touchScreen) {
    benefits.push('Pantalla tactil');
  }

  return benefits.slice(0, 3);
};

export const ProductCardV2: React.FC<ProductCardV2Props> = ({
  product,
  index = 0,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const benefits = getBenefits(product);

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
            </div>

            {/* Favorite Button */}
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

            {/* Usage Tags - V2 Focus */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.usage.slice(0, 3).map((use) => {
                const IconComponent = usageIcons[use];
                return (
                  <Chip
                    key={use}
                    size="sm"
                    radius="sm"
                    startContent={<IconComponent className="w-3 h-3" />}
                    classNames={{
                      base: 'bg-[#4654CD]/10 px-2 py-0.5 h-auto',
                      content: 'text-[#4654CD] text-xs font-medium capitalize',
                    }}
                  >
                    {use}
                  </Chip>
                );
              })}
            </div>

            {/* Benefits - V2 Focus */}
            <div className="space-y-1 mb-3">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-neutral-600"
                >
                  <div className="w-1 h-1 rounded-full bg-[#22c55e]" />
                  <span>{benefit}</span>
                </div>
              ))}
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

export default ProductCardV2;
