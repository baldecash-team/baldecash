'use client';

/**
 * Comparator Preview Page
 *
 * Pagina principal de preview con configurador de versiones
 * Permite probar diferentes combinaciones de componentes
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { GitCompareArrows } from 'lucide-react';
import {
  ProductComparator,
  ComparatorSettingsModal,
  FloatingCompareBar,
} from '../components/comparator';
import {
  ComparatorConfig,
  defaultComparatorConfig,
  ComparisonProduct,
} from '../types/comparator';
import {
  mockComparisonProducts,
  defaultComparisonProducts,
} from '../data/mockComparatorData';
import { FloatingControls } from '@/app/prototipos/_shared/components/FloatingControls';

export default function ComparatorPreviewPage() {
  const [config, setConfig] = useState<ComparatorConfig>(defaultComparatorConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ComparisonProduct[]>(
    defaultComparisonProducts
  );
  const [isComparatorOpen, setIsComparatorOpen] = useState(true);

  const handleAddProduct = (product: ComparisonProduct) => {
    if (selectedProducts.length >= config.maxProducts) return;
    if (selectedProducts.find((p) => p.id === product.id)) return;
    setSelectedProducts([...selectedProducts, product]);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
  };

  // For Layout V1 (modal) and V3 (panel), we show a product selector
  const showProductSelector = config.layoutVersion !== 2;

  return (
    <div className="min-h-screen bg-white relative">
      {/* Floating Controls */}
      <FloatingControls
        config={config}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pt-8">
        {/* Product Selector (for V1 modal and V3 panel) */}
        {showProductSelector && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">
              Selecciona productos para comparar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {mockComparisonProducts.map((product) => {
                const isSelected = selectedProducts.find(
                  (p) => p.id === product.id
                );
                const isDisabled =
                  !isSelected && selectedProducts.length >= config.maxProducts;

                return (
                  <button
                    key={product.id}
                    onClick={() =>
                      isSelected
                        ? handleRemoveProduct(product.id)
                        : handleAddProduct(product)
                    }
                    disabled={isDisabled}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : isDisabled
                          ? 'border-neutral-200 bg-neutral-100 opacity-50 cursor-not-allowed'
                          : 'border-neutral-200 bg-white hover:border-[#4654CD]/50'
                    }`}
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.displayName}
                      className="w-full h-16 object-contain mb-2"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <p className="text-xs font-medium text-neutral-800 line-clamp-2 text-center">
                      {product.brand}
                    </p>
                    <p className="text-xs text-[#4654CD] font-semibold text-center">
                      S/{product.lowestQuota}/mes
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Open Comparator Button */}
            {selectedProducts.length >= 2 && (
              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  className="bg-[#4654CD] text-white cursor-pointer"
                  startContent={<GitCompareArrows className="w-5 h-5" />}
                  onPress={() => setIsComparatorOpen(true)}
                >
                  Abrir Comparador ({selectedProducts.length} productos)
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Comparator Content */}
        {config.layoutVersion === 2 ? (
          // V2 is a dedicated page layout - show inline
          <ProductComparator
            config={config}
            products={selectedProducts}
            onRemoveProduct={handleRemoveProduct}
            onClearAll={handleClearAll}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : (
          // V1 (modal) and V3 (panel) show as overlays
          <ProductComparator
            config={config}
            products={selectedProducts}
            onRemoveProduct={handleRemoveProduct}
            onClearAll={handleClearAll}
            isOpen={isComparatorOpen && selectedProducts.length >= 2}
            onClose={() => setIsComparatorOpen(false)}
          />
        )}
      </main>

      {/* Floating Bar (for V1 and V3 when comparator is closed) */}
      {showProductSelector && !isComparatorOpen && (
        <FloatingCompareBar
          products={selectedProducts}
          maxProducts={config.maxProducts}
          onRemoveProduct={handleRemoveProduct}
          onCompare={() => setIsComparatorOpen(true)}
          onClearAll={handleClearAll}
        />
      )}

      {/* Settings Modal */}
      <ComparatorSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
