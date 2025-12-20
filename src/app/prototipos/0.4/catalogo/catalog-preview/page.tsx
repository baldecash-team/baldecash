'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense, useRef } from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { Settings, Code, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CatalogLayout } from '../components/catalog/CatalogLayout';
import { CatalogSettingsModal } from '../components/catalog/CatalogSettingsModal';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductCardSkeleton } from '../components/catalog/ProductCardSkeleton';
import { LoadMoreButton } from '../components/catalog/LoadMoreButton';
import { TokenCounter } from '@/components/ui/TokenCounter';
import {
  CatalogLayoutConfig,
  defaultCatalogConfig,
  FilterState,
  defaultFilterState,
  SortOption,
  SkeletonVersion,
  loadingDurationMs,
} from '../types/catalog';
import { sortProducts, getFilteredProducts } from '../data/mockCatalogData';

/**
 * Catalog Preview Page
 * Permite probar diferentes versiones de layout y filtros de marca
 */
export default function CatalogPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    }>
      <CatalogPreviewContent />
    </Suspense>
  );
}

function CatalogPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Config state
  const [config, setConfig] = useState<CatalogLayoutConfig>(() => {
    const layoutVersion = parseInt(searchParams.get('layout') || '1') as 1 | 2 | 3 | 4 | 5 | 6;
    const brandFilterVersion = parseInt(searchParams.get('brand') || '1') as 1 | 2 | 3 | 4 | 5 | 6;
    const cols = parseInt(searchParams.get('cols') || '3') as 3 | 4 | 5;

    return {
      ...defaultCatalogConfig,
      layoutVersion: [1, 2, 3, 4, 5, 6].includes(layoutVersion) ? layoutVersion : 1,
      brandFilterVersion: [1, 2, 3, 4, 5, 6].includes(brandFilterVersion) ? brandFilterVersion : 1,
      productsPerRow: {
        ...defaultCatalogConfig.productsPerRow,
        desktop: [3, 4, 5].includes(cols) ? cols : 3,
      },
    };
  });

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [sort, setSort] = useState<SortOption>('recommended');

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

  // Pagination state - 4 rows initially, 2 rows per load
  const INITIAL_ROWS = 4;
  const ROWS_PER_LOAD = 2;
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);

  // Update URL when config changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('layout', config.layoutVersion.toString());
    params.set('brand', config.brandFilterVersion.toString());
    params.set('cols', config.productsPerRow.desktop.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [config, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          setConfig((prev) => ({ ...prev, layoutVersion: parseInt(e.key) as 1 | 2 | 3 | 4 | 5 | 6 }));
          break;
        case 's':
        case 'S':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setIsSettingsOpen(true);
          }
          break;
        case 'Escape':
          setIsSettingsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = getFilteredProducts({
      brands: filters.brands,
      priceRange: filters.priceRange,
      quotaRange: filters.quotaRange,
      usage: filters.usage,
      ram: filters.ram,
      gama: filters.gama,
    });

    return sortProducts(products, sort);
  }, [filters, sort]);

  // Reset pagination and show loading state when filters change
  useEffect(() => {
    // Skip loading on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsLoading(true);
    setVisibleRows(INITIAL_ROWS);

    const loadingTime = loadingDurationMs[config.loadingDuration];
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadingTime);

    return () => clearTimeout(timer);
  }, [filters, sort, config.loadingDuration]);

  // Calculate visible products based on rows and columns
  const columnsCount = config.productsPerRow.desktop;
  const visibleProductsCount = visibleRows * columnsCount;
  const visibleProducts = filteredProducts.slice(0, visibleProductsCount);
  const hasMoreProducts = visibleProductsCount < filteredProducts.length;
  const remainingProducts = filteredProducts.length - visibleProductsCount;

  const handleLoadMore = useCallback(() => {
    setVisibleRows((prev) => prev + ROWS_PER_LOAD);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Catalog Layout with Products */}
      <CatalogLayout
        products={filteredProducts}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        config={config}
      >
        {isLoading
          ? // Show skeletons while loading
            Array.from({ length: visibleProductsCount }).map((_, index) => (
              <ProductCardSkeleton
                key={`skeleton-${index}`}
                version={config.skeletonVersion}
                index={index}
              />
            ))
          : // Show actual products
            visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => {
                  console.log('Add to cart:', product.id);
                }}
                onFavorite={() => {
                  console.log('Toggle favorite:', product.id);
                }}
              />
            ))}

        {/* Load More Button */}
        {!isLoading && hasMoreProducts && (
          <LoadMoreButton
            version={config.loadMoreVersion}
            remainingProducts={remainingProducts}
            totalProducts={filteredProducts.length}
            visibleProducts={visibleProducts.length}
            onLoadMore={handleLoadMore}
          />
        )}

        {/* Empty state */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              No encontramos equipos
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              Intenta ajustar los filtros para ver más opciones
            </p>
            <Button
              variant="bordered"
              onPress={() => setFilters(defaultFilterState)}
              className="cursor-pointer"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </CatalogLayout>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_02" version="0.4" />
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
            Layout: V{config.layoutVersion} | Marca: V{config.brandFilterVersion} | Skeleton: V{config.skeletonVersion} | LoadMore: V{config.loadMoreVersion}
          </p>
        </div>
      )}

      {/* Settings Modal */}
      <CatalogSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
