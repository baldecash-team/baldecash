'use client';

/**
 * ProductCard - Wrapper que selecciona la version de card
 *
 * Selecciona automaticamente entre V1, V2, V3 segun configuracion
 * V1: Enfoque Tecnico (specs)
 * V2: Enfoque Beneficios (uso)
 * V3: Enfoque Hibrido (equilibrado)
 */

import React from 'react';
import { CatalogProduct } from '../../types/catalog';
import { ProductCardV1 } from './cards/ProductCardV1';
import { ProductCardV2 } from './cards/ProductCardV2';
import { ProductCardV3 } from './cards/ProductCardV3';

interface ProductCardProps {
  product: CatalogProduct;
  index?: number;
  cardVersion?: 1 | 2 | 3;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  onCompare?: (productId: string) => void;
  isComparing?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  cardVersion = 1,
  onToggleFavorite,
  isFavorite = false,
  onCompare,
  isComparing = false,
}) => {
  // Seleccionar componente basado en version
  switch (cardVersion) {
    case 1:
      return (
        <ProductCardV1
          product={product}
          index={index}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
        />
      );
    case 2:
      return (
        <ProductCardV2
          product={product}
          index={index}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
        />
      );
    case 3:
      return (
        <ProductCardV3
          product={product}
          index={index}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
          onCompare={onCompare}
          isComparing={isComparing}
        />
      );
    default:
      return (
        <ProductCardV1
          product={product}
          index={index}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
        />
      );
  }
};

export default ProductCard;
