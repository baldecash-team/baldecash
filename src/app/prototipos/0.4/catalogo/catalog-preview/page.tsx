'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense, useRef } from 'react';
import { Button, Spinner, Chip } from '@nextui-org/react';
import { Settings, Code, ArrowLeft, ArrowUp, Sparkles, ArrowRight, GitCompare, X, Keyboard, Navigation, Layers, Info } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CatalogLayout } from '../components/catalog/CatalogLayout';
import { CatalogSettingsModal } from '../components/catalog/CatalogSettingsModal';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductCardSkeleton } from '../components/catalog/ProductCardSkeleton';
import { LoadMoreButton } from '../components/catalog/LoadMoreButton';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { useCatalogKeyboardShortcuts } from '../hooks/useCatalogKeyboardShortcuts';
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
  ProductCardVersion,
  TagDisplayVersion,
  loadingDurationMs,
  PricingMode,
  TermMonths,
  InitialPaymentPercent,
  termOptions,
  initialOptions,
  pricingModeLabels,
} from '../types/catalog';
import { sortProducts, getFilteredProducts, getFilterCounts, mockProducts } from '../data/mockCatalogData';
import { EmptyState } from '../components/empty';
import { AppliedFilter } from '../types/empty';
import { ProductComparator } from '../../comparador/components/comparator/ProductComparator';
import {
  ComparatorConfig,
  ComparisonState,
  defaultComparisonState,
  ComparisonProduct,
} from '../../comparador/types/comparator';
import { HelpQuiz } from '../../quiz/components/quiz';
import { HelpCircle } from 'lucide-react';
import { useIsMobile } from '@/app/prototipos/_shared';

// URL del detalle de producto
const detailUrl = '/prototipos/0.4/producto/detail-preview/?infoHeader=1&gallery=1&tabs=1&specs=1&pricing=1&cronograma=1&similar=1&limitations=1&certifications=1';

// Configuración del comparador (basada en la URL especificada)
const comparatorConfig: ComparatorConfig = {
  layoutVersion: 3,        // Panel Sticky
  accessVersion: 1,        // Checkbox en Cards
  maxProductsVersion: 4,   // Máximo 4 productos
  fieldsVersion: 2,        // Specs + Features
  highlightVersion: 1,     // Semántico clásico
  priceDiffVersion: 4,     // Badge Animado
  differenceHighlightVersion: 5, // Subrayado Animado
  cardSelectionVersion: 3, // Glow + Ribbon
  defaultTerm: 24,
  defaultInitial: 10,
};

const MAX_COMPARE_PRODUCTS = 3;

