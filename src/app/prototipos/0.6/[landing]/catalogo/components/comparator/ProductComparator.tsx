'use client';

import React from 'react';
import { ComparatorLayoutProps } from '../../types/comparator';
import { ComparatorV1 } from './ComparatorV1';
import { ComparatorV2 } from './ComparatorV2';

/**
 * ProductComparator - Main wrapper component for v0.5
 * Selects the appropriate layout version based on config
 */
export const ProductComparator: React.FC<
  ComparatorLayoutProps & {
    isOpen?: boolean;
    onClose?: () => void;
    onAddToCart?: (productId: string) => void;
    cartItems?: string[];
  }
> = (props) => {
  const { config, isOpen = true, onClose = () => {}, onAddToCart, cartItems = [] } = props;

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  switch (config.layoutVersion) {
    case 1:
      return <ComparatorV1 {...props} isOpen={isOpen} onClose={onClose} onAddToCart={onAddToCart} cartItems={cartItems} />;
    case 2:
      return <ComparatorV2 {...props} isOpen={isOpen} onClose={onClose} onAddToCart={onAddToCart} cartItems={cartItems} />;
    default:
      return <ComparatorV1 {...props} isOpen={isOpen} onClose={onClose} onAddToCart={onAddToCart} cartItems={cartItems} />;
  }
};

export default ProductComparator;
