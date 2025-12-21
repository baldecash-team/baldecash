'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { Settings, Code, ArrowLeft, Scale } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ComparatorConfig,
  defaultComparatorConfig,
  ComparisonState,
  defaultComparisonState,
  getMaxProducts,
} from '../types/comparator';
import { ProductComparator } from '../components/comparator/ProductComparator';
import { ComparatorSettingsModal } from '../components/comparator/ComparatorSettingsModal';
import { ProductSelectorV1 } from '../components/comparator/selection/ProductSelectorV1';
import { CompareActions } from '../components/comparator/actions/CompareActions';
import { availableProducts, getProductsByIds } from '../data/mockComparatorData';
import { TokenCounter } from '@/components/ui/TokenCounter';

/**
 * Comparator Preview Page
 * Permite probar diferentes versiones del comparador
 */
export default function ComparatorPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" color="primary" />
        </div>
      }
    >
      <ComparatorPreviewContent />
    </Suspense>
  );
}

function ComparatorPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Config state
  const [config, setConfig] = useState<ComparatorConfig>(() => {
    const layoutVersion = parseInt(searchParams.get('layout') || '1') as 1 | 2 | 3 | 4 | 5 | 6;
    const accessVersion = parseInt(searchParams.get('access') || '1') as 1 | 2 | 3 | 4 | 5 | 6;
    const maxProductsVersion = parseInt(searchParams.get('maxproducts') || '2') as 1 | 2 | 3 | 4 | 5 | 6;
    const fieldsVersion = parseInt(searchParams.get('fields') || '1') as 1 | 2 | 3 | 4 | 5 | 6;
    const highlightVersion = parseInt(searchParams.get('highlight') || '1') as 1 | 2 | 3 | 4 | 5 | 6;
    const priceDiffVersion = parseInt(searchParams.get('pricediff') || '1') as 1 | 2 | 3 | 4 | 5 | 6;
    const differenceHighlightVersion = parseInt(searchParams.get('diffhighlight') || '1') as 1 | 2 | 3 | 4 | 5 | 6;
    const selectionVersion = parseInt(searchParams.get('selection') || '1') as 1 | 2 | 3 | 4 | 5 | 6;

    return {
      ...defaultComparatorConfig,
      layoutVersion: [1, 2, 3, 4, 5, 6].includes(layoutVersion) ? layoutVersion : 1,
      accessVersion: [1, 2, 3, 4, 5, 6].includes(accessVersion) ? accessVersion : 1,
      maxProductsVersion: [1, 2, 3, 4, 5, 6].includes(maxProductsVersion) ? maxProductsVersion : 2,
      fieldsVersion: [1, 2, 3, 4, 5, 6].includes(fieldsVersion) ? fieldsVersion : 1,
      highlightVersion: [1, 2, 3, 4, 5, 6].includes(highlightVersion) ? highlightVersion : 1,
      priceDiffVersion: [1, 2, 3, 4, 5, 6].includes(priceDiffVersion) ? priceDiffVersion : 1,
      differenceHighlightVersion: [1, 2, 3, 4, 5, 6].includes(differenceHighlightVersion) ? differenceHighlightVersion : 1,
      selectionVersion: [1, 2, 3, 4, 5, 6].includes(selectionVersion) ? selectionVersion : 1,
    };
  });

  // Comparison state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(['prod-1', 'prod-2', 'prod-3']);
  const [comparisonState, setComparisonState] = useState<ComparisonState>(defaultComparisonState);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  // Get max products based on config
  const maxProducts = useMemo(() => getMaxProducts(config.maxProductsVersion), [config.maxProductsVersion]);

  // Get selected products
  const selectedProducts = useMemo(() =>
    getProductsByIds(selectedProductIds),
    [selectedProductIds]
  );

  // Update URL when config changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('layout', config.layoutVersion.toString());
    params.set('access', config.accessVersion.toString());
    params.set('maxproducts', config.maxProductsVersion.toString());
    params.set('fields', config.fieldsVersion.toString());
    params.set('highlight', config.highlightVersion.toString());
    params.set('pricediff', config.priceDiffVersion.toString());
    params.set('diffhighlight', config.differenceHighlightVersion.toString());
    params.set('selection', config.selectionVersion.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [config, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key) {
        case 's':
        case 'S':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setIsSettingsOpen(true);
          }
          break;
        case 'Escape':
          setIsSettingsOpen(false);
          setIsComparatorOpen(false);
          break;
        case 'c':
        case 'C':
          if (!e.ctrlKey && !e.metaKey && selectedProducts.length >= 2) {
            setIsComparatorOpen(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProducts.length]);

  // Handlers
  const handleSelectProduct = useCallback((productId: string) => {
    if (selectedProductIds.length < maxProducts) {
      setSelectedProductIds((prev) => [...prev, productId]);
    }
  }, [selectedProductIds.length, maxProducts]);

  const handleDeselectProduct = useCallback((productId: string) => {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const handleRemoveProduct = useCallback((productId: string) => {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedProductIds([]);
    setIsComparatorOpen(false);
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedProducts.length >= 2) {
      setIsComparatorOpen(true);
    }
  }, [selectedProducts.length]);

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#4654CD]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#4654CD] font-['Baloo_2']">
                  Comparador de Equipos
                </h1>
                <p className="text-sm text-neutral-500">
                  Selecciona hasta {maxProducts} equipos para comparar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">
                {selectedProductIds.length} seleccionados
              </span>
              {selectedProductIds.length > 0 && (
                <Button
                  size="sm"
                  variant="light"
                  onPress={handleClearAll}
                  className="cursor-pointer text-neutral-500"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Product Selector */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">
            Equipos Disponibles
          </h2>
          <p className="text-sm text-neutral-500">
            Haz clic en los equipos que deseas comparar
          </p>
        </div>

        <ProductSelectorV1
          products={availableProducts.slice(0, 12)}
          selectedIds={selectedProductIds}
          onSelect={handleSelectProduct}
          onDeselect={handleDeselectProduct}
          maxProducts={maxProducts}
          version={config.selectionVersion}
        />
      </main>

      {/* Compare Actions Floating Bar */}
      <CompareActions
        products={selectedProducts}
        onCompare={handleCompare}
        onClear={handleClearAll}
        maxProducts={maxProducts}
      />

      {/* Comparator Modal */}
      <ProductComparator
        products={selectedProducts}
        config={config}
        onRemoveProduct={handleRemoveProduct}
        onClearAll={handleClearAll}
        comparisonState={comparisonState}
        onStateChange={setComparisonState}
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_05" version="0.4" />
        <Button
          isIconOnly
          radius="md"
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
          onPress={() => setIsSettingsOpen(true)}
        >
          <Settings className="w-5 h-5" />
        </Button>
        <Button
          isIconOnly
          radius="md"
          className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          onPress={() => setShowConfigBadge(!showConfigBadge)}
        >
          <Code className="w-5 h-5 text-neutral-600" />
        </Button>
        <Button
          isIconOnly
          radius="md"
          className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          onPress={() => router.push('/prototipos/0.4')}
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
      </div>

      {/* Current Config Badge */}
      {showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
          <p className="text-xs font-mono text-neutral-700">
            Layout: V{config.layoutVersion} | Acceso: V{config.accessVersion} | Max: V{config.maxProductsVersion} | Campos: V{config.fieldsVersion} | Highlight: V{config.highlightVersion}
          </p>
        </div>
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
