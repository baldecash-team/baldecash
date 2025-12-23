'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ArrowRight, Heart, Eye, GitCompare, Cpu, MemoryStick, HardDrive, Monitor } from 'lucide-react';
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

interface ProductCardV6Props {
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
  showPricingOptions?: boolean;
  // Compare props
  onCompare?: () => void;
  isCompareSelected?: boolean;
  compareDisabled?: boolean;
}

/**
 * ProductCardV6 - Centrado (Impacto Máximo)
 * Todo centrado, cuota muy grande (text-4xl), CTA full-width prominente
 * Información mínima, enfoque en conversión
 * Referencia: Spotify, Apple Music, Netflix
 */
export const ProductCardV6: React.FC<ProductCardV6Props> = ({
  product,
  onAddToCart,
  onFavorite,
  onViewDetail,
  onMouseEnter,
  isFavorite = false,
  imageGalleryVersion = 1,
  gallerySizeVersion = 3, // Larger by default for impact
  tagDisplayVersion = 1,
  pricingMode = 'interactive',
  defaultTerm = 24,
  defaultInitial = 10,
  showPricingOptions = true,
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white">
        <CardBody className="p-0 flex flex-col">
          {/* Image - Larger */}
          <div className="relative bg-gradient-to-b from-neutral-50 to-white p-6">
            <ImageGallery
              images={[product.thumbnail, ...product.images.slice(0, 3)]}
              alt={product.displayName}
              version={imageGalleryVersion}
              sizeVersion={gallerySizeVersion}
            />

            {/* Action buttons - top right */}
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              {/* Favorite */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite?.();
                }}
                className="p-2.5 rounded-full bg-white/90 shadow-md cursor-pointer hover:bg-[#4654CD]/10 transition-all"
              >
                <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-[#4654CD] text-[#4654CD]' : 'text-neutral-300 hover:text-[#4654CD]'}`} />
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
                  className={`p-2.5 rounded-full shadow-md transition-all ${
                    isCompareSelected
                      ? 'bg-[#4654CD] text-white'
                      : compareDisabled
                        ? 'bg-white/50 text-neutral-300 cursor-not-allowed'
                        : 'bg-white/90 hover:bg-[#4654CD]/10 cursor-pointer'
                  }`}
                  title={compareDisabled && !isCompareSelected ? 'Máximo 3 productos' : isCompareSelected ? 'Quitar de comparación' : 'Agregar a comparación'}
                >
                  <GitCompare className={`w-5 h-5 transition-colors ${isCompareSelected ? 'text-white' : compareDisabled ? 'text-neutral-300' : 'text-neutral-300 hover:text-[#4654CD]'}`} />
                </button>
              )}
            </div>

            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="absolute top-3 left-3 z-10">
                <ProductTags tags={product.tags} version={tagDisplayVersion} />
              </div>
            )}
          </div>

          {/* Content - Centered */}
          <div className="p-5 text-center flex flex-col flex-1">
            {/* Brand */}
            <p className="text-xs text-[#4654CD] font-medium uppercase tracking-wider mb-2">
              {product.brand}
            </p>

            {/* Title */}
            <h3 className="font-bold text-neutral-800 text-lg line-clamp-2 mb-4">
              {product.displayName}
            </h3>

            {/* Specs técnicas con iconos (estilo V1) */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                <Cpu className="w-3.5 h-3.5 text-[#4654CD]" />
                <span>{product.specs.processor.model}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                <MemoryStick className="w-3.5 h-3.5 text-[#4654CD]" />
                <span>
                  {product.specs.ram.size}GB {product.specs.ram.type}
                  {product.specs.ram.expandable && (
                    <span className="text-[#22c55e] ml-1">(expandible)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                <HardDrive className="w-3.5 h-3.5 text-[#4654CD]" />
                <span>{product.specs.storage.size}GB {product.specs.storage.type.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                <Monitor className="w-3.5 h-3.5 text-[#4654CD]" />
                <span>{product.specs.display.size}" {product.specs.display.resolution.toUpperCase()}</span>
              </div>
            </div>

            {/* Giant Price */}
            <div className="bg-[#4654CD]/5 rounded-2xl py-4 px-6 mb-4">
              <p className="text-xs text-neutral-500 mb-1">Cuota mensual</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-[#4654CD]">
                  S/{quota}
                </span>
                <span className="text-lg text-neutral-400">/mes</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                en {selectedTerm} meses
                {selectedInitial > 0 && ` · inicial S/${initialAmount}`}
              </p>
              {/* Term and initial selectors - interactive mode */}
              {pricingMode === 'interactive' && showPricingOptions && (
                <div className="space-y-2 mt-3">
                  {/* Term selector */}
                  <div className="flex justify-center flex-wrap gap-1.5">
                    {termOptions.map((term) => (
                      <button
                        key={term}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTerm(term);
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-all ${
                          selectedTerm === term
                            ? 'bg-[#4654CD] text-white'
                            : 'bg-white text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {term}m
                      </button>
                    ))}
                  </div>
                  {/* Initial selector */}
                  <div className="flex justify-center flex-wrap gap-1.5">
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
                          className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-all ${
                            selectedInitial === initial
                              ? 'bg-[#03DBD0] text-white'
                              : 'bg-white text-neutral-600 hover:bg-neutral-100'
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
              <motion.p
                className="text-xs text-amber-600 mb-4 flex items-center justify-center gap-1"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Solo quedan {product.stockQuantity} unidades
              </motion.p>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* CTAs */}
            <div className="flex gap-2">
              <Button
                size="lg"
                variant="bordered"
                className="flex-1 border-[#4654CD] text-[#4654CD] font-bold cursor-pointer hover:bg-[#4654CD]/5 rounded-xl"
                startContent={<Eye className="w-5 h-5" />}
                onPress={onViewDetail}
              >
                Detalle
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-[#4654CD] text-white font-bold cursor-pointer hover:bg-[#3a47b3] rounded-xl"
                endContent={<ArrowRight className="w-5 h-5" />}
                onPress={onAddToCart}
              >
                Lo quiero
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
