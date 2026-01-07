'use client';

/**
 * Catálogo Preview v0.5
 * Basado en v0.4 con configuración fija (layout=4, brand=3, card=6, etc.)
 * Único elemento iterable: ColorSelector (V1 Dots / V2 Swatches)
 */

import React, { useState, useMemo, useEffect, useCallback, Suspense, useRef } from 'react';
import { Button, Spinner } from '@nextui-org/react';
import {
  Settings,
  Code,
  ArrowLeft,
  ArrowUp,
  ArrowRight,
  Scale,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton, useIsMobile } from '@/app/prototipos/_shared';

// Catalog components
import { CatalogLayout } from '../components/catalog/CatalogLayout';
import { CatalogoSettingsModal } from '../components/catalog/CatalogoSettingsModal';
import { ProductCard } from '../components/catalog/cards/ProductCard';
import { ProductCardSkeleton } from '../components/catalog/ProductCardSkeleton';
import { LoadMoreButton } from '../components/catalog/LoadMoreButton';

// Empty state
import { EmptyState } from '../components/empty';

// Types
import {
  CatalogLayoutConfig,
  defaultCatalogConfig,
  FilterState,
  defaultFilterState,
  SortOption,
  ColorSelectorVersion,
  loadingDurationMs,
} from '../types/catalog';

// Data
import {
  sortProducts,
  getFilteredProducts,
  getFilterCounts,
  mockProducts,
} from '../data/mockCatalogData';

// External components from v0.4 (shared)
import { ProductComparator } from '@/app/prototipos/0.4/comparador/components/comparator/ProductComparator';
import {
  ComparatorConfig,
  ComparisonState,
  defaultComparisonState,
  ComparisonProduct,
  getMaxProducts,
} from '@/app/prototipos/0.4/comparador/types/comparator';
import { HelpQuiz } from '@/app/prototipos/0.4/quiz/components/quiz';
import { AppliedFilter } from '../types/empty';

// URLs
const getWizardUrl = (isCleanMode: boolean) => {
  const params = new URLSearchParams();
  params.set('input', '4');
  params.set('options', '2');
  params.set('upload', '3');
  params.set('progress', '1');
  params.set('navigation', '1');
  if (isCleanMode) params.set('mode', 'clean');
  return `/prototipos/0.4/wizard-solicitud/wizard-preview?${params.toString()}`;
};

const getDetailUrl = (productSlug: string, isCleanMode: boolean) => {
  const baseUrl = '/prototipos/0.4/producto/detail-preview?infoHeader=3&gallery=1&tabs=1&specs=2&pricing=4&cronograma=2&similar=2&limitations=6&certifications=1';
  return isCleanMode ? `${baseUrl}&mode=clean` : baseUrl;
};

const getUpsellUrl = (isCleanMode: boolean) => {
  const baseUrl = '/prototipos/0.4/upsell/upsell-preview/?accessoryIntroVersion=3&sections=accessories';
  return isCleanMode ? `${baseUrl}&mode=clean` : baseUrl;
};

// Configuración fija del comparador
const comparatorConfig: ComparatorConfig = {
  layoutVersion: 1,
  accessVersion: 1,
  maxProductsVersion: 2,
  fieldsVersion: 2,
  highlightVersion: 1,
  priceDiffVersion: 1,
  differenceHighlightVersion: 5,
  cardSelectionVersion: 3,
  defaultTerm: 24,
  defaultInitial: 10,
};

export default function CatalogPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" color="primary" />
        </div>
      }
    >
      <CatalogPreviewContent />
    </Suspense>
  );
}

function CatalogPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const isMobile = useIsMobile();

  // Config state - FIJO excepto colorSelectorVersion
  const [config, setConfig] = useState<CatalogLayoutConfig & { colorSelectorVersion: ColorSelectorVersion }>(() => {
    const colorParam = searchParams.get('color');
    const parsedColor = colorParam ? parseInt(colorParam, 10) : null;
    const validColor = parsedColor && (parsedColor === 1 || parsedColor === 2)
      ? (parsedColor as ColorSelectorVersion)
      : 1;

    return {
      // Valores fijos de v0.4 presentación
      layoutVersion: 4,
      brandFilterVersion: 3,
      cardVersion: 6,
      technicalFiltersVersion: 3,
      skeletonVersion: 2,
      loadMoreVersion: 3,
      loadingDuration: 'default',
      imageGalleryVersion: 2,
      gallerySizeVersion: 3,
      tagDisplayVersion: 1,
      pricingMode: 'static',
      defaultTerm: 24,
      defaultInitial: 10,
      showPricingOptions: false,
      showFilterCounts: true,
      showTooltips: true,
      productsPerRow: { mobile: 1, tablet: 2, desktop: 4 },
      // Único iterable
      colorSelectorVersion: validColor,
    };
  });

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [sort, setSort] = useState<SortOption>('recommended');

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isFirstRender = useRef(true);

  // Comparison state
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [comparisonState, setComparisonState] = useState<ComparisonState>(defaultComparisonState);
  const maxCompareProducts = useMemo(() => getMaxProducts(comparatorConfig.maxProductsVersion), []);

  // Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const quizConfig = {
    layoutVersion: (isMobile ? 4 : 5) as 4 | 5,
    questionCount: 7 as const,
    questionStyle: 1 as const,
    resultsVersion: 1 as const,
    focusVersion: 1 as const,
  };

  // Pagination
  const INITIAL_ROWS = 4;
  const ROWS_PER_LOAD = 2;
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  const [pendingRows, setPendingRows] = useState(0);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Update URL when colorSelectorVersion changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (config.colorSelectorVersion !== 1) {
      params.set('color', config.colorSelectorVersion.toString());
    }
    if (isCleanMode) params.set('mode', 'clean');
    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  }, [config.colorSelectorVersion, router, isCleanMode]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const products = getFilteredProducts({
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

  const filterCounts = useMemo(() => getFilterCounts(mockProducts), []);

  // Loading effect
  useEffect(() => {
    if (!isFirstRender.current) {
      setIsLoading(true);
      setVisibleRows(INITIAL_ROWS);
    }
    isFirstRender.current = false;

    const loadingTime = loadingDurationMs[config.loadingDuration];
    const timer = setTimeout(() => setIsLoading(false), loadingTime);
    return () => clearTimeout(timer);
  }, [filters, sort, config.loadingDuration]);

  // Pagination calculations
  const columnsCount = config.productsPerRow.desktop;
  const visibleProductsCount = visibleRows * columnsCount;
  const visibleProducts = filteredProducts.slice(0, visibleProductsCount);
  const hasMoreProducts = visibleProductsCount < filteredProducts.length;
  const remainingProducts = filteredProducts.length - visibleProductsCount;

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setPendingRows(ROWS_PER_LOAD);
    const loadingTime = loadingDurationMs[config.loadingDuration];
    setTimeout(() => {
      setVisibleRows((prev) => prev + ROWS_PER_LOAD);
      setPendingRows(0);
      setIsLoadingMore(false);
    }, loadingTime);
  }, [config.loadingDuration]);

  // Applied filters for EmptyState
  const appliedFilters = useMemo((): AppliedFilter[] => {
    const result: AppliedFilter[] = [];
    if (filters.brands.length > 0) {
      filters.brands.forEach((brand) => {
        result.push({ key: 'brand', label: brand.charAt(0).toUpperCase() + brand.slice(1), value: brand });
      });
    }
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
      result.push({ key: 'price', label: `S/${filters.priceRange[0]} - S/${filters.priceRange[1]}`, value: filters.priceRange });
    }
    if (filters.ram.length > 0) {
      filters.ram.forEach((ram) => {
        result.push({ key: 'ram', label: `${ram}GB RAM`, value: ram });
      });
    }
    if (filters.gama.length > 0) {
      const gamaLabels: Record<string, string> = { economica: 'Económica', estudiante: 'Estudiante', profesional: 'Profesional', creativa: 'Creativa', gamer: 'Gamer' };
      filters.gama.forEach((g) => {
        result.push({ key: 'gama', label: gamaLabels[g] || g, value: g });
      });
    }
    return result;
  }, [filters]);

  const handleRemoveFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (key === 'brand') newFilters.brands = [];
      if (key === 'price') newFilters.priceRange = [0, 10000];
      if (key === 'ram') newFilters.ram = [];
      if (key === 'gama') newFilters.gama = [];
      return newFilters;
    });
  }, []);

  // Comparison handlers
  const handleToggleCompare = useCallback((productId: string) => {
    setCompareList((prev) => {
      if (prev.includes(productId)) return prev.filter((id) => id !== productId);
      if (prev.length >= maxCompareProducts) return prev;
      return [...prev, productId];
    });
  }, [maxCompareProducts]);

  const handleRemoveFromCompare = useCallback((productId: string) => {
    setCompareList((prev) => prev.filter((id) => id !== productId));
  }, []);

  const handleClearCompare = useCallback(() => {
    setCompareList([]);
    setIsComparatorOpen(false);
  }, []);

  const compareProducts = useMemo((): ComparisonProduct[] => {
    return compareList
      .map((id) => filteredProducts.find((p) => p.id === id) || mockProducts.find((p) => p.id === id))
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
        {isLoading ? (
          Array.from({ length: visibleProductsCount }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} version={config.skeletonVersion} index={index} />
          ))
        ) : (
          <>
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                colorSelectorVersion={config.colorSelectorVersion}
                onAddToCart={() => router.push(getUpsellUrl(isCleanMode))}
                onFavorite={() => console.log('Toggle favorite:', product.id)}
                onViewDetail={() => router.push(getDetailUrl(product.id, isCleanMode))}
                onCompare={() => handleToggleCompare(product.id)}
                isCompareSelected={compareList.includes(product.id)}
                compareDisabled={compareList.length >= maxCompareProducts}
              />
            ))}
            {isLoadingMore &&
              pendingRows > 0 &&
              Array.from({ length: pendingRows * columnsCount }).map((_, index) => (
                <ProductCardSkeleton key={`loading-more-${index}`} version={config.skeletonVersion} index={index} />
              ))}
          </>
        )}

        {/* Load More Button */}
        {!isLoading && !isLoadingMore && hasMoreProducts && (
          <LoadMoreButton
            version={config.loadMoreVersion}
            remainingProducts={remainingProducts}
            totalProducts={filteredProducts.length}
            visibleProducts={visibleProducts.length}
            onLoadMore={handleLoadMore}
          />
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              appliedFilters={appliedFilters}
              onClearFilters={() => setFilters(defaultFilterState)}
              onExpandPriceRange={() => setFilters((prev) => ({ ...prev, priceRange: [0, 10000] }))}
              onRemoveFilter={handleRemoveFilter}
              totalProductsIfExpanded={mockProducts.length}
              config={{ illustrationVersion: 5, actionsVersion: 6 }}
            />

            {/* Quiz CTA in Empty State */}
            <section className="mt-8 px-4">
              <div className="bg-gradient-to-r from-[#4654CD]/5 to-[#4654CD]/10 rounded-2xl p-6 border border-[#4654CD]/20">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#4654CD] flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">¿No encuentras lo que buscas?</h3>
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

      {/* Floating Comparison Bar */}
      {compareList.length > 0 && !isComparatorOpen && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 z-[90] bg-white rounded-2xl shadow-xl border border-neutral-200 px-4 py-3 flex items-center gap-4 ${
            config.layoutVersion === 4 ? 'bottom-24 lg:bottom-6' : 'bottom-6'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                {compareList.length} de {maxCompareProducts}
              </p>
              <p className="text-xs text-neutral-500">equipos seleccionados</p>
            </div>
          </div>

          <div className="flex -space-x-2">
            {compareProducts.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className="w-10 h-10 rounded-lg bg-white border-2 border-white shadow-sm overflow-hidden"
                style={{ zIndex: 4 - index }}
              >
                <img src={product.thumbnail} alt={product.displayName} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
            <Button
              variant="light"
              size="sm"
              isIconOnly
              onPress={handleClearCompare}
              className="cursor-pointer text-neutral-500 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className={`${
                compareList.length >= 2
                  ? 'bg-[#4654CD] text-white cursor-pointer'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
              onPress={() => setIsComparatorOpen(true)}
              isDisabled={compareList.length < 2}
              endContent={<ArrowRight className="w-4 h-4" />}
            >
              Comparar
            </Button>
          </div>
        </div>
      )}

      {/* Product Comparator Modal */}
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

      {/* Floating Action Buttons - hidden in clean mode */}
      {!isCleanMode && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
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
          <TokenCounter sectionId="PROMPT_02" version="0.5" />
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
            onPress={() => router.push('/prototipos/0.5')}
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Button>
        </div>
      )}

      {/* Clean mode: FeedbackButton */}
      {isCleanMode && (
        <FeedbackButton sectionId="catalogo" config={config as unknown as Record<string, unknown>} />
      )}

      {/* Config Badge */}
      {!isCleanMode && showConfigBadge && (
        <div className="fixed bottom-20 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200 max-w-md">
          <p className="text-xs text-neutral-500 mb-1">Configuración v0.5:</p>
          <p className="text-xs font-mono text-neutral-700">
            Layout: V4 (fijo) | Brand: V3 (fijo) | Card: V6 (fijo) | ColorSelector: V{config.colorSelectorVersion} (iterable)
          </p>
        </div>
      )}

      {/* Settings Modal */}
      {!isCleanMode && (
        <CatalogoSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={config}
          onConfigChange={setConfig}
        />
      )}
    </div>
  );
}
