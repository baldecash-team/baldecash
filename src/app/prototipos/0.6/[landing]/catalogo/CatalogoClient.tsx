'use client';

/**
 * Catálogo v0.6
 * Basado en v0.4 con configuración fija (layout=4, brand=3, card=6, etc.)
 * Único elemento iterable: ColorSelector (V1 Dots / V2 Swatches)
 */

import React, { useState, useMemo, useEffect, useCallback, Suspense, useRef } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import {
  Settings,
  Code,
  ArrowLeft,
  ArrowUp,
  ArrowRight,
  Scale,
  Trash2,
  HelpCircle,
  Heart,
  ShoppingCart,
  Sparkles,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { useIsMobile, Toast, useToast, CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';

// Catalog components
import { CatalogLayout } from './components/catalog/CatalogLayout';
import { CatalogoSettingsModal } from './components/catalog/CatalogoSettingsModal';
import { ProductCard } from './components/catalog/cards/ProductCard';
import { ProductCardSkeleton } from './components/catalog/ProductCardSkeleton';
import { LoadMoreButton } from './components/catalog/LoadMoreButton';
import { CartSelectionModal } from './components/catalog/CartSelectionModal';
import { CartDrawer } from './components/catalog/CartDrawer';
import { NavbarSearch, NavbarWishlist, NavbarCart, NavbarCartButton, NavbarSearchButton, NavbarWishlistButton } from './components/catalog/NavbarActions';
import { CatalogSecondaryNavbar } from './components/catalog/CatalogSecondaryNavbar';
import { SearchDrawer } from './components/catalog/SearchDrawer';
import { WishlistDrawer } from './components/wishlist/WishlistDrawer';
import { WebchatDrawer } from './components/webchat';

// Empty state
import { EmptyState } from './components/empty';

// Onboarding
import { OnboardingWelcomeModal, OnboardingTour } from './components/onboarding';
import { useOnboarding } from './hooks/useOnboarding';

// Hero components (Navbar & Footer)
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';

// Layout context for shared data
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import type { LandingLayoutResponse } from '@/app/prototipos/0.6/services/landingApi';
import type { CatalogSecondaryNavbarData } from '@/app/prototipos/0.6/types/hero';


// Types
import {
  CatalogLayoutConfig,
  defaultCatalogConfig,
  FilterState,
  defaultFilterState,
  SortOption,
  ColorSelectorVersion,
  loadingDurationMs,
  UsageType,
  GpuType,
  CatalogProduct,
  CatalogViewMode,
  calculateQuotaWithInitial,
  defaultOnboardingConfig,
  OnboardingStepCount,
  OnboardingHighlightStyle,
  OnboardingConfig,
} from './types/catalog';

// Data
import {
  sortProducts,
  getFilteredProducts,
  getFilterCounts,
  mockProducts,
} from './data/mockCatalogData';

// API Hook for loading products
import { useCatalogProducts, useProductsByIds } from './hooks/useCatalogProducts';

// Query params utilities
import {
  parseFiltersFromParams,
  buildParamsFromFilters,
  mergeFiltersWithDefaults,
} from './utils/queryFilters';

// Comparator components (local copy)
import { ProductComparator } from './components/comparator';
import {
  ComparatorConfig,
  ComparisonState,
  defaultComparisonState,
  ComparisonProduct,
  getMaxProducts,
} from './types/comparator';
import { HelpQuiz } from '@/app/prototipos/0.5/quiz/components/quiz';
import { QuizAnswer } from '@/app/prototipos/0.5/quiz/types/quiz';
import { quizQuestionsUsage } from '@/app/prototipos/0.5/quiz/data/mockQuizData';
import { ProductProvider as ProductProvider05 } from '@/app/prototipos/0.5/wizard-solicitud/context/ProductContext';
import { AppliedFilter } from './types/empty';
import { useProduct, ProductProvider } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

// URLs - now with landing context
const getWizardUrl = (landing: string) => {
  return `/prototipos/0.6/${landing}/solicitar/`;
};

const getDetailUrl = (landing: string, productId: string, deviceType: string | undefined) => {
  const baseUrl = `/prototipos/0.6/${landing}/producto/detail-preview`;
  const params = new URLSearchParams();
  if (deviceType && deviceType !== 'laptop') {
    params.set('device', deviceType);
  }
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

const getUpsellUrl = (landing: string) => {
  return `/prototipos/0.6/${landing}/solicitar/`;
};

// Configuración fija para cálculo de cuota (igual que CartSelectionModal)
const WIZARD_SELECTED_TERM = 24;
const WIZARD_SELECTED_INITIAL = 10;
const WIZARD_PRODUCT_STORAGE_KEY = 'baldecash-solicitar-selected-product';

// Mapear respuestas del quiz a filtros del catálogo
const mapQuizAnswersToFilters = (answers: QuizAnswer[], currentFilters: FilterState): Partial<FilterState> => {
  const newFilters: Partial<FilterState> = {};

  answers.forEach((answer) => {
    const question = quizQuestionsUsage.find((q) => q.id === answer.questionId);
    if (!question) return;

    const selectedOption = question.options.find((opt) => opt.id === answer.selectedOptions[0]);
    if (!selectedOption?.weight) return;

    const weight = selectedOption.weight as Record<string, unknown>;

    // Mapear usage (valores deben coincidir con los del catálogo)
    if (weight.usage) {
      const usageMap: Record<string, string> = {
        study: 'estudios',
        gaming: 'gaming',
        design: 'diseño',
        office: 'oficina',
        coding: 'programacion',
      };
      const mappedUsage = usageMap[weight.usage as string];
      if (mappedUsage) {
        newFilters.usage = [mappedUsage as UsageType];
      }
    }

    // Mapear RAM
    if (weight.ram && typeof weight.ram === 'number') {
      newFilters.ram = [weight.ram];
    }

    // Mapear marca
    if (weight.brand && weight.brand !== 'any') {
      newFilters.brands = [(weight.brand as string).toLowerCase()];
    }

    // Mapear presupuesto (quotaRange)
    if (weight.budget) {
      const budgetMap: Record<string, [number, number]> = {
        low: [0, 80],
        medium: [80, 150],
        high: [150, 250],
        premium: [250, 500],
      };
      const range = budgetMap[weight.budget as string];
      if (range) {
        newFilters.quotaRange = range;
      }
    }

    // Mapear tamaño de pantalla
    if (weight.display && typeof weight.display === 'number') {
      if (weight.display <= 14) {
        newFilters.displaySize = [13.3, 14];
      } else if (weight.display <= 15.6) {
        newFilters.displaySize = [15.6];
      } else {
        newFilters.displaySize = [16, 17.3];
      }
    }

    // Mapear GPU
    if (weight.gpu) {
      if (weight.gpu === 'dedicated') {
        newFilters.gpuType = ['dedicated'];
      } else if (weight.gpu === 'integrated') {
        newFilters.gpuType = ['integrated'];
      }
    }

    // Mapear Storage
    if (weight.storage && typeof weight.storage === 'number') {
      newFilters.storage = [weight.storage];
    }

    // Mapear Stock (inStock)
    if (weight.inStock === true) {
      newFilters.stock = ['available'];
    }

    // Mapear Condition (valores deben coincidir con los del catálogo)
    if (weight.condition && weight.condition !== 'any') {
      const conditionMap: Record<string, string> = {
        new: 'nuevo',
        refurbished: 'reacondicionado',
      };
      const mappedCondition = conditionMap[weight.condition as string];
      if (mappedCondition) {
        newFilters.condition = [mappedCondition as 'nuevo' | 'reacondicionado'];
      }
    }
  });

  return newFilters;
};

// Configuración fija del comparador (v0.6)
const comparatorConfig: ComparatorConfig = {
  layoutVersion: 1,
  designStyle: 3,
  fieldsVersion: 2,
  highlightVersion: 1,
  priceDiffVersion: 1,
  defaultTerm: 24,
  defaultInitial: 10,
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export function CatalogoClient() {
  return (
    <ProductProvider>
      <Suspense fallback={<LoadingFallback />}>
        <CatalogoContent />
      </Suspense>
    </ProductProvider>
  );
}

function CatalogoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  const isMobile = useIsMobile();
  const { setSelectedProduct } = useProduct();

  // Get layout data from context (fetched once at [landing] level)
  const { layoutData, navbarProps, footerData, isLoading: isLayoutLoading } = useLayout();

  // Load products from API (with mock fallback)
  // Set useMockData=true to always use mock data during development
  const {
    products: catalogProducts,
    isLoading: isProductsLoading,
    isFromApi,
    error: productsError,
    getInstallment,
  } = useCatalogProducts({
    landingSlug: landing,
    useMockData: false, // Set to true to force mock data
  });

  // Scroll to top on page load
  useScrollToTop();

  // Helper to save product to context (replaces saveProductForWizard)
  const selectProductForWizard = useCallback((product: CatalogProduct) => {
    const { quota } = calculateQuotaWithInitial(product.price, WIZARD_SELECTED_TERM, WIZARD_SELECTED_INITIAL);

    setSelectedProduct({
      id: product.id,
      name: product.displayName,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      monthlyPayment: quota,
      months: WIZARD_SELECTED_TERM,
      image: product.thumbnail,
      specs: {
        processor: product.specs?.processor?.model || '',
        ram: product.specs?.ram ? `${product.specs.ram.size}GB RAM` : '',
        storage: product.specs?.storage ? `${product.specs.storage.size}GB ${product.specs.storage.type}` : '',
      },
    });
  }, [setSelectedProduct]);

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
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isFirstRender = useRef(true);


  // Onboarding state - read config from URL params
  const onboardingInitialConfig = useMemo((): OnboardingConfig => {
    const tourStepsParam = searchParams.get('tourSteps');
    const tourStyleParam = searchParams.get('tourStyle');

    const stepCount: OnboardingStepCount = tourStepsParam === 'complete'
      ? 'complete'
      : tourStepsParam === 'minimal'
        ? 'minimal'
        : defaultOnboardingConfig.stepCount;

    const highlightStyle: OnboardingHighlightStyle = (['spotlight', 'pulse'] as const).includes(tourStyleParam as OnboardingHighlightStyle)
      ? (tourStyleParam as OnboardingHighlightStyle)
      : defaultOnboardingConfig.highlightStyle;

    return { stepCount, highlightStyle };
  }, [searchParams]);

  const onboarding = useOnboarding(onboardingInitialConfig);

  // Preloading: dar tiempo a la página para cargar recursos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Transform layout data for Catalog Secondary Navbar config
  const catalogSecondaryNavbarConfig = useMemo((): CatalogSecondaryNavbarData | null => {
    if (!layoutData?.catalog_secondary_navbar) return null;

    const config = layoutData.catalog_secondary_navbar.content_config as Record<string, unknown> | undefined;
    if (!config) return null;

    const searchConfig = config.search as { placeholder?: string } | undefined;
    const wishlistConfig = config.wishlist as Record<string, string> | undefined;
    const cartConfig = config.cart as Record<string, string> | undefined;

    return {
      search: {
        placeholder: searchConfig?.placeholder || 'Buscar equipos...',
      },
      wishlist: {
        title: wishlistConfig?.title || 'Mis favoritos',
        empty_title: wishlistConfig?.empty_title || 'Sin favoritos aún',
        empty_description: wishlistConfig?.empty_description || 'Haz clic en el corazón de cualquier producto para agregarlo aquí',
        empty_cta: wishlistConfig?.empty_cta || 'Explorar catálogo',
        clear_button: wishlistConfig?.clear_button || 'Limpiar',
        clear_all_button: wishlistConfig?.clear_all_button || 'Limpiar favoritos',
        remove_button: wishlistConfig?.remove_button || 'Quitar',
        compare_button: wishlistConfig?.compare_button || 'Comparar',
        in_compare_button: wishlistConfig?.in_compare_button || 'En comparador',
      },
      cart: {
        title: cartConfig?.title || 'Mi carrito',
        empty_title: cartConfig?.empty_title || 'Tu carrito está vacío',
        empty_description: cartConfig?.empty_description || 'Agrega productos para continuar',
        clear_button: cartConfig?.clear_button || 'Vaciar',
        close_button: cartConfig?.close_button || 'Cerrar',
        continue_button: cartConfig?.continue_button || 'Continuar',
        multiple_items_alert: cartConfig?.multiple_items_alert || 'Solo puedes solicitar un producto a la vez. Por favor, selecciona solo uno.',
      },
    };
  }, [layoutData]);

  // Comparison state with localStorage persistence
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [comparisonState, setComparisonState] = useState<ComparisonState>(defaultComparisonState);
  const [isCompareListLoaded, setIsCompareListLoaded] = useState(false);
  const maxCompareProducts = useMemo(() => getMaxProducts(comparatorConfig.layoutVersion), []);
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast(4000);

  // Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const quizConfig = {
    layoutVersion: (isMobile ? 4 : 5) as 4 | 5,
    questionCount: 7 as const,
    questionStyle: 1 as const,
    resultsVersion: 1 as const,
    focusVersion: 1 as const,
  };

  // Wishlist state with localStorage persistence
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<CatalogViewMode>('all');
  const [isWishlistLoaded, setIsWishlistLoaded] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);

  // Cart state with localStorage persistence
  const [cart, setCart] = useState<string[]>([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedProductForCart, setSelectedProductForCart] = useState<CatalogProduct | null>(null);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isHelpPopoverOpen, setIsHelpPopoverOpen] = useState(false);
  const [isWebchatOpen, setIsWebchatOpen] = useState(false);

  // Helper to close all drawers/popups before opening a new one (mobile)
  const closeAllDrawers = useCallback(() => {
    setIsSearchDrawerOpen(false);
    setIsCartDrawerOpen(false);
    setIsWishlistDrawerOpen(false);
    setIsQuizOpen(false);
    setIsComparatorOpen(false);
    setIsFilterDrawerOpen(false);
    setIsCartModalOpen(false);
    setIsHelpPopoverOpen(false);
    setIsWebchatOpen(false);
  }, []);

  // Ref to store scroll position when any drawer opens
  const scrollYRef = useRef<number>(0);

  // Quiz hint - tracking last interaction for inactivity detection
  const lastInteractionRef = useRef<number>(Date.now());
  const lastScrollYRef = useRef<number>(0);

  // Quiz hint - show tour at help button after 1 minute of inactivity
  useEffect(() => {
    const checkInactivity = () => {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
      const oneMinute = 60000;
      const secondsElapsed = Math.floor(timeSinceLastInteraction / 1000);

      console.log(`[Quiz Hint] Inactividad: ${secondsElapsed}s / 60s`);

      // Show help tour if 1 minute passed without interaction and nothing else is open
      const canShowHint =
        !isQuizOpen &&
        !isHelpPopoverOpen &&
        !onboarding.shouldShowTour &&
        !onboarding.shouldShowWelcome &&
        !isComparatorOpen &&
        !isCartDrawerOpen &&
        !isWishlistDrawerOpen &&
        !isFilterDrawerOpen &&
        !isSearchDrawerOpen &&
        !isCartModalOpen &&
        !isSettingsOpen &&
        !isPageLoading &&
        !isWebchatOpen;

      if (timeSinceLastInteraction >= oneMinute && canShowHint) {
        console.log('[Quiz Hint] ¡Mostrando tour de ayuda!');
        onboarding.startTourAtHelpButton();
        // Reset timer for next cycle
        lastInteractionRef.current = Date.now();
      }
    };

    // Check every 10 seconds
    const interval = setInterval(checkInactivity, 10000);

    return () => clearInterval(interval);
  }, [
    isQuizOpen,
    isHelpPopoverOpen,
    onboarding.shouldShowTour,
    onboarding.shouldShowWelcome,
    onboarding,
    isComparatorOpen,
    isCartDrawerOpen,
    isWishlistDrawerOpen,
    isFilterDrawerOpen,
    isSearchDrawerOpen,
    isCartModalOpen,
    isSettingsOpen,
    isPageLoading,
    isWebchatOpen,
  ]);

  // Track scroll as interaction (significant scroll > 300px)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollYRef.current);

      // If user scrolled more than 300px, consider it an interaction
      if (scrollDelta > 300) {
        lastScrollYRef.current = currentScrollY;
        lastInteractionRef.current = Date.now();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset interaction timer when filters change
  useEffect(() => {
    lastInteractionRef.current = Date.now();
  }, [filters]);

  // Centralized scroll lock for all drawers (iOS Safari fix)
  const isAnyDrawerOpen = isSearchDrawerOpen || isCartDrawerOpen || isWishlistDrawerOpen ||
                          isQuizOpen || isComparatorOpen || isCartModalOpen || isWebchatOpen;

  useEffect(() => {
    if (isAnyDrawerOpen) {
      // Only save scroll position if body is not already fixed
      if (document.body.style.position !== 'fixed') {
        scrollYRef.current = window.scrollY;
      }
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position when all drawers are closed
      const savedScrollY = scrollYRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScrollY);
    }
  }, [isAnyDrawerOpen]);

  // Load wishlist from localStorage on mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('baldecash-wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing wishlist from localStorage:', e);
      }
    }
    setIsWishlistLoaded(true);
  }, []);

  // Persist wishlist to localStorage (only after initial load)
  useEffect(() => {
    if (isWishlistLoaded) {
      localStorage.setItem('baldecash-wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isWishlistLoaded]);

  // Load cart from localStorage on mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('baldecash-cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
      }
    }
    setIsCartLoaded(true);
  }, []);

  // Persist cart to localStorage (only after initial load)
  useEffect(() => {
    if (isCartLoaded) {
      localStorage.setItem('baldecash-cart', JSON.stringify(cart));
    }
  }, [cart, isCartLoaded]);

  // Load compareList from localStorage on mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('baldecash-compare');
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing compareList from localStorage:', e);
      }
    }
    setIsCompareListLoaded(true);
  }, []);

  // Persist compareList to localStorage (only after initial load)
  useEffect(() => {
    if (isCompareListLoaded) {
      localStorage.setItem('baldecash-compare', JSON.stringify(compareList));
    }
  }, [compareList, isCompareListLoaded]);

  // Read filters from URL on mount
  const isFiltersInitialized = useRef(false);
  useEffect(() => {
    if (isFiltersInitialized.current) return;
    isFiltersInitialized.current = true;

    const urlFilters = parseFiltersFromParams(searchParams);
    if (Object.keys(urlFilters).length > 0) {
      const { sort: urlSort, searchQuery: urlSearchQuery, ...filterParams } = urlFilters;
      if (Object.keys(filterParams).length > 0) {
        setFilters(mergeFiltersWithDefaults(filterParams));
      }
      if (urlSort) {
        setSort(urlSort);
      }
      if (urlSearchQuery) {
        setSearchQuery(urlSearchQuery);
      }
    }
  }, [searchParams]);

  const handleToggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const isAdding = !prev.includes(productId);
      if (isAdding) {
        showToast('Producto añadido a favoritos', 'success');
      }
      return isAdding
        ? [...prev, productId]
        : prev.filter((id) => id !== productId);
    });
  }, [showToast]);

  // Cart handlers
  const handleOpenCartModal = useCallback((product: CatalogProduct) => {
    setSelectedProductForCart(product);
    setIsCartModalOpen(true);
  }, []);

  const handleAddToCart = useCallback((productId: string) => {
    if (!cart.includes(productId)) {
      setCart((prev) => [...prev, productId]);
      showToast('Producto añadido al carrito', 'success');
    }
  }, [cart, showToast]);

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((id) => id !== productId));

    // Limpiar localStorage si el producto eliminado es el guardado para el wizard
    try {
      const savedProduct = localStorage.getItem(WIZARD_PRODUCT_STORAGE_KEY);
      if (savedProduct) {
        const parsed = JSON.parse(savedProduct);
        if (parsed.id === productId) {
          localStorage.removeItem(WIZARD_PRODUCT_STORAGE_KEY);
        }
      }
    } catch {
      // Ignorar errores de parsing
    }
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(WIZARD_PRODUCT_STORAGE_KEY);
  }, []);

  const handleCartContinue = useCallback(() => {
    if (cart.length > 1) {
      showToast('Solo puedes solicitar un producto a la vez. Por favor, selecciona solo uno.', 'warning');
      return;
    }
    if (cart.length === 1) {
      // Guardar el producto del carrito antes de navegar
      const productToSave = catalogProducts.find((p) => p.id === cart[0]);
      if (productToSave) {
        selectProductForWizard(productToSave);
      }
      router.push(getWizardUrl(landing));
    }
  }, [cart, router, showToast, selectProductForWizard, landing, catalogProducts]);

  // Get cart products
  const cartProducts = useMemo(() => {
    return cart
      .map((id) => catalogProducts.find((p) => p.id === id))
      .filter((p): p is CatalogProduct => p !== undefined);
  }, [cart, catalogProducts]);

  // Get wishlist products
  const wishlistProducts = useMemo(() => {
    return wishlist
      .map((id) => catalogProducts.find((p) => p.id === id))
      .filter((p): p is CatalogProduct => p !== undefined);
  }, [wishlist, catalogProducts]);



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

  // Handler to clear search
  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Update URL when filters, sort, searchQuery, colorSelectorVersion, or onboarding config change
  useEffect(() => {
    // Skip URL update during initial filter loading
    if (!isFiltersInitialized.current) return;

    // Build filter params (include searchQuery)
    const filterParams = buildParamsFromFilters(filters, sort, searchQuery);

    // Add colorSelectorVersion if not default
    if (config.colorSelectorVersion !== 1) {
      filterParams.set('color', config.colorSelectorVersion.toString());
    }

    // Add onboarding params if not default
    if (onboarding.config.stepCount !== defaultOnboardingConfig.stepCount) {
      filterParams.set('tourSteps', onboarding.config.stepCount);
    }
    if (onboarding.config.highlightStyle !== defaultOnboardingConfig.highlightStyle) {
      filterParams.set('tourStyle', onboarding.config.highlightStyle);
    }

    // Decode commas for cleaner URLs (e.g., device=tablet,celular instead of device=tablet%2Ccelular)
    const queryString = filterParams.toString().replace(/%2C/g, ',');
    router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  }, [filters, sort, searchQuery, config.colorSelectorVersion, onboarding.config.stepCount, onboarding.config.highlightStyle, router]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const products = getFilteredProducts(filters, catalogProducts);
    return sortProducts(products, sort);
  }, [filters, sort, catalogProducts]);

  // Products to display based on viewMode and search
  const displayedProducts = useMemo(() => {
    let products = filteredProducts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      products = products.filter((p) =>
        p.displayName.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query)
      );
    }

    // Apply favorites filter
    if (viewMode === 'favorites') {
      products = products.filter((p) => wishlist.includes(p.id));
    }

    return products;
  }, [viewMode, filteredProducts, wishlist, searchQuery]);

  const filterCounts = useMemo(() => getFilterCounts(filteredProducts), [filteredProducts]);

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
  const visibleProducts = displayedProducts.slice(0, visibleProductsCount);
  const hasMoreProducts = visibleProductsCount < displayedProducts.length;
  const remainingProducts = displayedProducts.length - visibleProductsCount;

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
    if (filters.quotaRange[0] !== 25 || filters.quotaRange[1] !== 400) {
      result.push({ key: 'quota', label: `S/${filters.quotaRange[0]} - S/${filters.quotaRange[1]}/mes`, value: filters.quotaRange });
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
      if (key === 'quota') newFilters.quotaRange = [25, 400];
      if (key === 'ram') newFilters.ram = [];
      if (key === 'gama') newFilters.gama = [];
      return newFilters;
    });
  }, []);

  // Comparison handlers
  const getDeviceType = (product: CatalogProduct): string => {
    // Si tiene deviceType definido, usarlo. Si no, asumir 'laptop' (productos generados)
    return product.deviceType || 'laptop';
  };

  const handleToggleCompare = useCallback((productId: string) => {
    // Si ya está en la lista, quitarlo
    if (compareList.includes(productId)) {
      setCompareList((prev) => prev.filter((id) => id !== productId));
      return;
    }

    // Verificar límite
    if (compareList.length >= maxCompareProducts) return;

    // Obtener el producto a agregar
    const productToAdd = catalogProducts.find((p) => p.id === productId);
    if (!productToAdd) return;

    // Verificar tipo de dispositivo si ya hay productos en la lista
    if (compareList.length > 0) {
      const firstProductInList = catalogProducts.find((p) => p.id === compareList[0]);

      if (firstProductInList) {
        const currentDeviceType = getDeviceType(firstProductInList);
        const newDeviceType = getDeviceType(productToAdd);

        if (currentDeviceType !== newDeviceType) {
          // Mostrar toast de warning
          const deviceTypeLabels: Record<string, string> = {
            laptop: 'laptops',
            tablet: 'tablets',
            celular: 'celulares',
          };
          const currentTypeLabel = deviceTypeLabels[currentDeviceType] || currentDeviceType;
          const newTypeLabel = deviceTypeLabels[newDeviceType] || newDeviceType;

          showToast(
            `Solo puedes comparar productos del mismo tipo. Actualmente comparas ${currentTypeLabel}, no puedes agregar ${newTypeLabel}.`,
            'warning'
          );
          return;
        }
      }
    }

    // Agregar a la lista
    setCompareList((prev) => [...prev, productId]);
  }, [compareList, maxCompareProducts, showToast, catalogProducts]);

  const handleRemoveFromCompare = useCallback((productId: string) => {
    setCompareList((prev) => prev.filter((id) => id !== productId));
  }, []);

  const handleClearCompare = useCallback(() => {
    setCompareList([]);
    setIsComparatorOpen(false);
  }, []);

  const compareProducts = useMemo((): ComparisonProduct[] => {
    return compareList
      .map((id) => filteredProducts.find((p) => p.id === id) || catalogProducts.find((p) => p.id === id))
      .filter((p): p is ComparisonProduct => p !== undefined);
  }, [compareList, filteredProducts, catalogProducts]);

  // Show loading while page preloads, layout data, or products are loading
  if (isPageLoading || isLayoutLoading || isProductsLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Navbar from Hero */}
      <Navbar
        hidePromoBanner={isComparatorOpen || isFilterDrawerOpen}
        fullWidth
        landing={landing}
        promoBannerData={navbarProps?.promoBannerData}
        logoUrl={navbarProps?.logoUrl}
        customerPortalUrl={navbarProps?.customerPortalUrl}
        navbarItems={navbarProps?.navbarItems}
        megamenuItems={navbarProps?.megamenuItems}
        activeSections={['convenios', 'como-funciona', 'faq']}
      />

      {/* Secondary Navbar with Search, Wishlist, Cart */}
      <CatalogSecondaryNavbar
        hidePromoBanner={isComparatorOpen || isFilterDrawerOpen}
        fullWidth
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={handleSearchClear}
        wishlistItems={wishlistProducts}
        onWishlistRemove={handleToggleWishlist}
        onWishlistClear={() => setWishlist([])}
        onWishlistViewProduct={(productId) => {
          const product = catalogProducts.find((p) => p.id === productId);
          router.push(getDetailUrl(landing, productId, product?.deviceType));
        }}
        cartItems={cartProducts}
        onCartRemove={handleRemoveFromCart}
        onCartClear={handleClearCart}
        onCartContinue={handleCartContinue}
        isSearchActive={isSearchDrawerOpen || searchQuery.length > 0}
        onMobileSearchClick={() => {
          closeAllDrawers();
          setIsSearchDrawerOpen(true);
        }}
        onMobileWishlistClick={() => {
          closeAllDrawers();
          setIsWishlistDrawerOpen(true);
        }}
        onMobileCartClick={() => {
          closeAllDrawers();
          setIsCartDrawerOpen(true);
        }}
        config={catalogSecondaryNavbarConfig}
      />

      {/* Main Content with padding for fixed navbars (promo + primary + secondary) */}
      <main className="pt-40">
        {/* Catalog Layout with Products */}
        <CatalogLayout
        products={displayedProducts}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        config={config}
        filterCounts={filterCounts}
        onFilterDrawerChange={(isOpen) => {
          if (isOpen) {
            closeAllDrawers();
          }
          setIsFilterDrawerOpen(isOpen);
        }}
        searchQuery={searchQuery}
        onSearchClear={handleSearchClear}
      >
        {isLoading ? (
          Array.from({ length: visibleProductsCount }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} version={config.skeletonVersion} index={index} />
          ))
        ) : (
          <>
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                colorSelectorVersion={config.colorSelectorVersion}
                onAddToCart={() => handleOpenCartModal(product)}
                onFavorite={() => handleToggleWishlist(product.id)}
                isFavorite={wishlist.includes(product.id)}
                onViewDetail={() => router.push(getDetailUrl(landing, product.id, product.deviceType))}
                onCompare={() => handleToggleCompare(product.id)}
                isCompareSelected={compareList.includes(product.id)}
                compareDisabled={compareList.length >= maxCompareProducts}
                // Onboarding IDs only for first card
                {...(index === 0 && {
                  favoriteButtonId: 'onboarding-card-favorite',
                  compareButtonId: 'onboarding-card-compare',
                  detailButtonId: 'onboarding-card-detail',
                  addToCartButtonId: 'onboarding-card-add-to-cart',
                })}
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
            totalProducts={displayedProducts.length}
            visibleProducts={visibleProducts.length}
            onLoadMore={handleLoadMore}
          />
        )}

        {/* Empty State */}
        {!isLoading && displayedProducts.length === 0 && (
          <div className="col-span-full">
            {viewMode === 'favorites' ? (
              // Empty state for favorites view
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
                  <Heart className="w-12 h-12 text-neutral-300" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  {wishlist.length === 0 ? 'Sin favoritos aún' : 'No hay favoritos que coincidan'}
                </h3>
                <p className="text-neutral-500 mb-6 max-w-md">
                  {wishlist.length === 0
                    ? 'Haz clic en el corazón de cualquier producto para agregarlo a tus favoritos'
                    : 'Tus favoritos no coinciden con los filtros actuales. Prueba ajustar los filtros o ver todos los productos.'}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="bordered"
                    onPress={() => setViewMode('all')}
                    className="cursor-pointer"
                  >
                    Ver todos los productos
                  </Button>
                  {wishlist.length > 0 && appliedFilters.length > 0 && (
                    <Button
                      variant="light"
                      onPress={() => setFilters(defaultFilterState)}
                      className="cursor-pointer text-neutral-600"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <EmptyState
                  appliedFilters={appliedFilters}
                  onClearFilters={() => {
                    setFilters(defaultFilterState);
                    setSearchQuery('');
                  }}
                  onRemoveFilter={handleRemoveFilter}
                  totalProductsIfExpanded={catalogProducts.length}
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
                        onPress={() => {
                          closeAllDrawers();
                          setIsQuizOpen(true);
                        }}
                        startContent={<HelpCircle className="w-4 h-4" />}
                      >
                        Iniciar asistente
                      </Button>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </CatalogLayout>
      </main>

      {/* Footer from Hero */}
      <Footer data={footerData} />

      {/* Cart Selection Modal */}
      <CartSelectionModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        product={selectedProductForCart}
        onRequestEquipment={() => {
          if (selectedProductForCart) {
            selectProductForWizard(selectedProductForCart);
          }
          router.push(getWizardUrl(landing));
        }}
        onAddToCart={() => {
          if (selectedProductForCart) {
            handleAddToCart(selectedProductForCart.id);
          }
        }}
      />

      {/* Cart Bar - Removed from here, now in Navbar for desktop */}

      {/* Cart Drawer - Mobile only */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        items={cartProducts}
        onRemoveItem={handleRemoveFromCart}
        onClearAll={() => {
          handleClearCart();
          setIsCartDrawerOpen(false);
        }}
        onContinue={() => {
          handleCartContinue();
          setIsCartDrawerOpen(false);
        }}
        config={catalogSecondaryNavbarConfig?.cart}
      />

      {/* Search Drawer - Mobile only */}
      <SearchDrawer
        isOpen={isSearchDrawerOpen}
        onClose={() => setIsSearchDrawerOpen(false)}
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={handleSearchClear}
      />

      {/* Wishlist Drawer - Mobile only */}
      <WishlistDrawer
        isOpen={isWishlistDrawerOpen}
        onClose={() => setIsWishlistDrawerOpen(false)}
        products={wishlistProducts}
        onRemoveProduct={handleToggleWishlist}
        onClearAll={() => setWishlist([])}
        onViewProduct={(productId) => {
          setIsWishlistDrawerOpen(false);
          const product = catalogProducts.find((p) => p.id === productId);
          router.push(getDetailUrl(landing, productId, product?.deviceType));
        }}
        onAddToCompare={handleToggleCompare}
        compareList={compareList}
        maxCompareProducts={maxCompareProducts}
        config={catalogSecondaryNavbarConfig?.wishlist}
      />

      {/* Floating Comparison Bar - Desktop only */}
      {compareList.length > 0 && !isComparatorOpen && !isQuizOpen && !isCartModalOpen && !isSettingsOpen && (
        <div className="hidden lg:flex fixed left-1/2 -translate-x-1/2 z-[90] bg-white rounded-2xl shadow-xl border border-neutral-200 px-4 py-3 items-center gap-4 transition-all bottom-6">
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
              className={`px-6 font-bold ${
                compareList.length >= 2
                  ? 'bg-[#4654CD] text-white cursor-pointer hover:bg-[#3a47b3]'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
              style={{ borderRadius: '14px' }}
              onPress={() => {
                closeAllDrawers();
                setIsComparatorOpen(true);
              }}
              isDisabled={compareList.length < 2}
              endContent={<ArrowRight className="w-5 h-5" />}
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

      {/* Floating buttons - Bottom Left (hidden when quiz, comparator, filter drawer, cart drawer, wishlist drawer, search drawer, cart modal, settings, webchat, or welcome modal is open) */}
      {!isQuizOpen && !isComparatorOpen && !isFilterDrawerOpen && !isCartDrawerOpen && !isWishlistDrawerOpen && !isCartModalOpen && !isSearchDrawerOpen && !isWebchatOpen && !isSettingsOpen && !onboarding.shouldShowWelcome && (
        <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3">
          {/* Compare button - mobile only, visible when products are selected */}
          {compareList.length > 0 && (
            <Button
              className={`lg:hidden shadow-lg cursor-pointer transition-all hover:scale-105 gap-2 px-4 ${
                compareList.length >= 2
                  ? 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
                  : 'bg-white text-[#4654CD] border border-[#4654CD]/20 hover:bg-neutral-100'
              }`}
              onPress={() => {
                if (compareList.length >= 2) {
                  closeAllDrawers();
                  setIsComparatorOpen(true);
                }
              }}
              isDisabled={compareList.length < 2}
            >
              <Scale className="w-5 h-5" />
              <span className="hidden sm:inline lg:hidden">Comparar</span>
              <span className={`text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 ${
                compareList.length >= 2 ? 'bg-white text-[#4654CD]' : 'bg-[#4654CD] text-white'
              }`}>
                {compareList.length}/{maxCompareProducts}
              </span>
            </Button>
          )}

          {/* Cart button - Removed, now in Navbar header for mobile */}

          {/* Help button with dropdown */}
          <Popover
            placement="top"
            showArrow
            isOpen={isHelpPopoverOpen}
            onOpenChange={setIsHelpPopoverOpen}
            classNames={{
              base: 'z-[100]',
              content: 'p-0 bg-white border border-neutral-200 shadow-xl rounded-xl overflow-hidden',
            }}
          >
            <PopoverTrigger>
              <Button
                id="onboarding-help-button"
                size="sm"
                className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-all hover:scale-105 gap-2 px-3 py-5 !font-semibold rounded-lg"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">¿Necesitas ayuda?</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="w-64">
                {/* Option 1: Quiz */}
                <button
                  onClick={() => {
                    setIsHelpPopoverOpen(false);
                    setIsQuizOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer text-left border-b border-neutral-100"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[#4654CD]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Encuentra tu laptop ideal</p>
                    <p className="text-xs text-neutral-500">Responde 7 preguntas</p>
                  </div>
                </button>

                {/* Option 2: Tour */}
                <button
                  onClick={() => {
                    setIsHelpPopoverOpen(false);
                    onboarding.restartTour();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer text-left border-b border-neutral-100"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#03DBD0]/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-[#03DBD0]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Ver tour guiado</p>
                    <p className="text-xs text-neutral-500">Aprende a usar el catálogo</p>
                  </div>
                </button>

                {/* Option 3: Webchat */}
                <button
                  onClick={() => {
                    setIsHelpPopoverOpen(false);
                    setIsWebchatOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Habla con nosotros</p>
                    <p className="text-xs text-neutral-500">Te ayudamos al instante</p>
                  </div>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Help Quiz Modal - wrapped with 0.5 ProductProvider since HelpQuiz uses 0.5 context */}
      <ProductProvider05>
        <HelpQuiz
          config={quizConfig}
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          context="catalog"
          onComplete={(results, answers) => {
            // Aplicar filtros basados en las respuestas del quiz
            if (answers && answers.length > 0) {
              const quizFilters = mapQuizAnswersToFilters(answers, filters);
              setFilters((prev) => ({
                ...prev,
                ...quizFilters,
              }));
            }
          }}
        />
      </ProductProvider05>

      {/* Webchat Drawer */}
      <WebchatDrawer
        isOpen={isWebchatOpen}
        onClose={() => setIsWebchatOpen(false)}
      />

      {/* Back to top button */}
      {showScrollTop && !isQuizOpen && !isCartModalOpen && !isFilterDrawerOpen && !isCartDrawerOpen && !isWishlistDrawerOpen && !isComparatorOpen && !isSearchDrawerOpen && !isWebchatOpen && !onboarding.shouldShowWelcome && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <Button
            isIconOnly
            radius="md"
            className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-all hover:scale-110"
            onPress={scrollToTop}
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Settings Modal */}
      <CatalogoSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
        onboardingConfig={onboarding.config}
        onOnboardingConfigChange={onboarding.setConfig}
      />

      {/* Toast para alertas de comparación */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={isToastVisible}
          onClose={hideToast}
          duration={4000}
          position="bottom"
        />
      )}

      {/* Onboarding - Welcome Modal */}
      <OnboardingWelcomeModal
        isOpen={onboarding.shouldShowWelcome && !isPageLoading}
        onStartTour={onboarding.startTour}
        onDismiss={onboarding.dismissWelcome}
      />

      {/* Onboarding - Tour */}
      <OnboardingTour
        isActive={onboarding.shouldShowTour}
        currentStep={onboarding.currentStepData}
        currentStepIndex={onboarding.state.currentStep}
        totalSteps={onboarding.totalSteps}
        highlightStyle={onboarding.config.highlightStyle}
        isHelpOnlyMode={onboarding.isHelpOnlyMode}
        onNext={onboarding.nextStep}
        onPrev={onboarding.prevStep}
        onSkip={onboarding.skipTour}
      />
    </div>
  );
}
