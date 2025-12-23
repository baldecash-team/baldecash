'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { Settings, Code, ArrowLeft, Scale, Keyboard, Info, Layers, Navigation } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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
import { CompareActions, CompareActionsFAB, ComparisonTray } from '../components/comparator/actions/CompareActions';
import { availableProducts, getProductsByIds } from '../data/mockComparatorData';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { useKeyboardShortcuts } from '@/app/prototipos/_shared';

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
    const cardSelectionVersion = parseInt(searchParams.get('cardstyle') || '1') as 1 | 2 | 3;

    return {
      ...defaultComparatorConfig,
      layoutVersion: [1, 2, 3, 4, 5, 6].includes(layoutVersion) ? layoutVersion : 1,
      accessVersion: [1, 2, 3, 4, 5, 6].includes(accessVersion) ? accessVersion : 1,
      maxProductsVersion: [1, 2, 3, 4, 5, 6].includes(maxProductsVersion) ? maxProductsVersion : 2,
      fieldsVersion: [1, 2, 3, 4, 5, 6].includes(fieldsVersion) ? fieldsVersion : 1,
      highlightVersion: [1, 2, 3, 4, 5, 6].includes(highlightVersion) ? highlightVersion : 1,
      priceDiffVersion: [1, 2, 3, 4, 5, 6].includes(priceDiffVersion) ? priceDiffVersion : 1,
      differenceHighlightVersion: [1, 2, 3, 4, 5, 6].includes(differenceHighlightVersion) ? differenceHighlightVersion : 1,
      cardSelectionVersion: [1, 2, 3].includes(cardSelectionVersion) ? cardSelectionVersion : 1,
    };
  });

  // Comparison state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(['prod-1', 'prod-2', 'prod-3']);
  const [comparisonState, setComparisonState] = useState<ComparisonState>(defaultComparisonState);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'version' | 'navigation' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'version' | 'navigation' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const componentLabels: Record<string, string> = {
    layout: 'Layout',
    access: 'Acceso',
    maxProducts: 'Max Productos',
    fields: 'Campos',
    highlight: 'Resaltado',
    priceDiff: 'Diferencia Precio',
    diffHighlight: 'Resaltar Diferencias',
    cardSelection: 'Estilo Card',
  };

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
    params.set('cardstyle', config.cardSelectionVersion.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [config, router]);

  // Keyboard shortcuts using shared hook
  const { currentComponent } = useKeyboardShortcuts({
    componentOrder: ['layout', 'access', 'maxProducts', 'fields', 'highlight', 'priceDiff', 'diffHighlight', 'cardSelection'],
    onVersionChange: (componentId, version) => {
      const keyMap: Record<string, keyof ComparatorConfig> = {
        layout: 'layoutVersion',
        access: 'accessVersion',
        maxProducts: 'maxProductsVersion',
        fields: 'fieldsVersion',
        highlight: 'highlightVersion',
        priceDiff: 'priceDiffVersion',
        diffHighlight: 'differenceHighlightVersion',
        cardSelection: 'cardSelectionVersion',
      };
      const configKey = keyMap[componentId];
      if (configKey) {
        // cardSelectionVersion only has 1-3
        if (configKey === 'cardSelectionVersion' && version > 3) {
          showToast(`${componentLabels[componentId]} solo tiene 3 versiones`, 'info');
          return;
        }
        setConfig(prev => ({ ...prev, [configKey]: version }));
        showToast(`${componentLabels[componentId]}: V${version}`, 'version');
      }
    },
    onNavigate: (componentId) => {
      showToast(`Componente: ${componentLabels[componentId] || componentId}`, 'navigation');
    },
    onToggleSettings: () => setIsSettingsOpen(prev => !prev),
    getCurrentVersion: (componentId) => {
      const keyMap: Record<string, keyof ComparatorConfig> = {
        layout: 'layoutVersion',
        access: 'accessVersion',
        maxProducts: 'maxProductsVersion',
        fields: 'fieldsVersion',
        highlight: 'highlightVersion',
        priceDiff: 'priceDiffVersion',
        diffHighlight: 'differenceHighlightVersion',
        cardSelection: 'cardSelectionVersion',
      };
      const configKey = keyMap[componentId];
      return configKey ? config[configKey] as 1 | 2 | 3 | 4 | 5 | 6 : 1;
    },
    isModalOpen: isSettingsOpen || isComparatorOpen,
  });

  // Additional keyboard shortcuts for compare action
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (isSettingsOpen) return;

      if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey && selectedProducts.length >= 2) {
        e.preventDefault();
        setIsComparatorOpen(true);
      }
      if (e.key === 'Escape') {
        setIsComparatorOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProducts.length, isSettingsOpen]);

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
      {/* Toast de shortcuts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium ${
              toast.type === 'version'
                ? 'bg-[#4654CD] text-white'
                : toast.type === 'navigation'
                ? 'bg-neutral-800 text-white'
                : 'bg-white text-neutral-800 border border-neutral-200'
            }`}
          >
            {toast.type === 'version' && <Layers className="w-4 h-4" />}
            {toast.type === 'navigation' && <Navigation className="w-4 h-4" />}
            {toast.type === 'info' && <Info className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcut Help Badge */}
      <div className="fixed top-20 right-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-md px-3 py-2 border border-neutral-200">
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Press ? for help</span>
        </div>
        <div className="text-xs font-medium text-[#4654CD]">
          Activo: {componentLabels[currentComponent] || currentComponent}
        </div>
      </div>

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
          cardSelectionVersion={config.cardSelectionVersion}
        />
      </main>

      {/* Compare Actions - Different versions based on accessVersion */}
      {config.accessVersion === 1 && (
        <CompareActions
          products={selectedProducts}
          onCompare={handleCompare}
          onClear={handleClearAll}
          maxProducts={maxProducts}
        />
      )}
      {config.accessVersion === 2 && (
        <CompareActionsFAB
          products={selectedProducts}
          onCompare={handleCompare}
          onClear={handleClearAll}
          maxProducts={maxProducts}
        />
      )}
      {config.accessVersion === 3 && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <ComparisonTray
            products={selectedProducts}
            onRemove={handleRemoveProduct}
            onCompare={handleCompare}
            maxProducts={maxProducts}
          />
        </div>
      )}
      {config.accessVersion === 4 && (
        /* V4: Header button - shown in header area */
        <div className="fixed top-20 right-6 z-50">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleCompare}
              disabled={selectedProducts.length < 2}
              className="flex items-center gap-2 bg-[#4654CD] text-white px-4 py-2 rounded-xl shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Scale className="w-4 h-4" />
              Comparar ({selectedProducts.length})
            </button>
          )}
        </div>
      )}
      {config.accessVersion === 5 && (
        /* V5: Minimal chip - compact inline */
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleCompare}
              disabled={selectedProducts.length < 2}
              className="flex items-center gap-2 bg-white border border-[#4654CD] text-[#4654CD] px-6 py-3 rounded-full shadow-lg cursor-pointer hover:bg-[#4654CD]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Scale className="w-5 h-5" />
              <span className="font-medium">{selectedProducts.length} equipos</span>
              <span className="bg-[#4654CD] text-white px-2 py-0.5 rounded-full text-sm">Comparar</span>
            </button>
          )}
        </div>
      )}
      {config.accessVersion === 6 && (
        /* V6: Full bottom bar with product names */
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#4654CD] to-[#4654CD]/90 text-white p-4">
          {selectedProducts.length > 0 ? (
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Scale className="w-6 h-6" />
                <div>
                  <p className="font-semibold">{selectedProducts.length} equipos seleccionados</p>
                  <p className="text-sm text-white/80">
                    {selectedProducts.map(p => p.brand).join(' vs ')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 cursor-pointer transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleCompare}
                  disabled={selectedProducts.length < 2}
                  className="px-6 py-2 rounded-lg bg-white text-[#4654CD] font-semibold cursor-pointer hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  Comparar ahora
                </button>
              </div>
            </div>
          ) : (
            <div className="container mx-auto text-center py-2">
              <p className="text-white/80">Selecciona equipos para comparar</p>
            </div>
          )}
        </div>
      )}

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
