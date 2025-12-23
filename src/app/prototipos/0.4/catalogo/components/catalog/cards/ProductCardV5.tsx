'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ShoppingCart, Heart, Cpu, MemoryStick, HardDrive, Monitor, Eye, GitCompare } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  CatalogProduct,
  ImageGalleryVersion,
  GallerySizeVersion,
  TagDisplayVersion,
  TermMonths,
  termOptions,
  PricingMode,
  InitialPaymentPercent,
  initialOptions,
  initialLabels,
  calculateQuotaWithInitial,
} from '../../../types/catalog';
import { ImageGallery } from '../ImageGallery';
import { ProductTags } from '../ProductTags';

interface ProductCardV5Props {
  product: CatalogProduct;
  onAddToCart?: () => void;
  onFavorite?: () => void;
  onViewDetail?: () => void;
  onMouseEnter?: () => void;
  isFavorite?: boolean;
  imageGalleryVersion?: ImageGalleryVersion;
  gallerySizeVersion?: GallerySizeVersion;
  tagDisplayVersion?: TagDisplayVersion;
  pricingMode?: PricingMode;
  defaultTerm?: TermMonths;
  defaultInitial?: InitialPaymentPercent;
  // Compare props
  onCompare?: () => void;
  isCompareSelected?: boolean;
  compareDisabled?: boolean;
}

const gamaLabels: Record<string, string> = {
  economica: 'Económica',
  estudiante: 'Estudiante',
  profesional: 'Profesional',
  creativa: 'Creativa',
  gamer: 'Gamer',
};

/**
 * ProductCardV5 - Split 50/50 (Horizontal)
 * Layout horizontal: imagen izquierda, info derecha
 * Ideal para grids con menos columnas (2-3)
 * Referencia: Webflow, Framer
 */
