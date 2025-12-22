'use client';

import React from 'react';
import {
  CatalogProduct,
  ProductCardVersion,
  ImageGalleryVersion,
  GallerySizeVersion,
  TagDisplayVersion,
  PricingMode,
  TermMonths,
  InitialPaymentPercent,
} from '../../types/catalog';
import {
  ProductCardV1,
  ProductCardV2,
  ProductCardV3,
  ProductCardV4,
  ProductCardV5,
  ProductCardV6,
} from './cards';

export interface ProductCardProps {
  product: CatalogProduct;
  cardVersion?: ProductCardVersion;
  imageGalleryVersion?: ImageGalleryVersion;
  gallerySizeVersion?: GallerySizeVersion;
  tagDisplayVersion?: TagDisplayVersion;
  pricingMode?: PricingMode;
  defaultTerm?: TermMonths;
  defaultInitial?: InitialPaymentPercent;
  onAddToCart?: () => void;
  onFavorite?: () => void;
  onViewDetail?: () => void;
  onMouseEnter?: () => void;
  isFavorite?: boolean;
  // Compare props
  onCompare?: () => void;
  isCompareSelected?: boolean;
  compareDisabled?: boolean;
}

/**
 * ProductCard - Wrapper selector de versiones
 *
 * Versiones disponibles:
 * - V1: Enfoque Técnico (specs con iconos) - Amazon/Best Buy
 * - V2: Enfoque Beneficios (lifestyle) - Apple/Samsung
 * - V3: Híbrido Flat (2 specs + 2 usos) - Notion/Stripe
 * - V4: Abstracto Flotante (fintech) - Nubank/Revolut
 * - V5: Split 50/50 (horizontal) - Webflow/Framer
 * - V6: Centrado Impacto (cuota gigante) - Spotify/Apple
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cardVersion = 1,
  imageGalleryVersion = 1,
  gallerySizeVersion = 2,
  tagDisplayVersion = 1,
  pricingMode = 'interactive',
  defaultTerm = 24,
  defaultInitial = 10,
  onAddToCart,
  onFavorite,
  onViewDetail,
  onMouseEnter,
  isFavorite = false,
  onCompare,
  isCompareSelected = false,
  compareDisabled = false,
}) => {
  const commonProps = {
    product,
    onAddToCart,
    onFavorite,
    onViewDetail,
    onMouseEnter,
    isFavorite,
    imageGalleryVersion,
    gallerySizeVersion,
    tagDisplayVersion,
    pricingMode,
    defaultTerm,
    defaultInitial,
    onCompare,
    isCompareSelected,
    compareDisabled,
  };

  switch (cardVersion) {
    case 1:
      return <ProductCardV1 {...commonProps} />;
    case 2:
      return <ProductCardV2 {...commonProps} />;
    case 3:
      return <ProductCardV3 {...commonProps} />;
    case 4:
      return <ProductCardV4 {...commonProps} />;
    case 5:
      return <ProductCardV5 {...commonProps} />;
    case 6:
      return <ProductCardV6 {...commonProps} />;
    default:
      return <ProductCardV1 {...commonProps} />;
  }
};