// Mock de productos relacionados para el empty state
const relatedProducts = [
  { id: 1, brand: 'LENOVO', name: 'IdeaPad 3 15" AMD Ryzen 5', price: 89, gama: 'Gama Media', gamaColor: 'bg-blue-100 text-blue-700' },
  { id: 2, brand: 'HP', name: 'HP 15 Intel Core i5 12th Gen', price: 79, gama: 'Gama Media', gamaColor: 'bg-blue-100 text-blue-700' },
  { id: 3, brand: 'ACER', name: 'Aspire 5 AMD Ryzen 7', price: 99, gama: 'Gama Alta', gamaColor: 'bg-purple-100 text-purple-700' },
];

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
    const cardVersion = parseInt(searchParams.get('card') || '1') as ProductCardVersion;
    const technicalFiltersVersion = parseInt(searchParams.get('techfilters') || '1') as TechnicalFiltersVersion;
    const cols = parseInt(searchParams.get('cols') || '3') as 3 | 4 | 5;
    const skeletonVersion = parseInt(searchParams.get('skeleton') || '1') as SkeletonVersion;
    const loadingDuration = (searchParams.get('duration') || 'default') as LoadingDuration;
    const loadMoreVersion = parseInt(searchParams.get('loadmore') || '1') as LoadMoreVersion;
    const imageGalleryVersion = parseInt(searchParams.get('gallery') || '1') as ImageGalleryVersion;
    const gallerySizeVersion = parseInt(searchParams.get('gallerysize') || '2') as GallerySizeVersion;
    const pricingMode = (searchParams.get('pricingmode') || 'interactive') as PricingMode;
    const defaultTerm = parseInt(searchParams.get('term') || '24') as TermMonths;
    const defaultInitial = parseInt(searchParams.get('initial') || '10') as InitialPaymentPercent;
    const tagDisplayVersion = parseInt(searchParams.get('tags') || '1') as TagDisplayVersion;
    const showPricingOptions = searchParams.get('pricingoptions') !== 'false';

    return {
      ...defaultCatalogConfig,
      layoutVersion: [1, 2, 3, 4, 5, 6].includes(layoutVersion) ? layoutVersion : 1,
      brandFilterVersion: [1, 2, 3, 4, 5, 6].includes(brandFilterVersion) ? brandFilterVersion : 1,
      cardVersion: [1, 2, 3, 4, 5, 6].includes(cardVersion) ? cardVersion : 1,
      technicalFiltersVersion: [1, 2, 3].includes(technicalFiltersVersion) ? technicalFiltersVersion : 1,
      skeletonVersion: [1, 2, 3].includes(skeletonVersion) ? skeletonVersion : 1,
      loadingDuration: ['default', '30s', '60s'].includes(loadingDuration) ? loadingDuration : 'default',
      loadMoreVersion: [1, 2, 3].includes(loadMoreVersion) ? loadMoreVersion : 1,
      imageGalleryVersion: [1, 2, 3].includes(imageGalleryVersion) ? imageGalleryVersion : 1,
      gallerySizeVersion: [1, 2, 3].includes(gallerySizeVersion) ? gallerySizeVersion : 2,
      tagDisplayVersion: [1, 2, 3].includes(tagDisplayVersion) ? tagDisplayVersion : 1,
      pricingMode: ['static', 'interactive'].includes(pricingMode) ? pricingMode : 'interactive',
      defaultTerm: (termOptions as readonly number[]).includes(defaultTerm) ? defaultTerm : 24,
      defaultInitial: (initialOptions as readonly number[]).includes(defaultInitial) ? defaultInitial : 10,
      showPricingOptions,
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

  // Comparison state
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [comparisonState, setComparisonState] = useState<ComparisonState>(defaultComparisonState);

  // Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const isMobile = useIsMobile();

  // Quiz config - V4 (bottom sheet) for mobile, V5 (clean modal) for desktop
  const quizConfig = {
    layoutVersion: (isMobile ? 4 : 5) as 4 | 5,
    questionCount: 7 as const,
    questionStyle: 1 as const,
    resultsVersion: 1 as const,
    focusVersion: 1 as const,
  };

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
    params.set('card', config.cardVersion.toString());
    params.set('techfilters', config.technicalFiltersVersion.toString());
    params.set('cols', config.productsPerRow.desktop.toString());
    params.set('skeleton', config.skeletonVersion.toString());
    params.set('duration', config.loadingDuration);
    params.set('loadmore', config.loadMoreVersion.toString());
    params.set('gallery', config.imageGalleryVersion.toString());
    params.set('gallerysize', config.gallerySizeVersion.toString());
    params.set('tags', config.tagDisplayVersion.toString());
    // Only include pricing params when they differ from defaults
    if (config.pricingMode !== 'interactive') {
      params.set('pricingmode', config.pricingMode);
    }
    if (config.defaultTerm !== 24) {
      params.set('term', config.defaultTerm.toString());
    }
    if (config.defaultInitial !== 10) {
      params.set('initial', config.defaultInitial.toString());
    }
    if (!config.showPricingOptions) {
      params.set('pricingoptions', 'false');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [config, router]);

  // Keyboard shortcuts with enhanced navigation
  const { activeComponentLabel, toast } = useCatalogKeyboardShortcuts({
    config,
    onConfigChange: setConfig,
    onOpenSettings: () => setIsSettingsOpen(true),
    onCloseSettings: () => setIsSettingsOpen(false),
    isSettingsOpen,
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = getFilteredProducts({
      brands: filters.brands,
      priceRange: filters.priceRange,
      quotaRange: filters.quotaRange,
      usage: filters.usage,
      ram: filters.ram,
      storage: filters.storage,
      storageType: filters.storageType,
      processorBrand: filters.processorBrand,
      displaySize: filters.displaySize,
      displayType: filters.displayType,
      resolution: filters.resolution,
      refreshRate: filters.refreshRate,
      gpuType: filters.gpuType,
      touchScreen: filters.touchScreen,
      ramExpandable: filters.ramExpandable,
      backlitKeyboard: filters.backlitKeyboard,
      numericKeypad: filters.numericKeypad,
      fingerprint: filters.fingerprint,
      hasWindows: filters.hasWindows,
      hasThunderbolt: filters.hasThunderbolt,
      hasEthernet: filters.hasEthernet,
      hasSDCard: filters.hasSDCard,
      hasHDMI: filters.hasHDMI,
      minUSBPorts: filters.minUSBPorts,
      gama: filters.gama,
      condition: filters.condition,
      stock: filters.stock,
    });

    return sortProducts(products, sort);
  }, [filters, sort]);

  // Calculate dynamic filter counts based on all products (not filtered)
  // This shows how many products WOULD match if we added that filter
  const filterCounts = useMemo(() => {
    return getFilterCounts(mockProducts);
  }, []);

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

  // Convert current filters to AppliedFilter format for EmptyState
  const appliedFilters = useMemo((): AppliedFilter[] => {
    const result: AppliedFilter[] = [];

    if (filters.brands.length > 0) {
      filters.brands.forEach(brand => {
        result.push({ key: 'brand', label: brand.charAt(0).toUpperCase() + brand.slice(1), value: brand });
      });
    }
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
      result.push({ key: 'price', label: `S/${filters.priceRange[0]} - S/${filters.priceRange[1]}`, value: filters.priceRange });
    }
    if (filters.ram.length > 0) {
      filters.ram.forEach(ram => {
        result.push({ key: 'ram', label: `${ram}GB RAM`, value: ram });
      });
    }
    if (filters.usage.length > 0) {
      const usageLabels: Record<string, string> = { office: 'Oficina', gaming: 'Gaming', creative: 'Creativo', student: 'Estudiante' };
      filters.usage.forEach(u => {
        result.push({ key: 'usage', label: usageLabels[u] || u, value: u });
      });
    }
    if (filters.gama.length > 0) {
      const gamaLabels: Record<string, string> = { economica: 'Económica', estudiante: 'Estudiante', profesional: 'Profesional', creativa: 'Creativa', gamer: 'Gamer' };
      filters.gama.forEach(g => {
        result.push({ key: 'gama', label: gamaLabels[g] || g, value: g });
      });
    }
    if (filters.processorBrand.length > 0) {
      filters.processorBrand.forEach(p => {
        result.push({ key: 'processorBrand', label: p.toUpperCase(), value: p });
      });
    }

    return result;
  }, [filters]);

  // Handler to remove a specific filter
  const handleRemoveFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (key === 'brand') newFilters.brands = [];
      if (key === 'price') newFilters.priceRange = [0, 10000];
      if (key === 'ram') newFilters.ram = [];
      if (key === 'usage') newFilters.usage = [];
      if (key === 'gama') newFilters.gama = [];
      if (key === 'processorBrand') newFilters.processorBrand = [];
      return newFilters;
    });
  }, []);

  // Comparison handlers
  const handleToggleCompare = useCallback((productId: string) => {
    setCompareList(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= MAX_COMPARE_PRODUCTS) {
        return prev; // Don't add if at max
      }
      return [...prev, productId];
    });
  }, []);

  const handleRemoveFromCompare = useCallback((productId: string) => {
    setCompareList(prev => prev.filter(id => id !== productId));
  }, []);

  const handleClearCompare = useCallback(() => {
    setCompareList([]);
    setIsComparatorOpen(false);
  }, []);

  // Get products for comparison
  const compareProducts = useMemo((): ComparisonProduct[] => {
    return compareList
      .map(id => filteredProducts.find(p => p.id === id) || mockProducts.find(p => p.id === id))
      .filter((p): p is ComparisonProduct => p !== undefined);
  }, [compareList, filteredProducts]);

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
        filterCounts={filterCounts}
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
                  cardVersion={config.cardVersion}
                  imageGalleryVersion={config.imageGalleryVersion}
                  gallerySizeVersion={config.gallerySizeVersion}
                  tagDisplayVersion={config.tagDisplayVersion}
                  pricingMode={config.pricingMode}
                  defaultTerm={config.defaultTerm}
                  defaultInitial={config.defaultInitial}
                  showPricingOptions={config.showPricingOptions}
                  onAddToCart={() => {
                    console.log('Add to cart:', product.id);
                  }}
                  onFavorite={() => {
                    console.log('Toggle favorite:', product.id);
                  }}
                  onViewDetail={() => {
                    router.push('/prototipos/0.4/producto/detail-preview/?infoHeader=1&gallery=1&tabs=1&specs=1&pricing=1&cronograma=1&similar=1&limitations=1&certifications=1');
                  }}
                  onCompare={() => handleToggleCompare(product.id)}
                  isCompareSelected={compareList.includes(product.id)}
                  compareDisabled={compareList.length >= MAX_COMPARE_PRODUCTS}
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

        {/* Empty state con EmptyState component (illustration=5, actions=6) */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              appliedFilters={appliedFilters}
              onClearFilters={() => setFilters(defaultFilterState)}
              onExpandPriceRange={() => setFilters(prev => ({ ...prev, priceRange: [0, 10000] }))}
              onRemoveFilter={handleRemoveFilter}
              totalProductsIfExpanded={mockProducts.length}
              config={{
                illustrationVersion: 5,
                actionsVersion: 6,
              }}
            />

            {/* Productos relacionados */}
            <section className="mt-8 mb-4 px-4">
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
                      <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl font-bold text-neutral-300">
                          {product.brand.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-neutral-500">{product.brand}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${product.gamaColor}`}>
                            {product.gama}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-neutral-800 line-clamp-2 mb-2">{product.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-[#4654CD]">S/{product.price}</span>
                          <span className="text-sm text-neutral-500">/mes</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      <button
                        className="flex items-center gap-1 text-sm font-medium text-[#4654CD] hover:text-[#3a47b3] transition-colors cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); router.push(detailUrl); }}
                      >
                        Ver detalles
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quiz CTA en Empty State */}
            <section className="mt-8 px-4">
              <div className="bg-gradient-to-r from-[#4654CD]/5 to-[#4654CD]/10 rounded-2xl p-6 border border-[#4654CD]/20">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#4654CD] flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                      ¿No encuentras lo que buscas?
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Nuestro asistente te ayuda a encontrar la laptop perfecta en menos de 2 minutos
                    </p>
                  </div>
                  <Button
                    className="bg-[#4654CD] text-white font-medium cursor-pointer hover:bg-[#3a47b3] transition-colors"
                    onPress={() => setIsQuizOpen(true)}
                    startContent={<HelpCircle className="w-4 h-4" />}
                  >
                    Iniciar asistente
                  </Button>
                </div>
              </div>
            </section>
          </div>
        )}
      </CatalogLayout>

      {/* Floating Comparison Bar - bottom-24 for V3/V4 mobile (filters at bottom) */}
      {compareList.length > 0 && !isComparatorOpen && (
        <div className={`fixed left-1/2 -translate-x-1/2 z-[90] bg-white rounded-xl shadow-xl border border-neutral-200 px-4 py-3 flex items-center gap-4 ${
          config.layoutVersion === 3 ? 'bottom-24' : config.layoutVersion === 4 ? 'bottom-24 lg:bottom-6' : 'bottom-6'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
              <GitCompare className="w-4 h-4 text-[#4654CD]" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">
                {compareList.length} producto{compareList.length !== 1 ? 's' : ''} seleccionado{compareList.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-neutral-500">
                Máximo 3 productos
              </p>
            </div>
          </div>

          {/* Mini product previews */}
          <div className="flex -space-x-2">
            {compareProducts.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className="w-10 h-10 rounded-lg bg-neutral-100 border-2 border-white flex items-center justify-center overflow-hidden"
                style={{ zIndex: 4 - index }}
              >
                <span className="text-xs font-bold text-neutral-400">
                  {product.brand.charAt(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              className="bg-neutral-100 text-neutral-600 cursor-pointer"
              onPress={handleClearCompare}
            >
              Limpiar
            </Button>
            <Button
              size="sm"
              className="bg-[#4654CD] text-white cursor-pointer"
              onPress={() => setIsComparatorOpen(true)}
              isDisabled={compareList.length < 2}
            >
              Comparar
            </Button>
          </div>
        </div>
      )}

      {/* Product Comparator Panel */}
      {isComparatorOpen && compareProducts.length >= 2 && (
        <ProductComparator
          products={compareProducts}
          config={comparatorConfig}
          isOpen={isComparatorOpen}
          onClose={() => setIsComparatorOpen(false)}
          onRemoveProduct={handleRemoveFromCompare}
          onClearAll={handleClearCompare}
          comparisonState={comparisonState}
          onStateChange={setComparisonState}
        />
      )}

      {/* Quiz FAB - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-[100]">
        <Button
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-all hover:scale-105 gap-2 px-4"
          onPress={() => setIsQuizOpen(true)}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="hidden sm:inline">¿Necesitas ayuda?</span>
        </Button>
      </div>

      {/* Help Quiz Modal */}
      <HelpQuiz
        config={quizConfig}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={(results) => {
          console.log('Quiz completed:', results);
          setIsQuizOpen(false);
        }}
      />

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

      {/* Current Config Badge - positioned above the quiz FAB */}
      {showConfigBadge && (
        <div className="fixed bottom-20 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200 max-w-md">
          <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
          <p className="text-xs font-mono text-neutral-700">
            Layout: V{config.layoutVersion} | Marca: V{config.brandFilterVersion} | Filtros: V{config.technicalFiltersVersion} | Card: V{config.cardVersion} | Tags: V{config.tagDisplayVersion} | Skeleton: V{config.skeletonVersion} | LoadMore: V{config.loadMoreVersion} | Gallery: V{config.imageGalleryVersion} | Size: V{config.gallerySizeVersion} | Precio: {config.pricingMode} ({config.defaultTerm}m, {config.defaultInitial}%)
          </p>
        </div>
      )}

      {/* Keyboard Shortcuts Toast */}
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300 animate-slide-down flex items-center gap-2 text-sm font-medium ${
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
        </div>
      )}

      {/* Active Component Indicator */}
      <div className="fixed top-20 right-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-md px-3 py-2 border border-neutral-200">
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Press ? for help</span>
        </div>
        <div className="text-xs font-medium text-[#4654CD]">
          Activo: {activeComponentLabel}
        </div>
      </div>

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