export const ProductCardV5: React.FC<ProductCardV5Props> = ({
  product,
  onAddToCart,
  onFavorite,
  onViewDetail,
  onMouseEnter,
  isFavorite = false,
  imageGalleryVersion = 1,
  gallerySizeVersion = 2,
  tagDisplayVersion = 1,
  pricingMode = 'interactive',
  defaultTerm = 24,
  defaultInitial = 10,
  onCompare,
  isCompareSelected = false,
  compareDisabled = false,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<TermMonths>(defaultTerm);
  const [selectedInitial, setSelectedInitial] = useState<InitialPaymentPercent>(defaultInitial);
  const { quota, initialAmount } = calculateQuotaWithInitial(product.price, selectedTerm, selectedInitial);

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
    >
      <Card className="h-full border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all">
        <CardBody className="p-0">
          <div className="grid grid-cols-2 h-full min-h-[280px]">
            {/* Left: Image */}
            <div className="relative bg-neutral-50 p-4">
              <ImageGallery
                images={[product.thumbnail, ...product.images.slice(0, 3)]}
                alt={product.displayName}
                version={imageGalleryVersion}
                sizeVersion={gallerySizeVersion}
              />

              {/* Product Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="absolute top-3 left-3 z-10">
                  <ProductTags tags={product.tags} version={tagDisplayVersion} />
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute bottom-3 left-3 flex gap-1">
                {/* Favorite */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite?.();
                  }}
                  className="p-2 rounded-full bg-white shadow-sm cursor-pointer hover:bg-[#4654CD]/10 hover:shadow-md transition-all"
                >
                  <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-[#4654CD] text-[#4654CD]' : 'text-neutral-400 hover:text-[#4654CD]'}`} />
                </button>
                {/* Compare */}
                {onCompare && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!compareDisabled || isCompareSelected) {
                        onCompare();
                      }
                    }}
                    disabled={compareDisabled && !isCompareSelected}
                    className={`p-2 rounded-full shadow-sm transition-all ${
                      isCompareSelected
                        ? 'bg-[#4654CD] text-white'
                        : compareDisabled
                          ? 'bg-white/50 text-neutral-300 cursor-not-allowed'
                          : 'bg-white hover:bg-[#4654CD]/10 cursor-pointer hover:shadow-md'
                    }`}
                    title={compareDisabled && !isCompareSelected ? 'Máximo 3 productos' : isCompareSelected ? 'Quitar de comparación' : 'Agregar a comparación'}
                  >
                    <GitCompare className={`w-4 h-4 transition-colors ${isCompareSelected ? 'text-white' : compareDisabled ? 'text-neutral-300' : 'text-neutral-400 hover:text-[#4654CD]'}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Info */}
            <div className="p-4 flex flex-col justify-between">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-neutral-400 uppercase tracking-wide">{product.brand}</p>
                  <Chip
                    size="sm"
                    radius="sm"
                    classNames={{
                      base: 'bg-neutral-100 px-2 py-0.5 h-auto',
                      content: 'text-neutral-600 text-[10px] font-medium',
                    }}
                  >
                    {gamaLabels[product.gama]}
                  </Chip>
                </div>

                <h3 className="font-semibold text-neutral-800 text-sm line-clamp-2 mb-3">
                  {product.displayName}
                </h3>

                {/* Specs grid 2x2 */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Cpu className="w-3 h-3 text-[#4654CD]" />
                    <span className="truncate">{product.specs.processor.model.split(' ').slice(-2).join(' ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <MemoryStick className="w-3 h-3 text-[#4654CD]" />
                    <span>{product.specs.ram.size}GB</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <HardDrive className="w-3 h-3 text-[#4654CD]" />
                    <span>{product.specs.storage.size}GB</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Monitor className="w-3 h-3 text-[#4654CD]" />
                    <span>{product.specs.display.size}"</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div>
                {/* Cuota y plazo */}
                <div className="border-t border-neutral-100 pt-3 mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-[#4654CD]">S/{quota}</span>
                    <span className="text-xs text-neutral-400">/mes</span>
                  </div>
                  <p className="text-[9px] text-neutral-500 mt-1 mb-1.5">
                    en {selectedTerm} meses
                    {selectedInitial > 0 && ` · inicial S/${initialAmount}`}
                  </p>
                  {pricingMode === 'interactive' && (
                    <div className="space-y-1.5">
                      {/* Selector de plazo */}
                      <div className="flex flex-wrap gap-1">
                        {termOptions.map((term) => (
                          <button
                            key={term}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTerm(term);
                            }}
                            className={`px-1.5 py-0.5 text-[9px] font-medium rounded cursor-pointer transition-all ${
                              selectedTerm === term
                                ? 'bg-[#4654CD] text-white'
                                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                            }`}
                          >
                            {term}m
                          </button>
                        ))}
                      </div>
                      {/* Selector de inicial */}
                      <div className="flex flex-wrap gap-1">
                        {initialOptions.map((initial) => {
                          const amount = Math.round(product.price * (initial / 100));
                          const label = initial === 0 ? 'Sin inicial' : `S/${amount}`;
                          return (
                            <button
                              key={initial}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInitial(initial);
                              }}
                              className={`px-1.5 py-0.5 text-[9px] font-medium rounded cursor-pointer transition-all ${
                                selectedInitial === initial
                                  ? 'bg-[#03DBD0] text-white'
                                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stock */}
                {product.stock === 'limited' && (
                  <p className="text-[11px] text-amber-600 mb-2 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-amber-500" />
                    Últimas unidades
                  </p>
                )}

                {/* CTAs - Vertical layout */}
                <div className="flex flex-col gap-1.5">
                  <Button
                    size="sm"
                    className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
                    startContent={<ShoppingCart className="w-3 h-3" />}
                    onPress={onAddToCart}
                  >
                    Lo quiero
                  </Button>
                  <Button
                    variant="bordered"
                    size="sm"
                    className="w-full border-[#4654CD] text-[#4654CD] font-medium cursor-pointer hover:bg-[#4654CD]/5"
                    startContent={<Eye className="w-3 h-3" />}
                    onPress={onViewDetail}
                  >
                    Detalle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
