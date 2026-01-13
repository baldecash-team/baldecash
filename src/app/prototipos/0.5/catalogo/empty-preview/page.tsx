'use client';

/**
 * Empty State Preview v0.5
 * Basado en v0.4 con configuración fija:
 * - Illustration: V5 (Split Layout)
 * - Actions: V6 (CTA Grande)
 *
 * Sin iteraciones - diseño único optimizado
 */

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, Code, Sparkles, ArrowRight } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton } from '@/app/prototipos/_shared';

// Empty state component
import { EmptyState } from '../components/empty';

// Types
import { AppliedFilter, EmptyStateConfig } from '../types/empty';

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

// Fixed config for v0.5
const fixedConfig: EmptyStateConfig = {
  illustrationVersion: 5,
  actionsVersion: 6,
};

export default function EmptyStatePreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <Spinner size="lg" color="primary" />
        </div>
      }
    >
      <EmptyStatePreviewContent />
    </Suspense>
  );
}

function EmptyStatePreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>(mockAppliedFilters);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  const detailUrl = isCleanMode
    ? '/prototipos/0.5/producto/detail-preview?mode=clean'
    : '/prototipos/0.5/producto/detail-preview';

  // Handlers
  const handleClearFilters = () => {
    setAppliedFilters([]);
  };

  const handleRemoveFilter = (key: string) => {
    setAppliedFilters((prev) => prev.filter((f) => f.key !== key));
  };

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Header - hidden in clean mode */}
      {!isCleanMode && (
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
      )}

      {/* Main Content */}
      <main className={`container mx-auto px-4 ${isCleanMode ? 'py-16' : 'py-8'}`}>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm min-h-[500px] flex items-center justify-center">
          <EmptyState
            appliedFilters={appliedFilters}
            onClearFilters={handleClearFilters}
            onRemoveFilter={handleRemoveFilter}
            totalProductsIfExpanded={24}
            config={fixedConfig}
          />
        </div>

        {/* Restaurar filtros demo */}
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

      {/* Floating Action Buttons - hidden in clean mode */}
      {!isCleanMode && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
          <TokenCounter sectionId="PROMPT_07" version="0.5" />
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
      )}

      {/* Clean mode: FeedbackButton */}
      {isCleanMode && (
        <FeedbackButton
          sectionId="estados-vacios"
        />
      )}

      {/* Config Badge - hidden in clean mode */}
      {!isCleanMode && showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Configuración fija v0.5:</p>
          <p className="text-xs font-mono text-neutral-700">
            Ilustración: V5 (Split) | Acciones: V6 (CTA Grande)
          </p>
          <p className="text-xs text-neutral-400 mt-1">Sin iteraciones</p>
        </div>
      )}
    </div>
  );
}
