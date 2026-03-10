'use client';

/**
 * ProductCard v0.6 - Basado en ProductCardV6 de v0.4
 * Configuración fija con la única variable siendo el ColorSelector
 * Layout: Centrado Impacto (cuota gigante, CTA full-width)
 * Referencia: Spotify, Apple Music, Netflix
 */

import React, { useState } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { ArrowRight, Heart, Eye, GitCompare, Cpu, MemoryStick, HardDrive, Monitor, Check, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  CatalogProduct,
  ColorSelectorVersion,
} from '../../../types/catalog';
import { ImageGallery } from '../ImageGallery';
import { ProductTags } from '../ProductTags';
import { ColorSelector } from '../color-selector';
import { formatMoneyNoDecimals } from '../../../utils/formatMoney';

interface ProductCardProps {
  product: CatalogProduct;
  onAddToCart?: () => void;
  onFavorite?: () => void;
  onViewDetail?: () => void;
  onMouseEnter?: () => void;
  isFavorite?: boolean;
  colorSelectorVersion?: ColorSelectorVersion;
  // Compare props
  onCompare?: () => void;
  isCompareSelected?: boolean;
  compareDisabled?: boolean;
  // Cart state
  isInCart?: boolean;
  // Onboarding IDs (optional, only for first card)
  favoriteButtonId?: string;
  compareButtonId?: string;
  detailButtonId?: string;
  addToCartButtonId?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onFavorite,
  onViewDetail,
  onMouseEnter,
  isFavorite = false,
  colorSelectorVersion = 1,
  onCompare,
  isCompareSelected = false,
  compareDisabled = false,
  isInCart = false,
  favoriteButtonId,
  compareButtonId,
  detailButtonId,
  addToCartButtonId,
}) => {
  // Color selector state — default to current product's ID if it's in the siblings
  const currentProductColor = product.colors?.find(c => c.productId === product.id);
  const [selectedColorId, setSelectedColorId] = useState<string>(
    currentProductColor?.id || product.colors?.[0]?.id || ''
  );

  // Get the selected color sibling data
  const selectedColor = product.colors?.find(c => c.id === selectedColorId);

  // Override card data when a different color sibling is selected
  const displayName = selectedColor?.displayName || product.displayName;
  const displayPrice = selectedColor?.price ?? product.price;
  const displayQuota = selectedColor?.quotaMonthly ?? product.quotaMonthly;
  const displayOriginalQuota = selectedColor?.originalQuotaMonthly ?? product.originalQuotaMonthly ?? null;
  const displayDiscount = selectedColor?.discount ?? product.discount;
  const displaySpecs = selectedColor?.specs ?? product.specs;

  // Obtener imágenes según color seleccionado (para carousel)
  const getImagesForSelectedColor = (): string[] => {
    if (!selectedColorId || !product.colors) {
      return [...new Set([product.thumbnail, ...product.images])];
    }
    if (selectedColor?.images && selectedColor.images.length > 0) {
      return [...new Set(selectedColor.images)];
    }
    if (selectedColor?.imageUrl) {
      return [selectedColor.imageUrl];
    }
    return [product.thumbnail];
  };

  const selectedImages = getImagesForSelectedColor();

  const selectedTerm = 24;
  const selectedInitial = 0;
  const quota = displayQuota;
  const initialAmount = Math.floor(displayPrice * (selectedInitial / 100));

  const originalQuota = displayOriginalQuota;

  return (
    <motion.div
      className="h-full w-full min-w-[min(305px,100%)] max-w-[398px]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white">
        <CardBody className="p-0 flex flex-col">
          {/* Image - Altura fija para consistencia */}
          <div className="relative bg-gradient-to-b from-neutral-50 to-white p-6 h-[220px] flex items-center justify-center">
            <ImageGallery
              images={selectedImages}
              alt={displayName}
            />

            {/* Action buttons - top right */}
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              {/* Favorite */}
              <button
                id={favoriteButtonId}
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite?.();
                }}
                className="p-2.5 rounded-full bg-white/90 shadow-md cursor-pointer hover:bg-[rgba(var(--color-primary-rgb),0.1)] transition-all"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorite
                      ? 'fill-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'text-neutral-300 hover:text-[var(--color-primary)]'
                  }`}
                />
              </button>
              {/* Compare */}
              {onCompare && (
                <button
                  id={compareButtonId}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!compareDisabled || isCompareSelected) {
                      onCompare();
                    }
                  }}
                  disabled={compareDisabled && !isCompareSelected}
                  className={`p-2.5 rounded-full shadow-md transition-all ${
                    isCompareSelected
                      ? 'bg-[var(--color-primary)] text-white cursor-pointer hover:brightness-90'
                      : compareDisabled
                        ? 'bg-white/50 text-neutral-300 cursor-not-allowed'
                        : 'bg-white/90 hover:bg-[rgba(var(--color-primary-rgb),0.1)] cursor-pointer'
                  }`}
                  title={
                    compareDisabled && !isCompareSelected
                      ? 'Máximo 3 productos'
                      : isCompareSelected
                        ? 'Quitar de comparación'
                        : 'Agregar a comparación'
                  }
                >
                  <GitCompare
                    className={`w-5 h-5 transition-colors ${
                      isCompareSelected
                        ? 'text-white'
                        : compareDisabled
                          ? 'text-neutral-300'
                          : 'text-neutral-300 hover:text-[var(--color-primary)]'
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="absolute top-3 left-3 z-10">
                <ProductTags tags={product.tags} />
              </div>
            )}
          </div>

          {/* Content - Centered */}
          <div className="p-5 text-center flex flex-col flex-1">
            {/* Brand */}
            <p className="text-xs text-[var(--color-primary)] font-medium uppercase tracking-wider mb-1">
              {product.brand}
            </p>

            {/* Title - Altura fija para 2 líneas */}
            <h3 className="font-bold text-neutral-800 text-lg line-clamp-2 mb-3 min-h-[3.5rem]">
              {displayName}
            </h3>

            {/* Color Selector - Altura fija reservada */}
            <div className="flex justify-center mb-4 min-h-[32px]">
              {product.colors && product.colors.length > 0 ? (
                <ColorSelector
                  colors={product.colors}
                  selectedColorId={selectedColorId}
                  onColorSelect={setSelectedColorId}
                  version={colorSelectorVersion}
                />
              ) : null}
            </div>

            {/* Specs técnicas con iconos - altura fija (siempre 4 specs) */}
            <div className="space-y-2 min-h-[100px]">
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                <Cpu className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>{displaySpecs?.processor?.model || 'Procesador'}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                <MemoryStick className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>
                  {displaySpecs?.ram?.size || 8}GB {displaySpecs?.ram?.type || 'DDR4'}
                  {displaySpecs?.ram?.expandable && (
                    <span className="text-[#22c55e] ml-1">(expandible)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                <HardDrive className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>
                  {displaySpecs?.storage?.size || 256}GB {(displaySpecs?.storage?.type || 'ssd').toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                <Monitor className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>
                  {displaySpecs?.display?.size || 15.6}&quot; {(displaySpecs?.display?.resolution || 'fhd').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Spacer - empuja pricing y CTAs al fondo */}
            <div className="flex-1 min-h-4" />

            {/* Pricing - Altura fija para consistencia entre cards */}
            <div className="bg-[rgba(var(--color-primary-rgb),0.05)] rounded-2xl py-4 px-6 mb-4">
              {/* Precio anterior + descuento (altura reservada siempre) */}
              <div className="h-5 flex items-center justify-center gap-1.5">
                {originalQuota && originalQuota > quota ? (
                  <>
                    <span className="text-xs text-neutral-400 line-through">S/{formatMoneyNoDecimals(Math.floor(originalQuota))}/mes</span>
                    {displayDiscount && displayDiscount > 0 && (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                        -{displayDiscount}%
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-neutral-400">Cuota mensual</span>
                )}
              </div>
              {/* Precio actual */}
              <div className="flex items-baseline justify-center gap-0.5 mt-1">
                <span className="text-3xl font-black text-[var(--color-primary)]">S/{formatMoneyNoDecimals(Math.floor(quota))}</span>
                <span className="text-lg text-neutral-400">/mes</span>
              </div>
              {/* Info adicional */}
              <p className="text-xs text-neutral-500 mt-2">
                en {selectedTerm} meses{initialAmount > 0 ? ` · inicial S/${formatMoneyNoDecimals(Math.floor(initialAmount))}` : ' · sin inicial'}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex gap-2 w-full">
              <Button
                id={detailButtonId}
                size="lg"
                variant="bordered"
                className="flex-1 border-[var(--color-primary)] text-[var(--color-primary)] font-bold cursor-pointer hover:bg-[rgba(var(--color-primary-rgb),0.05)] rounded-xl"
                startContent={<Eye className="w-5 h-5" />}
                onPress={onViewDetail}
              >
                Detalle
              </Button>
              <Button
                id={addToCartButtonId}
                size="lg"
                className={`flex-1 font-bold rounded-xl ${
                  isInCart
                    ? 'bg-emerald-500 text-white cursor-default'
                    : 'bg-[var(--color-primary)] text-white cursor-pointer hover:brightness-90'
                }`}
                onPress={!isInCart ? onAddToCart : undefined}
                isDisabled={isInCart}
              >
                {isInCart ? 'En el carrito' : 'Lo quiero'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
