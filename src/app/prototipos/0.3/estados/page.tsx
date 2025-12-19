'use client';

/**
 * Estados Vacíos Preview Page
 * Section 07: Estado Vacío
 *
 * Permite probar diferentes escenarios y versiones del estado vacío
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { EmptyStateV1, EmptyStateV2, EmptyStateV3 } from './components/empty';
import { SuggestionsPanel } from './components/empty/SuggestionsPanel';
import { EstadosSettingsModal } from './components/EstadosSettingsModal';
import {
  EmptyStateConfig,
  EmptyStateScenario,
  defaultEmptyStateConfig,
  emptyStateScenarios,
  mockSuggestedProducts,
} from './types/estados';
import { FloatingControls } from '@/app/prototipos/_shared/components/FloatingControls';

export default function EstadosPage() {
  const [config, setConfig] = useState<EmptyStateConfig>(defaultEmptyStateConfig);
  const [selectedScenario, setSelectedScenario] = useState<EmptyStateScenario>(
    emptyStateScenarios[1] // Start with "Strict Filters" scenario
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Render empty state based on version
  const renderEmptyState = () => {
    const commonProps = {
      config,
      activeFilters: selectedScenario.activeFilters,
      filterDescription: selectedScenario.filterDescription,
      onClearFilters: () => console.log('Clear filters'),
      onExpandPriceRange: () => console.log('Expand price range'),
    };

    switch (config.visualVersion) {
      case 1:
        return <EmptyStateV1 {...commonProps} />;
      case 2:
        return <EmptyStateV2 {...commonProps} />;
      case 3:
        return <EmptyStateV3 {...commonProps} onViewPopular={() => console.log('View popular')} />;
      default:
        return <EmptyStateV1 {...commonProps} />;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Back to prototypes */}
      <div className="fixed top-4 left-4 z-[60]">
        <Link href="/prototipos/0.3">
          <Button
            variant="flat"
            size="sm"
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="bg-white shadow-md cursor-pointer"
          >
            Prototipos
          </Button>
        </Link>
      </div>

      {/* Floating Controls */}
      <FloatingControls
        config={{ config, scenario: selectedScenario.id }}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main content - Empty state simulation */}
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        {/* Simulated catalog header */}
        <div className="bg-white border-b border-neutral-200 px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-[#4654CD]/10 text-[#4654CD] text-sm font-medium rounded">
                V{config.visualVersion}
              </span>
              <span className="text-sm text-neutral-500">
                {config.visualVersion === 1
                  ? 'Estándar'
                  : config.visualVersion === 2
                  ? 'Ilustrado'
                  : 'Minimalista'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span>{selectedScenario.filterDescription}</span>
              <span className="text-neutral-300">|</span>
              <span>0 productos</span>
            </div>
          </div>
        </div>

        {/* Empty state area */}
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          {renderEmptyState()}

          {/* Suggestions */}
          {config.showSuggestions && (
            <div className="w-full max-w-6xl mx-auto px-4 pb-8">
              <SuggestionsPanel
                products={mockSuggestedProducts}
                maxProducts={config.suggestionsCount}
                animationLevel={config.animationLevel}
                onProductClick={(id) => console.log('Product clicked:', id)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <EstadosSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
        selectedScenario={selectedScenario}
        onScenarioChange={setSelectedScenario}
      />
    </div>
  );
}
