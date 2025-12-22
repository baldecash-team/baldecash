'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Spinner } from '@nextui-org/react';
import { Settings, Code, ArrowLeft } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
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
