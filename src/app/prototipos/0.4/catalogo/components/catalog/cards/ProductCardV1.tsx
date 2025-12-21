'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ShoppingCart, Heart, Cpu, HardDrive, Monitor, MemoryStick, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  CatalogProduct,
  ImageGalleryVersion,
  GallerySizeVersion,
  TermMonths,
  termOptions,
  PricingMode,
  InitialPaymentPercent,
  initialOptions,
  initialLabels,
  calculateQuotaWithInitial,
} from '../../../types/catalog';
import { ImageGallery } from '../ImageGallery';

interface ProductCardV1Props {
  product: CatalogProduct;
  onAddToCart?: () => void;
  onFavorite?: () => void;
  onViewDetail?: () => void;
  onMouseEnter?: () => void;
  isFavorite?: boolean;
  imageGalleryVersion?: ImageGalleryVersion;
  gallerySizeVersion?: GallerySizeVersion;
  pricingMode?: PricingMode;
  defaultTerm?: TermMonths;
  defaultInitial?: InitialPaymentPercent;
}

const gamaColors: Record<string, { bg: string; text: string }> = {
  economica: { bg: 'bg-neutral-100', text: 'text-neutral-700' },
  estudiante: { bg: 'bg-blue-100', text: 'text-blue-700' },
  profesional: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  creativa: { bg: 'bg-purple-100', text: 'text-purple-700' },
  gamer: { bg: 'bg-red-100', text: 'text-red-700' },
};

const gamaLabels: Record<string, string> = {
  economica: 'Económica',
  estudiante: 'Estudiante',
  profesional: 'Profesional',
  creativa: 'Creativa',
  gamer: 'Gamer',
};

/**
 * ProductCardV1 - Enfoque Técnico
 * Muestra specs técnicas prominentemente (CPU, RAM, SSD, Pantalla)
 * GPU dedicada como badge verde si aplica
 * Referencia: Amazon, Best Buy, Mercado Libre
 */
export const ProductCardV1: React.FC<ProductCardV1Props> = ({
  product,
  onAddToCart,
  onFavorite,
  onViewDetail,
  onMouseEnter,
  isFavorite = false,
  imageGalleryVersion = 1,
  gallerySizeVersion = 2,
  pricingMode = 'interactive',
  defaultTerm = 24,
  defaultInitial = 10,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<TermMonths>(defaultTerm);
  const [selectedInitial, setSelectedInitial] = useState<InitialPaymentPercent>(defaultInitial);
  const gamaColor = gamaColors[product.gama] || gamaColors.economica;
  const { quota, initialAmount } = calculateQuotaWithInitial(product.price, selectedTerm, selectedInitial);

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
    >
      <Card className="h-full border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all">
        <CardBody className="p-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.isNew && (
              <Chip
                size="sm"
                radius="sm"
                classNames={{
                  base: 'bg-[#3b82f6] px-2 py-0.5 h-auto',
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
                  base: 'bg-[#ef4444] px-2 py-0.5 h-auto',
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

          {/* Image Gallery */}
          <div className="relative mb-4">
            <ImageGallery
              images={[product.thumbnail, ...product.images.slice(0, 3)]}
              alt={product.displayName}
              version={imageGalleryVersion}
              sizeVersion={gallerySizeVersion}
            />
            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.();
              }}
              className="absolute top-0 right-0 p-2 rounded-full bg-white/80 hover:bg-[#4654CD]/10 shadow-sm cursor-pointer transition-all z-10"
            >
              <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-[#4654CD] text-[#4654CD]' : 'text-neutral-400 hover:text-[#4654CD]'}`} />
            </button>
          </div>

          {/* Brand */}
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
            {product.brand}
          </p>

          {/* Title */}
          <h3 className="font-semibold text-neutral-800 text-sm line-clamp-2 mb-3 min-h-[40px]">
            {product.displayName}
          </h3>

          {/* Specs técnicas con iconos */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <Cpu className="w-3.5 h-3.5 text-[#4654CD]" />
              <span>{product.specs.processor.model}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <MemoryStick className="w-3.5 h-3.5 text-[#4654CD]" />
              <span>
                {product.specs.ram.size}GB {product.specs.ram.type}
                {product.specs.ram.expandable && (
                  <span className="text-[#22c55e] ml-1">(expandible)</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <HardDrive className="w-3.5 h-3.5 text-[#4654CD]" />
              <span>{product.specs.storage.size}GB {product.specs.storage.type}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <Monitor className="w-3.5 h-3.5 text-[#4654CD]" />
              <span>{product.specs.display.size}" {product.specs.display.resolution.toUpperCase()}</span>
            </div>
          </div>

          {/* GPU dedicada badge */}
          {product.specs.gpu.type === 'dedicated' && (
            <Chip
              size="sm"
              radius="sm"
              classNames={{
                base: 'bg-[#22c55e]/10 px-2 py-0.5 h-auto mb-3',
                content: 'text-[#22c55e] text-[10px] font-medium',
              }}
            >
              {product.specs.gpu.brand} {product.specs.gpu.model}
            </Chip>
          )}

          {/* Cuota mensual */}
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#4654CD]">
                S/{quota}
              </span>
              <span className="text-sm text-neutral-500">/mes</span>
            </div>
            {/* Info de plazo e inicial */}
            <p className="text-[11px] text-neutral-500 mt-1">
              en {selectedTerm} meses
              {selectedInitial > 0 && ` · inicial S/${initialAmount}`}
            </p>
          </div>

          {/* Modo interactivo: selectores de plazo e inicial */}
          {pricingMode === 'interactive' && (
            <div className="mb-4 space-y-2">
              {/* Selector de plazo */}
              <div>
                <p className="text-[10px] text-neutral-400 mb-1">Plazo:</p>
                <div className="flex flex-wrap gap-1">
                  {termOptions.map((term) => (
                    <button
                      key={term}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTerm(term);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-medium rounded cursor-pointer transition-all ${
                        selectedTerm === term
                          ? 'bg-[#4654CD] text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {term}m
                    </button>
                  ))}
                </div>
              </div>
              {/* Selector de inicial */}
              <div>
                <p className="text-[10px] text-neutral-400 mb-1">Inicial:</p>
                <div className="flex flex-wrap gap-1">
                  {initialOptions.map((initial) => (
                    <button
                      key={initial}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInitial(initial);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-medium rounded cursor-pointer transition-all ${
                        selectedInitial === initial
                          ? 'bg-[#4654CD] text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {initialLabels[initial]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stock indicator */}
          {product.stock === 'limited' && (
            <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Últimas {product.stockQuantity} unidades
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="bordered"
              size="sm"
              className="flex-1 border-[#4654CD] text-[#4654CD] font-medium cursor-pointer hover:bg-[#4654CD]/5"
              startContent={<Eye className="w-3.5 h-3.5" />}
              onPress={onViewDetail}
            >
              Detalle
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
              startContent={<ShoppingCart className="w-3.5 h-3.5" />}
              onPress={onAddToCart}
            >
              Lo quiero
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
