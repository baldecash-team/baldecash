'use client';

/**
 * Comparator V2 - Pagina Dedicada
 *
 * Version standalone con layout de pagina completa
 * Cards lado a lado con iconos winner/loser
 */

import React, { useState } from 'react';
import { ProductComparator } from '../components/comparator';
import { ComparatorConfig, ComparisonProduct } from '../types/comparator';
import { defaultComparisonProducts } from '../data/mockComparatorData';

const configV2: ComparatorConfig = {
  layoutVersion: 2,
  tableVersion: 2,
  highlightVersion: 2,
  maxProducts: 3,
  priceDiffVersion: 2,
  differenceMode: 2,
};

export default function ComparatorV2Page() {
  const [selectedProducts, setSelectedProducts] = useState<ComparisonProduct[]>(
    defaultComparisonProducts
  );

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
  };

  return (
    <ProductComparator
      config={configV2}
      products={selectedProducts}
      onRemoveProduct={handleRemoveProduct}
      onClearAll={handleClearAll}
      onBack={() => window.history.back()}
    />
  );
}
