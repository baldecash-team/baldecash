'use client';

/**
 * Comparator V3 - Panel Lateral Sticky
 *
 * Version standalone con panel lateral
 * Scroll horizontal con barras comparativas
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { GitCompareArrows, Laptop } from 'lucide-react';
import { ProductComparator, FloatingCompareBar } from '../components/comparator';
import { ComparatorConfig, ComparisonProduct } from '../types/comparator';
import { mockComparisonProducts, defaultComparisonProducts } from '../data/mockComparatorData';

const configV3: ComparatorConfig = {
  layoutVersion: 3,
  tableVersion: 3,
  highlightVersion: 3,
  maxProducts: 4,
  priceDiffVersion: 3,
  differenceMode: 3,
};

export default function ComparatorV3Page() {
  const [selectedProducts, setSelectedProducts] = useState<ComparisonProduct[]>(
    defaultComparisonProducts
  );
  const [isOpen, setIsOpen] = useState(true);

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
  };

  const handleAddProduct = (product: ComparisonProduct) => {
    if (selectedProducts.length >= configV3.maxProducts) return;
    if (selectedProducts.find((p) => p.id === product.id)) return;
    setSelectedProducts([...selectedProducts, product]);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Simulated Catalog Content */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Laptop className="w-6 h-6 text-[#4654CD]" />
            <h1 className="text-xl font-bold text-[#4654CD] font-['Baloo_2']">
              Catalogo (Demo V3)
            </h1>
          </div>
          <Button
            size="sm"
            className="bg-[#4654CD] text-white cursor-pointer"
            startContent={<GitCompareArrows className="w-4 h-4" />}
            onPress={() => setIsOpen(true)}
          >
            Comparar ({selectedProducts.length})
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          Laptops disponibles
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockComparisonProducts.map((product) => {
            const isSelected = selectedProducts.find((p) => p.id === product.id);
            return (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-[#4654CD]/50 transition-all"
              >
                <img
                  src={product.thumbnail}
                  alt={product.displayName}
                  className="w-full h-32 object-contain mb-3"
                />
                <p className="text-xs text-neutral-500 uppercase mb-1">
                  {product.brand}
                </p>
                <h3 className="font-medium text-sm text-neutral-800 line-clamp-2 mb-2">
                  {product.displayName}
                </h3>
                <p className="text-lg font-bold text-[#4654CD] mb-3">
                  S/{product.lowestQuota}/mes
                </p>
                <Button
                  size="sm"
                  variant={isSelected ? 'solid' : 'bordered'}
                  className={`w-full cursor-pointer ${
                    isSelected ? 'bg-[#4654CD] text-white' : 'border-[#4654CD] text-[#4654CD]'
                  }`}
                  onPress={() =>
                    isSelected ? handleRemoveProduct(product.id) : handleAddProduct(product)
                  }
                  isDisabled={!isSelected && selectedProducts.length >= configV3.maxProducts}
                >
                  {isSelected ? 'Seleccionado' : 'Comparar'}
                </Button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Panel Comparator */}
      <ProductComparator
        config={configV3}
        products={selectedProducts}
        onRemoveProduct={handleRemoveProduct}
        onClearAll={handleClearAll}
        isOpen={isOpen && selectedProducts.length >= 2}
        onClose={() => setIsOpen(false)}
      />

      {/* Floating Bar when panel is closed */}
      {!isOpen && (
        <FloatingCompareBar
          products={selectedProducts}
          maxProducts={configV3.maxProducts}
          onRemoveProduct={handleRemoveProduct}
          onCompare={() => setIsOpen(true)}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
