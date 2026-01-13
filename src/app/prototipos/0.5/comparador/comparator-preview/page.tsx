'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { Settings, Code, ArrowLeft, Scale, Keyboard } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ComparatorConfig,
  defaultComparatorConfig,
  ComparisonState,
  defaultComparisonState,
  MAX_COMPARE_PRODUCTS,
} from '../types/comparator';
import {
  ComparatorV1,
  ComparatorV2,
  ComparatorSettingsModal,
  ProductSelector,
  CompareFloatingBar,
} from '../components/comparator';
import { availableProducts, getProductsByIds } from '../data/mockComparatorData';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton, Toast, useToast } from '@/app/prototipos/_shared';
import type { ToastType } from '@/app/prototipos/_shared';

/**
 * Comparator Preview Page v0.5
 * Permite probar diferentes versiones del comparador (V1-V2)
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
  const isCleanMode = searchParams.get('mode') === 'clean';

  // Config state - parse from URL params
  const [config, setConfig] = useState<ComparatorConfig>(() => {
    const parseVersion = (value: string | null): 1 | 2 => {
      if (!value) return 1;
      const num = parseInt(value, 10);
      return (num === 1 || num === 2) ? num : 1;
    };

    // Special parser for designStyle (V1-V3 exception)
    const parseDesignStyle = (value: string | null): 1 | 2 | 3 => {
      if (!value) return 1;
      const num = parseInt(value, 10);
      return (num >= 1 && num <= 3) ? num as 1 | 2 | 3 : 1;
    };

    return {
      ...defaultComparatorConfig,
      layoutVersion: parseVersion(searchParams.get('layout')),
      designStyle: parseDesignStyle(searchParams.get('design')),
      highlightVersion: parseVersion(searchParams.get('highlight')),
      fieldsVersion: parseVersion(searchParams.get('fields')),
      priceDiffVersion: parseVersion(searchParams.get('pricediff')),
    };
  });

  // Comparison state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(['prod-1', 'prod-2', 'prod-3']);
  const [comparisonState, setComparisonState] = useState<ComparisonState>(defaultComparisonState);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast(2000);
  const [currentComponent, setCurrentComponent] = useState<string>('layout');

  const componentLabels: Record<string, string> = {
    layout: 'Layout',
    design: 'Diseño',
    highlight: 'Resaltado',
    fields: 'Campos',
    priceDiff: 'Precio',
  };

  const componentOrder = ['layout', 'design', 'highlight', 'fields', 'priceDiff'];

  // Get selected products
  const selectedProducts = useMemo(() =>
    getProductsByIds(selectedProductIds),
    [selectedProductIds]
  );

  // Update URL when config changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (config.layoutVersion !== defaultComparatorConfig.layoutVersion) {
      params.set('layout', config.layoutVersion.toString());
    }
    if (config.designStyle !== defaultComparatorConfig.designStyle) {
      params.set('design', config.designStyle.toString());
    }
    if (config.highlightVersion !== defaultComparatorConfig.highlightVersion) {
      params.set('highlight', config.highlightVersion.toString());
    }
    if (config.fieldsVersion !== defaultComparatorConfig.fieldsVersion) {
      params.set('fields', config.fieldsVersion.toString());
    }
    if (config.priceDiffVersion !== defaultComparatorConfig.priceDiffVersion) {
      params.set('pricediff', config.priceDiffVersion.toString());
    }

    if (isCleanMode) {
      params.set('mode', 'clean');
    }

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  }, [config, router, isCleanMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (isSettingsOpen || isComparatorOpen) return;

      const currentIndex = componentOrder.indexOf(currentComponent);

      // Tab navigation
      if (e.key === 'Tab') {
        e.preventDefault();
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + componentOrder.length) % componentOrder.length
          : (currentIndex + 1) % componentOrder.length;
        const nextComponent = componentOrder[nextIndex];
        setCurrentComponent(nextComponent);
        showToast(`Componente: ${componentLabels[nextComponent]}`, 'navigation');
        return;
      }

      // Number keys for version change (1-2 for most, 1-3 for designStyle)
      if (['1', '2', '3'].includes(e.key)) {
        const version = parseInt(e.key);
        const keyMap: Record<string, keyof ComparatorConfig> = {
          layout: 'layoutVersion',
          design: 'designStyle',
          highlight: 'highlightVersion',
          fields: 'fieldsVersion',
          priceDiff: 'priceDiffVersion',
        };
        const configKey = keyMap[currentComponent];
        if (configKey) {
          // designStyle supports V1-V3, others only V1-V2
          const maxVersion = currentComponent === 'design' ? 3 : 2;
          if (version <= maxVersion) {
            setConfig(prev => ({ ...prev, [configKey]: version as 1 | 2 | 3 }));
            showToast(`${componentLabels[currentComponent]}: V${version}`, 'version');
          }
        }
        return;
      }

      // ? or K for settings
      if (e.key === '?' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setIsSettingsOpen(prev => !prev);
        return;
      }

      // C for compare
      if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey && selectedProducts.length >= 2) {
        e.preventDefault();
        setIsComparatorOpen(true);
        return;
      }

      // Escape to close
      if (e.key === 'Escape') {
        setIsComparatorOpen(false);
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentComponent, isSettingsOpen, isComparatorOpen, selectedProducts.length, showToast]);

  // Handlers
  const handleSelectProduct = useCallback((productId: string) => {
    if (selectedProductIds.length < MAX_COMPARE_PRODUCTS) {
      setSelectedProductIds((prev) => [...prev, productId]);
    }
  }, [selectedProductIds.length]);

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

  // Render comparator based on layoutVersion
  const renderComparator = () => {
    const commonProps = {
      products: selectedProducts,
      config,
      onRemoveProduct: handleRemoveProduct,
      onClearAll: handleClearAll,
      comparisonState,
      onStateChange: setComparisonState,
      isOpen: isComparatorOpen,
      onClose: () => setIsComparatorOpen(false),
    };

    switch (config.layoutVersion) {
      case 1:
        return <ComparatorV1 {...commonProps} />;
      case 2:
        return <ComparatorV2 {...commonProps} />;
      default:
        return <ComparatorV1 {...commonProps} />;
    }
  };

  // Clean mode - only render content + feedback button
  if (isCleanMode) {
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
                    Selecciona hasta {MAX_COMPARE_PRODUCTS} equipos para comparar
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">
                  {selectedProductIds.length} seleccionados
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-2">
              Equipos Disponibles
            </h2>
            <p className="text-sm text-neutral-500">
              Haz clic en los equipos que deseas comparar
            </p>
          </div>

          <ProductSelector
            products={availableProducts.slice(0, 12)}
            selectedIds={selectedProductIds}
            onSelect={handleSelectProduct}
            onDeselect={handleDeselectProduct}
            maxProducts={MAX_COMPARE_PRODUCTS}
          />
        </main>

        {/* Compare Floating Bar */}
        <CompareFloatingBar
          selectedProducts={selectedProducts}
          onCompare={handleCompare}
          onClear={handleClearAll}
          maxProducts={MAX_COMPARE_PRODUCTS}
        />

        {/* Comparator */}
        {renderComparator()}

        {/* Feedback Button */}
        <FeedbackButton
          sectionId="comparador"
        />
      </div>
    );
  }

  // Normal mode - full UI
  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Toast de shortcuts */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type as ToastType}
          isVisible={isToastVisible}
          onClose={hideToast}
          duration={2000}
          position="top"
        />
      )}

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
                  Selecciona hasta {MAX_COMPARE_PRODUCTS} equipos para comparar
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">
            Equipos Disponibles
          </h2>
          <p className="text-sm text-neutral-500">
            Haz clic en los equipos que deseas comparar
          </p>
        </div>

        <ProductSelector
          products={availableProducts.slice(0, 12)}
          selectedIds={selectedProductIds}
          onSelect={handleSelectProduct}
          onDeselect={handleDeselectProduct}
          maxProducts={MAX_COMPARE_PRODUCTS}
        />
      </main>

      {/* Compare Floating Bar */}
      <CompareFloatingBar
        selectedProducts={selectedProducts}
        onCompare={handleCompare}
        onClear={handleClearAll}
        maxProducts={MAX_COMPARE_PRODUCTS}
      />

      {/* Comparator */}
      {renderComparator()}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_05" version="0.5" />
        <Button
          isIconOnly
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
          style={{ borderRadius: '14px' }}
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
          onPress={() => router.push('/prototipos/0.5')}
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
      </div>

      {/* Config Badge */}
      {showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
          <p className="text-xs font-mono text-neutral-700">
            Layout: V{config.layoutVersion} | Diseño: V{config.designStyle} | Highlight: V{config.highlightVersion} | Campos: V{config.fieldsVersion} | Precio: V{config.priceDiffVersion}
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
