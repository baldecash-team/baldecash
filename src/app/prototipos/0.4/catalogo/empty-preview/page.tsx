'use client';

import React, { useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Spinner } from '@nextui-org/react';
import { Settings, Code, ArrowLeft, Sparkles, ArrowRight, Layers, Keyboard, Navigation } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { useKeyboardShortcuts } from '@/app/prototipos/_shared';
import {
  EmptyState,
  EmptyStateSettingsModal,
} from '../components/empty';
import {
  EmptyStateConfig,
  defaultEmptyStateConfig,
  AppliedFilter,
} from '../types/empty';

// Mock de filtros aplicados para demostración
const mockAppliedFilters: AppliedFilter[] = [
  { key: 'brand', label: 'Lenovo', value: 'lenovo' },
  { key: 'price', label: 'S/1,500 - S/2,000', value: [1500, 2000] },
  { key: 'ram', label: '16GB RAM', value: 16 },
  { key: 'usage', label: 'Gaming', value: 'gaming' },
];

// Mock de productos relacionados
const relatedProducts = [
  {
    id: 1,
    brand: 'LENOVO',
    name: 'IdeaPad 3 15" AMD Ryzen 5',
    price: 89,
    gama: 'Gama Media',
    gamaColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 2,
    brand: 'HP',
    name: 'HP 15 Intel Core i5 12th Gen',
    price: 79,
    gama: 'Gama Media',
    gamaColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 3,
    brand: 'ACER',
    name: 'Aspire 5 AMD Ryzen 7',
    price: 99,
    gama: 'Gama Alta',
    gamaColor: 'bg-purple-100 text-purple-700',
  },
];

const detailUrl = '/prototipos/0.4/producto/detail-preview/?infoHeader=1&gallery=1&tabs=1&specs=1&pricing=1&cronograma=1&similar=1&limitations=1&certifications=1';

function EmptyStatePreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Config desde URL params
  const [config, setConfig] = useState<EmptyStateConfig>(() => {
    const illustration = parseInt(searchParams.get('illustration') || '1');
    const actions = parseInt(searchParams.get('actions') || '1');

    return {
      illustrationVersion: (illustration >= 1 && illustration <= 6 ? illustration : 1) as 1 | 2 | 3 | 4 | 5 | 6,
      actionsVersion: (actions >= 1 && actions <= 6 ? actions : 1) as 1 | 2 | 3 | 4 | 5 | 6,
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>(mockAppliedFilters);
  const [toast, setToast] = useState<{ message: string; type: 'version' | 'navigation' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'version' | 'navigation' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const componentLabels: Record<string, string> = {
    illustration: 'Ilustración',
    actions: 'Acciones',
  };

  // Keyboard shortcuts
  const { currentComponent } = useKeyboardShortcuts({
    componentOrder: ['illustration', 'actions'],
    onVersionChange: (componentId, version) => {
      const keyMap: Record<string, keyof EmptyStateConfig> = {
        illustration: 'illustrationVersion',
        actions: 'actionsVersion',
      };
      const configKey = keyMap[componentId];
      if (configKey) {
        const newConfig = { ...config, [configKey]: version };
        updateConfig(newConfig);
        showToast(`${componentLabels[componentId]}: V${version}`, 'version');
      }
    },
    onNavigate: (componentId) => {
      showToast(`Componente: ${componentLabels[componentId] || componentId}`, 'navigation');
    },
    onToggleSettings: () => setIsSettingsOpen(prev => !prev),
    getCurrentVersion: (componentId) => {
      const keyMap: Record<string, keyof EmptyStateConfig> = {
        illustration: 'illustrationVersion',
        actions: 'actionsVersion',
      };
      const configKey = keyMap[componentId];
      return configKey ? config[configKey] : 1;
    },
    isModalOpen: isSettingsOpen,
  });

  // Actualizar URL cuando cambia config
  const updateConfig = (newConfig: EmptyStateConfig) => {
    setConfig(newConfig);
    const params = new URLSearchParams();
    params.set('illustration', newConfig.illustrationVersion.toString());
    params.set('actions', newConfig.actionsVersion.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Handlers para las acciones del EmptyState
  const handleClearFilters = () => {
    setAppliedFilters([]);
    // En producción, esto redireccionaría al catálogo sin filtros
  };

  const handleExpandPriceRange = () => {
    // En producción, esto expandiría el rango de precio
    setAppliedFilters((prev) =>
      prev.filter((f) => f.key !== 'price')
    );
  };

  const handleRemoveFilter = (key: string) => {
    setAppliedFilters((prev) => prev.filter((f) => f.key !== key));
  };

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
                : 'bg-neutral-800 text-white'
            }`}
          >
            {toast.type === 'version' ? <Layers className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
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
      <header className="bg-white border-b border-neutral-200 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-neutral-900">
            Estado Vacío - Preview
          </h1>
          <p className="text-neutral-600 mt-1">
            Componente que aparece cuando los filtros no devuelven resultados
          </p>
        </div>
      </header>

      {/* Main Content - Simula el área del catálogo */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm min-h-[500px] flex items-center justify-center">
          <EmptyState
            appliedFilters={appliedFilters}
            onClearFilters={handleClearFilters}
            onExpandPriceRange={handleExpandPriceRange}
            onRemoveFilter={handleRemoveFilter}
            totalProductsIfExpanded={24}
            config={config}
          />
        </div>

        {/* Filtros demo (para resetear) */}
        {appliedFilters.length === 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="bordered"
              className="border-[#4654CD] text-[#4654CD] cursor-pointer"
              onPress={() => setAppliedFilters(mockAppliedFilters)}
            >
              Restaurar filtros de ejemplo
            </Button>
          </div>
        )}

        {/* Productos relacionados */}
        <section className="mt-12 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[#4654CD]" />
            <h2 className="text-xl font-semibold text-neutral-800">
              Productos que podrían interesarte
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md hover:border-[#4654CD]/30 transition-all cursor-pointer"
                onClick={() => router.push(detailUrl)}
              >
                <div className="flex gap-4">
                  {/* Placeholder image */}
                  <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold text-neutral-300">
                      {product.brand.charAt(0)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-neutral-500">
                        {product.brand}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${product.gamaColor}`}>
                        {product.gama}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-[#4654CD]">
                        S/{product.price}
                      </span>
                      <span className="text-sm text-neutral-500">/mes</span>
                    </div>
                  </div>
                </div>

                {/* Ver detalles link */}
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <button
                    className="flex items-center gap-1 text-sm font-medium text-[#4654CD] hover:text-[#3a47b3] transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(detailUrl);
                    }}
                  >
                    Ver detalles
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_07" version="0.4" />
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

      {/* Config Badge */}
      {showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
          <p className="text-xs font-mono text-neutral-700">
            Ilustración: V{config.illustrationVersion} | Acciones: V{config.actionsVersion}
          </p>
        </div>
      )}

      {/* Settings Modal */}
      <EmptyStateSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={updateConfig}
      />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Spinner size="lg" color="primary" />
    </div>
  );
}

export default function EmptyStatePreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmptyStatePreviewContent />
    </Suspense>
  );
}
