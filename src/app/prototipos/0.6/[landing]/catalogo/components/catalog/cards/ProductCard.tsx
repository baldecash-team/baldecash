'use client';

/**
 * ProductCard v0.6.1 - Basado en ProductCardV6 de v0.4
 * Configuración fija con la única variable siendo el ColorSelector
 * Layout: Centrado Impacto (cuota gigante, CTA full-width)
 * Referencia: Spotify, Apple Music, Netflix
 *
 * ACTUALIZACIÓN v0.6.1: Ahora pasa CartItem y WishlistItem completos
 * para mantener coherencia de datos en todo el flujo.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Heart, Eye, GitCompare, Cpu, MemoryStick, HardDrive, Monitor, Flame, Siren, Zap, Star, Gift, type LucideProps } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  CatalogProduct,
  ColorSelectorVersion,
  CartItem,
  WishlistItem,
  TermMonths,
  calculateQuotaWithInitial,
} from '../../../types/catalog';

const PROMO_BANNER_ICONS: Record<string, React.FC<LucideProps>> = {
  fire: Flame,
  siren: Siren,
  lightning: Zap,
  star: Star,
  gift: Gift,
};
import { ImageGallery } from '../ImageGallery';
import { ProductTags } from '../ProductTags';
import { ColorSelector } from '../color-selector';
import { formatMoneyNoDecimals } from '../../../utils/formatMoney';

interface ProductCardProps {
  product: CatalogProduct;
  /** Callback con CartItem completo incluyendo configuración y color */
  onAddToCart?: (item: CartItem) => void;
  /** Callback con WishlistItem completo incluyendo color seleccionado */
  onFavorite?: (item: WishlistItem) => void;
  onViewDetail?: (slug?: string) => void;
  onMouseEnter?: () => void;
  isFavorite?: boolean;
  isFavoriteCheck?: (productId: string) => boolean;
  colorSelectorVersion?: ColorSelectorVersion;
  // Compare props
  onCompare?: (activeProductId: string) => void;
  isCompareSelected?: boolean;
  isCompareCheck?: (productId: string) => boolean;
  compareDisabled?: boolean;
  // Cart state
  isInCart?: boolean;
  isInCartCheck?: (productId: string) => boolean;
  // Onboarding IDs (optional, only for first card)
  favoriteButtonId?: string;
  compareButtonId?: string;
  detailButtonId?: string;
  addToCartButtonId?: string;
  /** Ocultar selector de colores (ej: landing sin variantes de color) */
  hideColors?: boolean;
  /** Agregar spacer arriba cuando otra card en la misma fila tiene banner promo */
  needsPromoSpacer?: boolean;
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
  isCompareCheck,
  compareDisabled = false,
  isInCart = false,
  isInCartCheck,
  isFavoriteCheck,
  favoriteButtonId,
  compareButtonId,
  detailButtonId,
  addToCartButtonId,
  hideColors = true,
  needsPromoSpacer = false,
}) => {
  // Color selector state — default to current product's ID if it's in the siblings
  const currentProductColor = product.colors?.find(c => c.productId === product.id);
  const [selectedColorId, setSelectedColorId] = useState<string>(
    currentProductColor?.id || product.colors?.[0]?.id || ''
  );

  // Hover capability detection — disables sticky :hover side-effects on touch
  // devices (iOS/Android) where the last tapped card would stay "hovered".
  const [isHoverCapable, setIsHoverCapable] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handler = (e: MediaQueryListEvent) => setIsHoverCapable(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Get the selected color sibling data
  const selectedColor = product.colors?.find(c => c.id === selectedColorId);

  // Determine the active product ID (sibling's productId if selected, else card's product)
  const activeProductId = selectedColor?.productId || product.id;

  // Resolve favorite/compare/cart state using sibling-aware checks
  const resolvedIsFavorite = isFavoriteCheck ? isFavoriteCheck(activeProductId) : isFavorite;
  const resolvedIsCompareSelected = isCompareCheck ? isCompareCheck(activeProductId) : isCompareSelected;
  const resolvedIsInCart = isInCartCheck ? isInCartCheck(activeProductId) : isInCart;

  // Override card data when a different color sibling is selected
  const displayName = selectedColor?.displayName || product.displayName;
  const displayPrice = selectedColor?.price ?? product.price;
  const displayQuota = selectedColor?.quotaMonthly ?? product.quotaMonthly;
  const displayOriginalQuota = selectedColor?.originalQuotaMonthly ?? product.originalQuotaMonthly ?? null;
  const displayDiscount = selectedColor?.discount ?? product.discount;
  const displaySpecs = product.specs; // Specs fijos del producto base, no varían por color

  // Obtener imágenes según color seleccionado (para carousel)
  const getImagesForSelectedColor = (): string[] => {
    if (!selectedColorId || !product.colors) {
      // Use images array if it has items, otherwise fallback to thumbnail
      const imgs = product.images.length > 0 ? product.images : [product.thumbnail];
      return [...new Set(imgs)];
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

  // Financiamiento: plazo más alto del producto, sin inicial
  const selectedTerm = product.maxTermMonths as TermMonths;
  const selectedInitial = 0 as const;
  const quota = displayQuota;
  const { initialAmount } = calculateQuotaWithInitial(displayPrice, selectedTerm, selectedInitial);

  // Payment frequency selector (for celulares: semanal/quincenal)
  const hookFrequency = product.paymentFrequency || 'mensual';
  const [selectedFrequency, setSelectedFrequency] = useState(hookFrequency);

  // Cuota para la frecuencia seleccionada (desde payment_hooks, fallback al hook principal)
  const displayQuotaForFreq = (product.paymentHooks && product.paymentHooks[selectedFrequency] != null)
    ? product.paymentHooks[selectedFrequency]
    : displayQuota;

  const freqShort = selectedFrequency === 'semanal' ? '/sem' : selectedFrequency === 'quincenal' ? '/qcn' : '/mes';
  // Plazo máximo en meses: semanal ÷4, quincenal ÷2
  const displayTermMonths = hookFrequency === 'semanal'
    ? Math.round(selectedTerm / 4)
    : hookFrequency === 'quincenal'
      ? Math.round(selectedTerm / 2)
      : selectedTerm;

  const originalQuota = displayOriginalQuota;

  // ============================================
  // Crear CartItem completo para onAddToCart
  // ============================================
  const createCartItem = (): CartItem => ({
    productId: activeProductId,
    slug: selectedColor?.slug || product.slug,  // For API calls when fetching payment plans
    name: displayName,
    shortName: product.name,
    brand: product.brand,
    price: displayPrice,
    image: selectedImages[0] || product.thumbnail,
    type: product.deviceType,
    variantId: selectedColor?.id,
    colorName: selectedColor?.name,
    colorHex: selectedColor?.hex,
    months: selectedTerm,
    initialPercent: selectedInitial,
    initialAmount,
    monthlyPayment: quota,
    specs: {
      processor: displaySpecs?.processor?.model,
      ram: displaySpecs?.ram ? `${displaySpecs.ram.size}GB` : undefined,
      storage: displaySpecs?.storage ? `${displaySpecs.storage.size}GB` : undefined,
    },
    addedAt: Date.now(),
  });

  // ============================================
  // Crear WishlistItem completo para onFavorite
  // ============================================
  const createWishlistItem = (): WishlistItem => ({
    productId: activeProductId,
    slug: selectedColor?.slug || product.slug,
    name: displayName,           // Full name for display
    shortName: product.name,     // Short name
    brand: product.brand,
    price: displayPrice,
    image: selectedImages[0] || product.thumbnail,
    lowestQuota: quota,
    type: product.deviceType,
    variantId: selectedColor?.id,
    colorName: selectedColor?.name,
    colorHex: selectedColor?.hex,
    months: selectedTerm,
    initialPercent: selectedInitial,
    initialAmount,
    monthlyPayment: quota,
    addedAt: Date.now(),
  });

  // Promotion template data
  const promoTemplate = product.promotion?.template;
  const promoBorderColor = promoTemplate?.borderColor || 'var(--color-primary)';
  const promoBannerBg = promoTemplate?.bannerBgColor || 'var(--color-primary)';
  const promoBannerTextColor = promoTemplate?.bannerTextColor || '#FFFFFF';
  const PromoBannerIcon = promoTemplate?.bannerIcon ? PROMO_BANNER_ICONS[promoTemplate.bannerIcon] : null;
  const isTopBarBanner = promoTemplate?.bannerStyle === 'top_bar' || !promoTemplate?.bannerStyle;

  return (
    <motion.div
      className="h-full w-full min-w-[min(280px,100%)] max-w-[398px]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isHoverCapable ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
    >
      <Card
        className="h-full border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white"
        style={promoTemplate ? {
          border: `3px solid ${promoBorderColor}`,
          boxShadow: `0 0 20px 4px ${promoBorderColor}55, 0 4px 12px ${promoBorderColor}33`,
        } : undefined}
      >
        <CardBody className="p-0 flex flex-col">
          {/* Spacer for non-promo cards in rows that have promo cards */}
          {needsPromoSpacer && !(promoTemplate && isTopBarBanner) && (
            <div className="h-[44px] shrink-0" />
          )}
          {/* Promotion Banner */}
          {promoTemplate && isTopBarBanner && (
            <div
              className="w-full px-4 py-2.5 flex items-center justify-center gap-2.5"
              style={{
                background: `linear-gradient(135deg, ${promoBannerBg} 0%, ${promoBannerBg}cc 50%, ${promoBannerBg} 100%)`,
                backgroundColor: promoBannerBg,
              }}
            >
              {PromoBannerIcon && (
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <PromoBannerIcon className="w-5 h-5" color={promoBannerTextColor} />
                </motion.div>
              )}
              <span
                className="text-base font-black tracking-widest uppercase"
                style={{ color: promoBannerTextColor, textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
              >
                {promoTemplate.bannerText}
              </span>
              {PromoBannerIcon && (
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <PromoBannerIcon className="w-5 h-5" color={promoBannerTextColor} />
                </motion.div>
              )}
            </div>
          )}
          {promoTemplate && !isTopBarBanner && (
            <div className="absolute top-0 left-0 z-20">
              <div
                className="px-4 py-1.5 text-sm font-black rounded-br-xl"
                style={{
                  backgroundColor: promoBannerBg,
                  color: promoBannerTextColor,
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  boxShadow: `0 3px 10px ${promoBannerBg}66`,
                }}
              >
                {PromoBannerIcon && (
                  <motion.span
                    className="inline-block mr-1 align-middle"
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <PromoBannerIcon className="w-4 h-4 inline" />
                  </motion.span>
                )}
                {promoTemplate.bannerText}
              </div>
            </div>
          )}
          {/* Image - Altura fija para consistencia */}
          <div className="relative bg-white p-6 h-[220px] flex items-center justify-center">
            <ImageGallery
              images={selectedImages}
              alt={displayName}
            />

            {/* Action buttons - top right (p-3 = 44px touch target WCAG 2.5.5) */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              {/* Favorite */}
              <button
                id={favoriteButtonId}
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite?.(createWishlistItem());
                }}
                className="p-3 rounded-full bg-white/90 shadow-md cursor-pointer hover:bg-[rgba(var(--color-primary-rgb),0.1)] transition-all"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    resolvedIsFavorite
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
                    if (!compareDisabled || resolvedIsCompareSelected) {
                      onCompare(activeProductId);
                    }
                  }}
                  disabled={compareDisabled && !resolvedIsCompareSelected}
                  className={`p-3 rounded-full shadow-md transition-all ${
                    resolvedIsCompareSelected
                      ? 'bg-[var(--color-primary)] text-white cursor-pointer hover:brightness-90'
                      : compareDisabled
                        ? 'bg-white/50 text-neutral-300 cursor-not-allowed'
                        : 'bg-white/90 hover:bg-[rgba(var(--color-primary-rgb),0.1)] cursor-pointer'
                  }`}
                  title={
                    compareDisabled && !resolvedIsCompareSelected
                      ? 'Máximo 3 productos'
                      : resolvedIsCompareSelected
                        ? 'Quitar de comparación'
                        : 'Agregar a comparación'
                  }
                >
                  <GitCompare
                    className={`w-5 h-5 transition-colors ${
                      resolvedIsCompareSelected
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
            <h3
              className="font-bold text-neutral-800 text-base sm:text-lg line-clamp-2 mb-3 min-h-[3rem] sm:min-h-[3.5rem] cursor-pointer hover:text-[var(--color-primary)] transition-colors leading-tight"
              onClick={() => onViewDetail?.(selectedColor?.slug)}
            >
              {displayName}
            </h3>

            {/* Color Selector - solo visible en cards de familia (colors.length > 1) */}
            {!hideColors && product.colors && product.colors.length > 1 && (
              <div className="flex justify-center mb-4 min-h-[32px]">
                <ColorSelector
                  colors={product.colors}
                  selectedColorId={selectedColorId}
                  onColorSelect={setSelectedColorId}
                  version={colorSelectorVersion}
                />
              </div>
            )}

            {/* Specs técnicas con iconos - solo muestra specs con dato real */}
            <div className="space-y-2 min-h-[100px]">
              {displaySpecs?.processor?.model && (
                <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                  <Cpu className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>{displaySpecs.processor.model}</span>
                </div>
              )}
              {displaySpecs?.ram && (
                <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                  <MemoryStick className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>
                    {displaySpecs.ram.size}GB {displaySpecs.ram.type}
                    {displaySpecs.ram.expandable && (
                      <span className="text-[#22c55e] ml-1">(expandible)</span>
                    )}
                  </span>
                </div>
              )}
              {displaySpecs?.storage && (
                <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                  <HardDrive className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>{displaySpecs.storage.size}GB {displaySpecs.storage.type.toUpperCase()}</span>
                </div>
              )}
              {displaySpecs?.display && (
                <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                  <Monitor className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>{displaySpecs.display.size}&quot; {displaySpecs.display.resolution.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Spacer - empuja pricing y CTAs al fondo */}
            <div className="flex-1 min-h-4" />

            {/* Pricing - Altura fija para consistencia entre cards */}
            <div className="bg-[rgba(var(--color-primary-rgb),0.05)] rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 mb-4">
              {/* Frequency chips — shown when product has semanal/quincenal options */}
              {product.paymentFrequencies && product.paymentFrequencies.length > 1 && (
                <div className="flex justify-center gap-1.5 mb-2">
                  {product.paymentFrequencies.map((freq) => (
                    <button
                      key={freq}
                      onClick={(e) => { e.stopPropagation(); setSelectedFrequency(freq); }}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                        freq === selectedFrequency
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
                      }`}
                    >
                      {freq === 'semanal' ? 'Semanal' : freq === 'quincenal' ? 'Quincenal' : freq}
                    </button>
                  ))}
                </div>
              )}
              {/* Precio anterior + descuento (altura reservada siempre) */}
              <div className="h-5 flex items-center justify-center gap-1.5">
                {originalQuota && originalQuota > quota ? (
                  <>
                    <span className="text-xs text-neutral-400 line-through">S/{formatMoneyNoDecimals(Math.floor(originalQuota))}{freqShort}</span>
                    {displayDiscount && displayDiscount > 0 && (
                      <span className="text-xs font-bold text-white bg-[var(--color-primary)] px-1.5 py-0.5 rounded">
                        -{Math.round(displayDiscount)}%
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-neutral-400">Cuota {selectedFrequency !== 'mensual' ? selectedFrequency : 'mensual'}</span>
                )}
              </div>
              {/* Precio actual — graduado para cards estrechas */}
              <div className="flex items-baseline justify-center gap-0.5 mt-1 min-w-0">
                <span className="text-2xl sm:text-3xl font-black text-[var(--color-primary)] break-words">S/{formatMoneyNoDecimals(Math.floor(displayQuotaForFreq))}</span>
                <span className="text-base sm:text-lg text-neutral-400">{freqShort}</span>
              </div>
              {/* Info adicional */}
              <p className="text-[11px] sm:text-xs text-neutral-500 mt-2 break-words">
                en {displayTermMonths} meses{initialAmount > 0 ? ` · inicial S/${formatMoneyNoDecimals(Math.floor(initialAmount))}` : ' · sin inicial'}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex gap-2 w-full">
              <Button
                id={detailButtonId}
                size="lg"
                variant="bordered"
                className="flex-1 border-[var(--color-primary)] text-[var(--color-primary)] font-bold cursor-pointer hover:bg-[rgba(var(--color-primary-rgb),0.05)] rounded-xl"
                startContent={<Eye className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />}
                onPress={() => onViewDetail?.(selectedColor?.slug)}
              >
                Detalle
              </Button>
              <Button
                id={addToCartButtonId}
                size="lg"
                className={`flex-1 font-bold rounded-xl ${
                  resolvedIsInCart
                    ? 'bg-emerald-500 text-white cursor-default'
                    : 'bg-[var(--color-primary)] text-white cursor-pointer hover:brightness-90'
                }`}
                onPress={!resolvedIsInCart ? () => onAddToCart?.(createCartItem()) : undefined}
                isDisabled={resolvedIsInCart}
              >
                {resolvedIsInCart ? 'En el carrito' : 'Lo quiero'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
