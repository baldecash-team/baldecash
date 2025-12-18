'use client';

/**
 * Comparator V1 - Modal Fullscreen
 *
 * Version standalone con layout de modal fullscreen
 * Tabla tradicional con colores semanticos
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { GitCompareArrows } from 'lucide-react';
import { ProductComparator, FloatingCompareBar } from '../components/comparator';
import { ComparatorConfig, ComparisonProduct } from '../types/comparator';
import { mockComparisonProducts, defaultComparisonProducts } from '../data/mockComparatorData';

const configV1: ComparatorConfig = {
  layoutVersion: 1,
  tableVersion: 1,
  highlightVersion: 1,
  maxProducts: 3,
  priceDiffVersion: 1,
  differenceMode: 1,
};

export default function ComparatorV1Page() {
  const [selectedProducts, setSelectedProducts] = useState<ComparisonProduct[]>(
    defaultComparisonProducts
  );
  const [isOpen, setIsOpen] = useState(true);

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
    setIsOpen(false);
  };

  const handleAddProduct = (product: ComparisonProduct) => {
    if (selectedProducts.length >= configV1.maxProducts) return;
    if (selectedProducts.find((p) => p.id === product.id)) return;
    setSelectedProducts([...selectedProducts, product]);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#4654CD] font-['Baloo_2'] mb-6">
          Comparador V1 - Modal Fullscreen
        </h1>

        {/* Product Selector */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200 mb-6">
          <h2 className="font-semibold text-neutral-800 mb-4">
            Selecciona productos ({selectedProducts.length}/{configV1.maxProducts})
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {mockComparisonProducts.map((product) => {
              const isSelected = selectedProducts.find((p) => p.id === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() =>
                    isSelected ? handleRemoveProduct(product.id) : handleAddProduct(product)
                  }
                  className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#4654CD] bg-[#4654CD]/5'
                      : 'border-neutral-200 hover:border-[#4654CD]/50'
                  }`}
                >
                  <img
                    src={product.thumbnail}
                    alt={product.displayName}
                    className="w-full h-12 object-contain"
                  />
                  <p className="text-xs text-center mt-1">{product.brand}</p>
                </button>
              );
            })}
          </div>

          <Button
            className="bg-[#4654CD] text-white mt-4 cursor-pointer"
            startContent={<GitCompareArrows className="w-4 h-4" />}
            onPress={() => setIsOpen(true)}
            isDisabled={selectedProducts.length < 2}
          >
            Abrir Comparador
          </Button>
        </div>
      </div>

      {/* Comparator Modal */}
      <ProductComparator
        config={configV1}
        products={selectedProducts}
        onRemoveProduct={handleRemoveProduct}
        onClearAll={handleClearAll}
        isOpen={isOpen && selectedProducts.length >= 2}
        onClose={() => setIsOpen(false)}
      />

      {/* Floating Bar */}
      {!isOpen && (
        <FloatingCompareBar
          products={selectedProducts}
          maxProducts={configV1.maxProducts}
          onRemoveProduct={handleRemoveProduct}
          onCompare={() => setIsOpen(true)}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
