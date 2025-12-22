'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ArrowRight, Heart, Sparkles, Eye, GitCompare } from 'lucide-react';
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

interface ProductCardV4Props {
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

/**
 * ProductCardV4 - Abstracto Flotante (Fintech)
 * Elementos flotantes con micro-animaciones
 * Shapes geométricos sutiles, precio en badge flotante
 * Hover: elementos se elevan
 * Referencia: Nubank, Revolut
 */
export const ProductCardV4: React.FC<ProductCardV4Props> = ({
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={onMouseEnter}
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group bg-white">
        <CardBody className="p-0 relative overflow-hidden">
          {/* Decorative shapes - contained within overflow-hidden */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4654CD]/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-20 left-0 w-20 h-20 bg-[#03DBD0]/10 rounded-full -translate-x-1/2 pointer-events-none" />

          {/* Content */}
          <div className="relative p-5">
            {/* Top: Brand + Actions */}
            <div className="flex items-center justify-between mb-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-xs font-medium text-[#4654CD] uppercase tracking-wide">{product.brand}</p>
              </motion.div>
              <div className="flex items-center gap-1">
                {/* Compare button */}
                {onCompare && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!compareDisabled || isCompareSelected) {
                        onCompare();
                      }
                    }}
                    disabled={compareDisabled && !isCompareSelected}
                    className={`p-2 rounded-full transition-colors ${
                      isCompareSelected
                        ? 'bg-[#4654CD] text-white'
                        : compareDisabled
                          ? 'bg-neutral-50 text-neutral-200 cursor-not-allowed'
                          : 'bg-neutral-50 hover:bg-[#4654CD]/10 cursor-pointer'
                    }`}
                    whileHover={!compareDisabled || isCompareSelected ? { scale: 1.1 } : {}}
                    whileTap={!compareDisabled || isCompareSelected ? { scale: 0.95 } : {}}
                    title={compareDisabled && !isCompareSelected ? 'Máximo 3 productos' : isCompareSelected ? 'Quitar de comparación' : 'Agregar a comparación'}
                  >
                    <GitCompare className={`w-4 h-4 transition-colors ${isCompareSelected ? 'text-white' : compareDisabled ? 'text-neutral-200' : 'text-neutral-400 hover:text-[#4654CD]'}`} />
                  </motion.button>
                )}
                {/* Favorite button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite?.();
                  }}
                  className="p-2 rounded-full bg-neutral-50 hover:bg-[#4654CD]/10 cursor-pointer transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-[#4654CD] text-[#4654CD]' : 'text-neutral-400 hover:text-[#4654CD]'}`} />
                </motion.button>
              </div>
            </div>

            {/* Image */}
            <div className="relative mb-2">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <ImageGallery
                  images={[product.thumbnail, ...product.images.slice(0, 3)]}
                  alt={product.displayName}
                  version={imageGalleryVersion}
                  sizeVersion={gallerySizeVersion}
                />
              </motion.div>
            </div>

            {/* Price badge - below gallery */}
            <motion.div
              className="flex flex-col items-center mb-3"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-[#4654CD] text-white px-5 py-2 rounded-full shadow-lg shadow-[#4654CD]/30">
                <span className="text-lg font-bold">S/{quota}</span>
                <span className="text-xs opacity-80">/mes</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-2">
                en {selectedTerm} meses
                {selectedInitial > 0 && ` · inicial S/${initialAmount}`}
              </p>
            </motion.div>

            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <motion.div
                className="mb-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <ProductTags tags={product.tags} version={tagDisplayVersion} />
              </motion.div>
            )}

            {/* Title */}
            <motion.h3
              className="font-semibold text-neutral-800 text-base line-clamp-2 mb-2 min-h-[48px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {product.displayName}
            </motion.h3>

            {/* Quick specs - subtle */}
            <motion.p
              className="text-xs text-neutral-400 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {product.specs.processor.model} · {product.specs.ram.size}GB · {product.specs.storage.size}GB SSD
            </motion.p>

            {/* Term selector - interactive mode */}
            {pricingMode === 'interactive' && (
              <motion.div
                className="mb-4 p-3 bg-neutral-50 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <p className="text-[10px] text-neutral-400 mb-2">Elige tu plazo:</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {termOptions.map((term) => (
                    <button
                      key={term}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTerm(term);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg cursor-pointer transition-all ${
                        selectedTerm === term
                          ? 'bg-[#4654CD] text-white shadow-sm'
                          : 'bg-white text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {term}m
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400 mb-2">Inicial:</p>
                <div className="flex flex-wrap gap-1.5">
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
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg cursor-pointer transition-all ${
                          selectedInitial === initial
                            ? 'bg-[#03DBD0] text-white shadow-sm'
                            : 'bg-white text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Stock indicator */}
            {product.stock === 'limited' && (
              <motion.p
                className="text-xs text-amber-600 mb-3 flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-amber-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                Solo {product.stockQuantity} disponibles
              </motion.p>
            )}

            {/* CTAs */}
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                variant="bordered"
                className="flex-1 border-[#4654CD] text-[#4654CD] font-medium cursor-pointer hover:bg-[#4654CD]/5"
                startContent={<Eye className="w-4 h-4" />}
                onPress={onViewDetail}
              >
                Detalle
              </Button>
              <Button
                className="flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] group/btn"
                endContent={
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                }
                onPress={onAddToCart}
              >
                Lo quiero
              </Button>
            </motion.div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
