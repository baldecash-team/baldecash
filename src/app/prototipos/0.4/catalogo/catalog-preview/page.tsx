'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense, useRef } from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { Settings, Code, ArrowLeft, ArrowUp } from 'lucide-react';
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
  LoadingDuration,
  LoadMoreVersion,
  ImageGalleryVersion,
  GallerySizeVersion,
  TechnicalFiltersVersion,
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
    const technicalFiltersVersion = parseInt(searchParams.get('techfilters') || '1') as TechnicalFiltersVersion;
    const cols = parseInt(searchParams.get('cols') || '3') as 3 | 4 | 5;
    const skeletonVersion = parseInt(searchParams.get('skeleton') || '1') as SkeletonVersion;
    const loadingDuration = (searchParams.get('duration') || 'default') as LoadingDuration;
    const loadMoreVersion = parseInt(searchParams.get('loadmore') || '1') as LoadMoreVersion;
    const imageGalleryVersion = parseInt(searchParams.get('gallery') || '1') as ImageGalleryVersion;
    const gallerySizeVersion = parseInt(searchParams.get('gallerysize') || '2') as GallerySizeVersion;

    return {
      ...defaultCatalogConfig,
      layoutVersion: [1, 2, 3, 4, 5, 6].includes(layoutVersion) ? layoutVersion : 1,
      brandFilterVersion: [1, 2, 3, 4, 5, 6].includes(brandFilterVersion) ? brandFilterVersion : 1,
      technicalFiltersVersion: [1, 2, 3].includes(technicalFiltersVersion) ? technicalFiltersVersion : 1,
      skeletonVersion: [1, 2, 3].includes(skeletonVersion) ? skeletonVersion : 1,
      loadingDuration: ['default', '30s', '60s'].includes(loadingDuration) ? loadingDuration : 'default',
      loadMoreVersion: [1, 2, 3].includes(loadMoreVersion) ? loadMoreVersion : 1,
      imageGalleryVersion: [1, 2, 3].includes(imageGalleryVersion) ? imageGalleryVersion : 1,
      gallerySizeVersion: [1, 2, 3].includes(gallerySizeVersion) ? gallerySizeVersion : 2,
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
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading state for "load more"
  const [showScrollTop, setShowScrollTop] = useState(false); // Show scroll to top button
  const isFirstRender = useRef(true);

  // Scroll detection for "scroll to top" button
  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down more than 400px
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Pagination state - 4 rows initially, 2 rows per load
  const INITIAL_ROWS = 4;
  const ROWS_PER_LOAD = 2;
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  const [pendingRows, setPendingRows] = useState(0); // Rows being loaded

  // Update URL when config changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('layout', config.layoutVersion.toString());
    params.set('brand', config.brandFilterVersion.toString());
    params.set('techfilters', config.technicalFiltersVersion.toString());
    params.set('cols', config.productsPerRow.desktop.toString());
    params.set('skeleton', config.skeletonVersion.toString());
    params.set('duration', config.loadingDuration);
    params.set('loadmore', config.loadMoreVersion.toString());
    params.set('gallery', config.imageGalleryVersion.toString());
    params.set('gallerysize', config.gallerySizeVersion.toString());
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

  // Reset pagination and show loading state when filters change (including initial load)
  useEffect(() => {
    // On first render, just start the loading timer (isLoading already true)
    // On subsequent renders, set loading state
    if (!isFirstRender.current) {
      setIsLoading(true);
      setVisibleRows(INITIAL_ROWS);
    }
    isFirstRender.current = false;

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
    // Start loading animation
    setIsLoadingMore(true);
    setPendingRows(ROWS_PER_LOAD);

    // Simulate loading time based on config
    const loadingTime = loadingDurationMs[config.loadingDuration];
    setTimeout(() => {
      setVisibleRows((prev) => prev + ROWS_PER_LOAD);
      setPendingRows(0);
      setIsLoadingMore(false);
    }, loadingTime);
  }, [config.loadingDuration]);

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
          ? // Show skeletons while initial loading
            Array.from({ length: visibleProductsCount }).map((_, index) => (
              <ProductCardSkeleton
                key={`skeleton-${index}`}
                version={config.skeletonVersion}
                index={index}
              />
            ))
          : // Show actual products + loading skeletons for "load more"
            <>
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  imageGalleryVersion={config.imageGalleryVersion}
                  gallerySizeVersion={config.gallerySizeVersion}
                  onAddToCart={() => {
                    console.log('Add to cart:', product.id);
                  }}
                  onFavorite={() => {
                    console.log('Toggle favorite:', product.id);
                  }}
                  onViewDetail={() => {
                    console.log('View detail:', product.id);
                    // TODO: Navigate to product detail page
                  }}
                />
              ))}
              {/* Show skeletons for products being loaded */}
              {isLoadingMore && pendingRows > 0 &&
                Array.from({ length: pendingRows * columnsCount }).map((_, index) => (
                  <ProductCardSkeleton
                    key={`loading-more-skeleton-${index}`}
                    version={config.skeletonVersion}
                    index={index}
                  />
                ))
              }
            </>
        }

        {/* Load More Button - hidden while loading more */}
        {!isLoading && !isLoadingMore && hasMoreProducts && (
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
        {/* Scroll to Top Button - appears on scroll */}
        {showScrollTop && (
          <Button
            isIconOnly
            radius="md"
            className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-all hover:scale-110"
            onPress={scrollToTop}
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        )}
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
            Layout: V{config.layoutVersion} | Marca: V{config.brandFilterVersion} | Filtros: V{config.technicalFiltersVersion} | Skeleton: V{config.skeletonVersion} | LoadMore: V{config.loadMoreVersion} | Gallery: V{config.imageGalleryVersion} | Size: V{config.gallerySizeVersion}
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
