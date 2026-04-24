'use client';

/**
 * GamerCatalogoClient - Catálogo con estética gaming (Zona Gamer)
 *
 * Reutiliza los mismos hooks de datos que CatalogoClient:
 * - useCatalogProducts para productos desde la API/DB
 * - useCatalogFilters para opciones de filtro
 * - useCatalogSharedState para carrito/wishlist persistente
 * - useLayout para datos de navbar/footer
 *
 * Tema visual: neon cyan (#00ffd5), neon purple (#6366f1), fondo oscuro (#0e0e0e)
 * Fuentes: Rajdhani, Orbitron, Share Tech Mono, Barlow Condensed
 */

import { useState, useMemo, useCallback, useRef, useEffect, Suspense, useDeferredValue } from 'react';
import {
  Search,
  Heart,
  X,
  SlidersHorizontal,
  Zap,
  ArrowRight,
  Trash2,
  Scale,
  Laptop,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';

// localStorage keys — must match ProductContext keys exactly
const getStorageKey = (landing: string) => `baldecash-${landing}-solicitar-selected-product`;
const getCartProductsKey = (landing: string) => `baldecash-${landing}-solicitar-cart-products`;
const getAccessoriesKey = (landing: string) => `baldecash-${landing}-solicitar-selected-accessories`;

// Hooks de datos (los mismos que CatalogoClient)
import { useCatalogProducts, useCatalogFilters, type AppliedFiltersForCounts } from './hooks/useCatalogProducts';
import { useCatalogSharedState } from './hooks/useCatalogSharedState';
import { useGridColumns, roundToColumns } from './hooks/useGridColumns';
import { WishlistDrawer } from './components/wishlist/WishlistDrawer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { ProductProvider } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import {
  parseFiltersFromParams,
  buildParamsFromFilters,
  mergeFiltersWithDefaults,
} from './utils/queryFilters';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { getAllowMultiProduct, getMaxMonthlyQuota } from '@/app/prototipos/0.6/utils/featureFlags';

// Types
import type {
  CatalogProduct,
  CartItem,
  FilterState,
  SortOption,
  WishlistItem,
  TermMonths,
  InitialPaymentPercent,
} from './types/catalog';
import { defaultFilterState } from './types/catalog';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';

const WIZARD_SELECTED_INITIAL: InitialPaymentPercent = 0;
import { fetchCatalogData, fetchProductsByIds } from '../../services/catalogApi';
import type { CatalogFilters as ApiCatalogFilters, SortBy as ApiSortBy } from '../../services/catalogApi';

// Zona Gamer components
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';
import { GamerNewsletter } from '@/app/prototipos/0.6/components/zona-gamer/GamerNewsletter';
import { GamerNavbar } from '@/app/prototipos/0.6/components/zona-gamer/GamerNavbar';
import { BlipChat, useBlipChat } from '@/app/prototipos/0.6/components/BlipChat';
import { GamerOnboardingTour } from '@/app/prototipos/0.6/components/zona-gamer/GamerOnboardingTour';
import type { OnboardingStep } from './types/catalog';
import { Toast, useToast, CubeGridSpinner, useIsMobile, useScrollToTop } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { CartSelectionModal } from './components/catalog/CartSelectionModal';
import { CartDrawer } from './components/catalog/CartDrawer';
import { CartLimitModal } from './components/catalog/CartLimitModal';

// Extracted gamer catalog components
import {
  gamerTheme,
  GamerProductCard,
  GamerPromoBanner,
  GamerHelpButton,
  GamerCardSkeleton,
  GamerCompareModal,
  GamerSidebar,
  GamerSortDropdown,
  GamerActiveFilters,
} from './components/gamer';

// ============================================
// Main export
// ============================================

export function GamerCatalogoClient() {
  const params = useParams();
  const landing = (params.landing as string) || 'zona-gamer';

  return (
    <ProductProvider landingSlug={landing}>
      <Suspense fallback={<GamerLoadingFallback />}>
        <GamerCatalogoContent />
      </Suspense>
    </ProductProvider>
  );
}

function GamerLoadingFallback() {
  // Fondo y centrado provisto por .gamer-loading-fallback en globals.css.
  // El <html data-bc-theme="..."> lo setea el script inline en el root layout.
  return (
    <div className="gamer-loading-fallback">
      <CubeGridSpinner />
    </div>
  );
}

// ============================================
// Content
// ============================================

function GamerCatalogoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const landing = (params.landing as string) || 'zona-gamer';

  // Scroll to top on mount (when arriving from another route with scroll)
  useScrollToTop();
  // Note: we don't use ProductContext setters here — we write directly to localStorage
  // because each page has its own ProductProvider instance.

  // Theme - persist to localStorage (SSR-safe: always start dark, hydrate from localStorage)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [themeHydrated, setThemeHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('baldecash-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    setThemeHydrated(true);
  }, []);
  useEffect(() => { if (themeHydrated) localStorage.setItem('baldecash-theme', theme); }, [theme, themeHydrated]);
  const isDark = theme === 'dark';
  const T = gamerTheme(isDark);

  // Grid columns detection (for row completion)
  // Gamer layout: 260px cards, 260px sidebar, 14px gap, 48px padding
  const { gridRef, columns: gridColumns } = useGridColumns({
    cardMinWidth: 260,
    sidebarWidth: 260,
    gridGap: 14,
    layoutPadding: 48,
  });

  // Preview
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;
  // TODO: when GamerNavbar accepts previewBannerOffset, pass `previewKey ? 24 : 0`
  // so the sticky secondary nav leaves space for the preview banner (parity with Navbar normal).

  // Parse URL filters
  const initialUrlFilters = useMemo(() => parseFiltersFromParams(searchParams), [searchParams]);
  const [filters, setFilters] = useState<FilterState>(() => mergeFiltersWithDefaults(initialUrlFilters));
  const [sort, setSort] = useState<SortOption>((initialUrlFilters as { sort?: SortOption }).sort || 'recommended');
  const [searchQuery, setSearchQuery] = useState((initialUrlFilters as { searchQuery?: string }).searchQuery || '');
  // Brand slug-to-id mapping from API (stable once loaded).
  // brand_ids (not brand slugs) is what the catalog API accepts for the brands filter.
  const [brandMapping, setBrandMapping] = useState<Map<string, number>>(new Map());
  // Deferred value: keeps the input snappy while the grid re-fetches with lower priority
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Layout data (navbar items, promo banner) desde /landing/zona-gamer/layout
  const { navbarProps, isLoading: isLayoutLoading, hasError: hasLayoutError, settings } = useLayout();
  const ALLOW_MULTI_PRODUCT = getAllowMultiProduct(settings);
  const MAX_MONTHLY_QUOTA = getMaxMonthlyQuota(settings);

  // Onboarding tour (custom steps for zona-gamer)
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const gamerTourSteps: OnboardingStep[] = useMemo(() => [
    {
      id: 'filters',
      targetId: 'onboarding-filters-desktop',
      targetIdMobile: 'onboarding-filters-mobile',
      title: 'Filtros avanzados',
      description: 'Ajusta marca, precio, RAM y más para encontrar exactamente lo que buscas.',
      position: 'right',
      positionMobile: 'bottom',
    },
    {
      id: 'sort',
      targetId: 'onboarding-sort',
      title: 'Ordena resultados',
      description: 'Ordena por precio, cuota mensual o popularidad.',
      position: 'bottom',
      positionMobile: 'bottom',
    },
    {
      id: 'card-favorite',
      targetId: 'onboarding-card-favorite',
      title: 'Añadir a favoritos',
      description: 'Haz clic en el corazón para guardar este equipo en tu lista de favoritos.',
      position: 'left',
      positionMobile: 'bottom',
    },
    {
      id: 'card-compare',
      targetId: 'onboarding-card-compare',
      title: 'Comparar equipos',
      description: 'Selecciona hasta 3 equipos para ver sus diferencias lado a lado.',
      position: 'left',
      positionMobile: 'bottom',
    },
    {
      id: 'card-detail',
      targetId: 'onboarding-card-detail',
      title: 'Ver detalle',
      description: 'Explora todas las especificaciones, fotos y características del equipo.',
      position: 'top',
      positionMobile: 'top',
    },
    {
      id: 'card-add-to-cart',
      targetId: 'onboarding-card-add-to-cart',
      title: '¡Lo quiero!',
      description: ALLOW_MULTI_PRODUCT
        ? 'Añade el equipo al carrito o solicítalo directamente.'
        : 'Solicita este equipo directamente para iniciar tu financiamiento.',
      position: 'top',
      positionMobile: 'top',
    },
    {
      id: 'wishlist',
      targetId: 'onboarding-wishlist',
      title: 'Tus favoritos',
      description: 'Accede rápidamente a todos los equipos que has marcado como favoritos.',
      position: 'bottom',
      positionMobile: 'bottom',
    },
    ...(ALLOW_MULTI_PRODUCT ? [{
      id: 'cart',
      targetId: 'onboarding-cart',
      title: 'Tu carrito',
      description: 'Revisa los equipos que has agregado y continúa con tu solicitud.',
      position: 'bottom' as const,
      positionMobile: 'bottom' as const,
    }] : []),
  ], [ALLOW_MULTI_PRODUCT]);
  const currentTourStep = tourActive ? gamerTourSteps[tourStep] || null : null;
  const handleTourNext = useCallback(() => {
    if (tourStep >= gamerTourSteps.length - 1) {
      setTourActive(false);
      setTourStep(0);
    } else {
      setTourStep(s => s + 1);
    }
  }, [tourStep, gamerTourSteps.length]);
  const handleTourPrev = useCallback(() => setTourStep(s => Math.max(0, s - 1)), []);
  const handleTourSkip = useCallback(() => { setTourActive(false); setTourStep(0); }, []);
  const handleStartTour = useCallback(() => { setTourStep(0); setTourActive(true); }, []);

  // Mobile filters
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);
  const wishlistToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  // Drag-to-dismiss state for the mobile search bottom sheet
  const [sheetDragY, setSheetDragY] = useState(0);
  const sheetDragStartRef = useRef<number | null>(null);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSearchResults, setMobileSearchResults] = useState<{ id: string; slug: string; name: string; displayName: string; brand: string; thumbnail: string; images: string[]; quotaMonthly: number; maxTermMonths: number }[]>([]);
  const [mobileSearchLoading, setMobileSearchLoading] = useState(false);
  const mobileSearchDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Monotonic request id: only the latest in-flight mobile search applies to state.
  // This prevents race conditions when fetchCatalogData (which doesn't accept a signal)
  // has multiple in-flight calls due to rapid typing or sheet close/reopen.
  const mobileSearchReqIdRef = useRef(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial page loading gate: prevents the grid/empty-state flash before the
  // first paint is ready. Mirrors the pattern used in CatalogoClient normal.
  const [isPageLoading, setIsPageLoading] = useState(true);
  useEffect(() => {
    setIsPageLoading(false);
  }, []);

  // Scroll to top button
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sidebar sections collapsed state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    // Specs — lo que más buscan los gamers
    gpu: true,
    procesador: true,
    ram: true,
    almacenamiento: true,
    pantalla: true,
    // Precio y comercial
    cuota: true,
    destacados: false,
    marca: false,
    // Secundarios
    uso: false,
    condicion: false,
  });

  // Build API filters (uses deferredSearchQuery so typing stays snappy)
  const apiFilters = useMemo((): ApiCatalogFilters => {
    const af: ApiCatalogFilters = {};
    if (deferredSearchQuery.trim()) af.q = deferredSearchQuery.trim();
    // Brands: convert slugs to numeric brand_ids via the mapping loaded from the filters API
    if (filters.brands.length > 0 && brandMapping.size > 0) {
      const brandIds = filters.brands
        .map((slug) => brandMapping.get(slug))
        .filter((id): id is number => id !== undefined);
      if (brandIds.length > 0) {
        af.brand_ids = brandIds;
      }
    }
    if (filters.deviceTypes.length > 0) {
      af.types = filters.deviceTypes;
    }
    if (filters.gama.length > 0) af.gamas = filters.gama;
    if (filters.condition.length > 0) af.conditions = filters.condition;
    if (filters.usage.length > 0) af.usages = filters.usage;
    if (filters.tags.length > 0) af.labels = filters.tags;
    if (filters.quotaRange[0] !== defaultFilterState.quotaRange[0]) af.min_quota = filters.quotaRange[0];
    if (filters.quotaRange[1] !== defaultFilterState.quotaRange[1]) af.max_quota = filters.quotaRange[1];
    // Specs
    const specs: Record<string, unknown> = {};
    if (filters.ram.length > 0) specs.ram = filters.ram;
    if (filters.storage.length > 0) specs.storage = filters.storage;
    if (filters.gpuType.length > 0) specs.gpu = filters.gpuType;
    if (filters.processorModel.length > 0) specs.processor = filters.processorModel;
    if (filters.displaySize.length > 0) specs.screen_size = filters.displaySize;
    if (Object.keys(specs).length > 0) af.specs = specs;
    return af;
  }, [filters, deferredSearchQuery, landing, brandMapping]);

  // API sort mapping
  const apiSortBy = useMemo((): ApiSortBy => {
    const map: Record<SortOption, ApiSortBy> = {
      recommended: 'display_order',
      price_asc: 'price_asc',
      price_desc: 'price_desc',
      quota_asc: 'price_asc',
      newest: 'newest',
      popular: 'featured',
    };
    return map[sort];
  }, [sort]);

  // Only fetch products once the brand mapping is loaded (if brand filters are active).
  // Otherwise brand_ids would be missing on the first request and the filter would be ignored.
  const isReadyToFetchProducts = filters.brands.length === 0 || brandMapping.size > 0;

  // Fetch products from DB
  const {
    products,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
  } = useCatalogProducts({
    landingSlug: landing,
    filters: apiFilters,
    sortBy: apiSortBy,
    enabled: isReadyToFetchProducts,
    previewKey,
    gridColumns,
  });

  // Productos tal cual vienen del endpoint, sin filtros frontend ni overrides de thumbnail
  const allProducts = products;
  const displayTotal = total;

  // Derive applied filters for contextual counts (each filter option count reflects
  // how many products remain if *that* filter is applied given the other active filters).
  const appliedFiltersForCounts = useMemo((): AppliedFiltersForCounts => {
    const { q: _q, product_ids: _pids, is_featured: _feat, brand_id: _bid, type: _type, specs: rawSpecs, ...rest } = apiFilters;
    void _q; void _pids; void _feat; void _bid; void _type;
    return {
      ...rest,
      ...(rawSpecs && Object.keys(rawSpecs).length > 0 && {
        specs: rawSpecs as Record<string, (string | number | boolean)[]>,
      }),
    };
  }, [apiFilters]);

  // Fetch filter options (with contextual counts driven by the applied filters)
  const catalogFilters = useCatalogFilters(landing, appliedFiltersForCounts);

  // Populate brandMapping once apiFilters.brands is available
  useEffect(() => {
    if (catalogFilters.apiFilters?.brands && brandMapping.size === 0) {
      const newMapping = new Map(catalogFilters.apiFilters.brands.map((b) => [b.slug, b.id]));
      setBrandMapping(newMapping);
    }
  }, [catalogFilters.apiFilters?.brands, brandMapping.size]);

  // Cart / Wishlist
  const {
    wishlistCount,
    cartCount,
    toggleWishlist,
    isInWishlist,
    wishlist,
    removeFromWishlist,
    clearWishlist,
    // Cart (multi-product)
    cart: cartItems,
    cartIds,
    addToCart: addCartItem,
    removeFromCart: removeCartItem,
    clearCart: clearCartItems,
    isInCart,
    unavailableCartIds,
    unavailableWishlistIds,
    isHydrated: isCartWishlistHydrated,
  } = useCatalogSharedState(landing, previewKey);

  // Toast
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast(4000);

  // Analytics
  const analytics = useAnalytics();
  // Optional session tracker (shared with solicitar) — used for cross-page product/compare events.
  // Optional because the EventTrackerProvider may not be mounted when the user isn't in a session.
  const tracker = useEventTrackerOptional();

  // Tracked setters: wrap raw state setters to emit analytics events on change
  const setSortTracked = useCallback((next: SortOption) => {
    setSort((prev) => {
      if (prev !== next) analytics.trackSortChange({ from: prev, to: next });
      return next;
    });
  }, [analytics]);

  const handleSearchClear = useCallback((location: string = 'navbar') => {
    if (searchQuery) analytics.trackSearchClear({ location });
    setSearchQuery('');
  }, [analytics, searchQuery]);

  // Blip Chat
  const blipChat = useBlipChat();

  // Wishlist drawer
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);

  // Cart UI state (multi-product)
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedProductForCart, setSelectedProductForCart] = useState<CatalogProduct | null>(null);
  const [selectedVariantForCart, setSelectedVariantForCart] = useState<CartItem | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCartLimitModalOpen, setIsCartLimitModalOpen] = useState(false);
  const [attemptedCartProduct, setAttemptedCartProduct] = useState<CatalogProduct | null>(null);

  // Cart products (full data for handleCartContinue context building)
  const [cartProducts, setCartProducts] = useState<CatalogProduct[]>([]);
  useEffect(() => {
    if (isCartWishlistHydrated && cartIds.length > 0) {
      fetchProductsByIds(landing, cartIds, previewKey).then(setCartProducts);
    } else {
      setCartProducts([]);
    }
  }, [cartIds, isCartWishlistHydrated, landing, previewKey]);

  // Total monthly quota calculation
  const { totalMonthlyQuota } = useMemo(() => {
    const total = (cartItems || []).reduce((sum: number, item: CartItem) => sum + item.monthlyPayment, 0);
    return { totalMonthlyQuota: total };
  }, [cartItems]);
  const wishlistCatalogDropdownRef = useRef<HTMLDivElement | null>(null);
  const isMobileViewport = useIsMobile();

  // Cerrar dropdown desktop al hacer clic fuera
  useEffect(() => {
    if (!isWishlistDrawerOpen || isMobileViewport) return;
    const handleClick = (e: MouseEvent) => {
      if (wishlistCatalogDropdownRef.current && !wishlistCatalogDropdownRef.current.contains(e.target as Node)) {
        setIsWishlistDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isWishlistDrawerOpen, isMobileViewport]);

  // Compare — store IDs in localStorage and refetch product data from API.
  // Parity with CatalogoClient normal: avoids stale snapshots when prices change.
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareProducts, setCompareProducts] = useState<CatalogProduct[]>([]);
  const [isCompareListLoaded, setIsCompareListLoaded] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showDiffOnly, setShowDiffOnly] = useState(false);

  // Load compareList (IDs) from localStorage on mount.
  // Backwards compatibility: if an older snapshot (CatalogProduct[]) is stored,
  // extract the IDs and upgrade the storage format.
  useEffect(() => {
    const saved = localStorage.getItem(`baldecash-${landing}-compare`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length === 0) {
            setCompareList([]);
          } else if (typeof parsed[0] === 'string') {
            setCompareList(parsed as string[]);
          } else if (parsed[0] && typeof parsed[0] === 'object' && 'id' in parsed[0]) {
            // Legacy format — upgrade to IDs
            setCompareList((parsed as { id: string }[]).map((p) => p.id));
          }
        }
      } catch (e) {
        console.error('Error parsing compareList from localStorage:', e);
      }
    }
    setIsCompareListLoaded(true);
  }, [landing]);

  // Persist compareList (IDs) to localStorage
  useEffect(() => {
    if (isCompareListLoaded) {
      localStorage.setItem(`baldecash-${landing}-compare`, JSON.stringify(compareList));
    }
  }, [compareList, isCompareListLoaded, landing]);

  // Refetch compare product data from API when the list changes
  useEffect(() => {
    if (isCompareListLoaded && compareList.length > 0) {
      fetchProductsByIds(landing, compareList, previewKey).then(setCompareProducts);
    } else {
      setCompareProducts([]);
    }
  }, [compareList, isCompareListLoaded, landing, previewKey]);

  const getDeviceType = (product: CatalogProduct): string => {
    return product.deviceType || 'laptop';
  };

  const handleToggleCompare = useCallback((product: CatalogProduct) => {
    // Si ya está, quitarlo
    if (compareList.includes(product.id)) {
      setCompareList(prev => prev.filter(id => id !== product.id));
      tracker?.track('compare_remove', { product_id: product.id });
      return;
    }
    // Límite
    if (compareList.length >= 3) return;
    // Validar mismo tipo de dispositivo (usa compareProducts hidratado del API)
    if (compareProducts.length > 0) {
      const currentDeviceType = getDeviceType(compareProducts[0]);
      const newDeviceType = getDeviceType(product);
      if (currentDeviceType !== newDeviceType) {
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
    setCompareList(prev => [...prev, product.id]);
    tracker?.track('compare_add', { product_id: product.id });
  }, [compareList, compareProducts, showToast, tracker]);

  const handleOpenCompareModal = useCallback(() => {
    tracker?.track('compare_open', { product_count: compareList.length });
    setShowCompareModal(true);
  }, [compareList.length, tracker]);

  const isInCompare = useCallback((id: string) => compareList.includes(id), [compareList]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Handlers
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setShowSearchDropdown(q.trim().length > 0);
  }, []);

  const handleToggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handleBrandToggle = useCallback((brand: string) => {
    setFilters((prev) => {
      const next = prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand];
      return { ...prev, brands: next };
    });
  }, []);

  const handleGamaToggle = useCallback((gama: string) => {
    setFilters((prev) => {
      const next = (prev.gama as string[]).includes(gama)
        ? prev.gama.filter((g) => g !== gama)
        : [...prev.gama, gama as typeof prev.gama[number]];
      return { ...prev, gama: next };
    });
  }, []);

  const handleConditionToggle = useCallback((condition: string) => {
    setFilters((prev) => {
      const next = (prev.condition as string[]).includes(condition)
        ? prev.condition.filter((c) => c !== condition)
        : [...prev.condition, condition as typeof prev.condition[number]];
      return { ...prev, condition: next };
    });
  }, []);

  const handleDeviceTypeToggle = useCallback((type: string) => {
    setFilters((prev) => {
      const next = (prev.deviceTypes as string[]).includes(type)
        ? prev.deviceTypes.filter((t) => t !== type)
        : [...prev.deviceTypes, type as typeof prev.deviceTypes[number]];
      return { ...prev, deviceTypes: next };
    });
  }, []);

  const handleUsageToggle = useCallback((usage: string) => {
    setFilters((prev) => {
      const next = (prev.usage as string[]).includes(usage)
        ? prev.usage.filter((u) => u !== usage)
        : [...prev.usage, usage as typeof prev.usage[number]];
      return { ...prev, usage: next };
    });
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setFilters((prev) => {
      const next = (prev.tags as string[]).includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag as typeof prev.tags[number]];
      return { ...prev, tags: next };
    });
  }, []);

  const handleRamToggle = useCallback((ram: number) => {
    setFilters((prev) => {
      const next = prev.ram.includes(ram)
        ? prev.ram.filter((r) => r !== ram)
        : [...prev.ram, ram];
      return { ...prev, ram: next };
    });
  }, []);

  const handleStorageToggle = useCallback((storage: number) => {
    setFilters((prev) => {
      const next = prev.storage.includes(storage)
        ? prev.storage.filter((s) => s !== storage)
        : [...prev.storage, storage];
      return { ...prev, storage: next };
    });
  }, []);

  const handleGpuToggle = useCallback((gpu: string) => {
    setFilters((prev) => {
      const next = (prev.gpuType as string[]).includes(gpu)
        ? prev.gpuType.filter((g) => g !== gpu)
        : [...prev.gpuType, gpu as typeof prev.gpuType[number]];
      return { ...prev, gpuType: next };
    });
  }, []);

  const handleProcessorToggle = useCallback((proc: string) => {
    setFilters((prev) => {
      const next = (prev.processorModel as string[]).includes(proc)
        ? prev.processorModel.filter((p) => p !== proc)
        : [...prev.processorModel, proc as typeof prev.processorModel[number]];
      return { ...prev, processorModel: next };
    });
  }, []);

  const handleScreenSizeToggle = useCallback((size: number) => {
    setFilters((prev) => {
      const next = prev.displaySize.includes(size)
        ? prev.displaySize.filter((s) => s !== size)
        : [...prev.displaySize, size];
      return { ...prev, displaySize: next };
    });
  }, []);

  const handleQuotaRangeChange = useCallback((min: number, max: number) => {
    setFilters((prev) => ({ ...prev, quotaRange: [min, max] }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilterState);
    setSearchQuery('');
    setSort('recommended');
    analytics.trackFilterClearAll({ source: 'gamer_clear_all' });
  }, [analytics]);

  const handleLoadMore = useCallback(() => {
    analytics.trackLoadMore({ visible_count: products.length, total_count: total });
    loadMore();
  }, [analytics, products.length, total, loadMore]);

  const handleWishlistToggle = useCallback((product: CatalogProduct) => {
    const wasInWishlist = isInWishlist(product.id);
    const item: WishlistItem = {
      productId: product.id,
      slug: product.slug,
      name: product.displayName || product.name,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      image: (product.images?.length > 0 ? product.images[0] : product.thumbnail) || '/images/products/placeholder.jpg',
      lowestQuota: product.quotaMonthly,
      type: product.deviceType,
      months: (product.maxTermMonths || 24) as TermMonths,
      term: product.maxTermMonths,
      paymentFrequency: product.paymentFrequency,
      initialPercent: WIZARD_SELECTED_INITIAL,
      initialAmount: 0,
      monthlyPayment: product.quotaMonthly,
      addedAt: Date.now(),
    };
    toggleWishlist(item);
    setWishlistToast(wasInWishlist ? 'Eliminado de favoritos' : 'Agregado a favoritos');
    if (wishlistToastTimerRef.current) clearTimeout(wishlistToastTimerRef.current);
    wishlistToastTimerRef.current = setTimeout(() => {
      setWishlistToast(null);
      wishlistToastTimerRef.current = null;
    }, 2500);
  }, [toggleWishlist, isInWishlist]);

  // Clean up the wishlist toast timer on unmount to avoid setState-after-unmount
  useEffect(() => () => {
    if (wishlistToastTimerRef.current) clearTimeout(wishlistToastTimerRef.current);
  }, []);

  const handleProductDetail = useCallback((product: CatalogProduct) => {
    tracker?.track('product_click', {
      product_id: product.id,
      product_name: product.name,
      brand: product.brand,
      slug: product.slug,
    });
    router.push(routes.producto(landing, product.slug));
  }, [router, landing, tracker]);

  // Helper: find a product by ID in allProducts, or build one from a color sibling.
  // Parity with CatalogoClient normal — needed when a productId comes from wishlist/cart
  // and the id corresponds to a color variant of a parent product rather than the parent itself.
  const findProductOrSibling = useCallback((productId: string): CatalogProduct | null => {
    const direct = allProducts.find((p) => p.id === productId);
    if (direct) return direct;
    for (const parent of allProducts) {
      const sibling = parent.colors?.find((c) => c.productId === productId);
      if (sibling) {
        return {
          ...parent,
          id: productId,
          slug: sibling.slug || parent.slug,
          displayName: sibling.displayName || parent.displayName,
          name: sibling.displayName || parent.name,
          price: sibling.price ?? parent.price,
          quotaMonthly: sibling.quotaMonthly ?? parent.quotaMonthly,
          originalQuotaMonthly: sibling.originalQuotaMonthly ?? parent.originalQuotaMonthly,
          discount: sibling.discount ?? parent.discount,
          specs: sibling.specs ?? parent.specs,
          thumbnail: sibling.imageUrl || (sibling.images?.[0]) || parent.thumbnail,
          images: sibling.images || (sibling.imageUrl ? [sibling.imageUrl] : parent.images),
        };
      }
    }
    return null;
  }, [allProducts]);

  // "Lo quiero" handler — respects ALLOW_MULTI_PRODUCT.
  // Accepts optional variantInfo (CartItem) when the user selected a variant/color/initial from the card.
  const selectProductForWizard = useCallback((product: CatalogProduct, variantInfo?: CartItem | null) => {
    const selectedProductData = {
      id: product.id,
      slug: product.slug,
      name: product.displayName || product.name,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      monthlyPayment: variantInfo?.monthlyPayment ?? product.quotaMonthly,
      months: (variantInfo?.months ?? product.maxTermMonths ?? 24) as TermMonths,
      term: variantInfo?.term ?? variantInfo?.months ?? product.maxTermMonths,
      paymentFrequency: variantInfo?.paymentFrequency || product.paymentFrequency,
      initialPercent: variantInfo?.initialPercent ?? product.hookInitialPercent ?? 0,
      initialAmount: variantInfo?.initialAmount ?? 0,
      image: (product.images?.length > 0 ? product.images[0] : product.thumbnail) || '/images/products/placeholder.jpg',
      type: product.deviceType,
      variantId: variantInfo?.variantId || product.variantId,
      colorName: variantInfo?.colorName,
      colorHex: variantInfo?.colorHex,
      paymentPlans: variantInfo?.paymentPlans,
      specs: {
        processor: product.specs?.processor?.model || '',
        ram: product.specs?.ram ? `${product.specs.ram.size}GB RAM` : '',
        storage: product.specs?.storage ? `${product.specs.storage.size}GB ${product.specs.storage.type}` : '',
      },
    };
    // Write directly to localStorage (each page has its own ProductProvider instance).
    // Clear cart + accessories because user explicitly selected THIS single product.
    try {
      localStorage.setItem(getStorageKey(landing), JSON.stringify(selectedProductData));
      localStorage.removeItem(getCartProductsKey(landing));
      localStorage.removeItem(getAccessoriesKey(landing));
    } catch {
      // localStorage not available
    }
  }, [landing]);

  const handleOpenCartModal = useCallback((product: CatalogProduct) => {
    setSelectedProductForCart(product);
    setIsCartModalOpen(true);
  }, []);

  const handleAddToCart = useCallback((productId: string, product?: CatalogProduct, cartItem?: CartItem) => {
    if (!isInCart(productId)) {
      const productQuota = cartItem?.monthlyPayment || product?.quotaMonthly || 0;
      if (totalMonthlyQuota + productQuota > MAX_MONTHLY_QUOTA) {
        if (product) setAttemptedCartProduct(product);
        setIsCartLimitModalOpen(true);
        return;
      }
      if (cartItem) {
        addCartItem(cartItem);
      } else if (product) {
        const months = (product.maxTermMonths || 24) as TermMonths;
        addCartItem({
          productId: product.id,
          slug: product.slug,
          name: product.displayName || product.name,
          shortName: product.name,
          brand: product.brand,
          image: (product.images?.length > 0 ? product.images[0] : product.thumbnail) || '/images/products/placeholder.jpg',
          price: product.price,
          months,
          term: product.maxTermMonths ?? months,
          paymentFrequency: product.paymentFrequency,
          initialPercent: WIZARD_SELECTED_INITIAL,
          initialAmount: 0,
          monthlyPayment: product.quotaMonthly,
          type: product.deviceType,
          addedAt: Date.now(),
          specs: product.specs ? {
            processor: product.specs.processor?.model || '',
            ram: product.specs.ram ? `${product.specs.ram.size}GB RAM` : '',
            storage: product.specs.storage ? `${product.specs.storage.size}GB ${product.specs.storage.type}` : '',
          } : undefined,
        });
      }
      showToast('Producto añadido al carrito', 'success');
    }
  }, [isInCart, addCartItem, showToast, totalMonthlyQuota, MAX_MONTHLY_QUOTA]);

  const handleRemoveFromCart = useCallback((productId: string) => {
    removeCartItem(productId);
    // If the removed product matches the one saved for the wizard, clear it too
    try {
      const saved = localStorage.getItem(getStorageKey(landing));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id === productId) {
          localStorage.removeItem(getStorageKey(landing));
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [removeCartItem, landing]);

  const handleClearCart = useCallback(() => {
    clearCartItems();
    try {
      localStorage.removeItem(getStorageKey(landing));
      localStorage.removeItem(getCartProductsKey(landing));
    } catch {
      // localStorage not available
    }
  }, [clearCartItems, landing]);

  const handleProductSolicitar = useCallback((product: CatalogProduct, variantInfo?: CartItem | null) => {
    if (!ALLOW_MULTI_PRODUCT) {
      // Single-product mode: go directly to solicitar
      selectProductForWizard(product, variantInfo);
      router.push(routes.solicitar(landing));
      return;
    }
    // Multi-product mode: open cart selection modal (variant flows through selectedVariantForCart)
    if (variantInfo) setSelectedVariantForCart(variantInfo);
    handleOpenCartModal(product);
  }, [ALLOW_MULTI_PRODUCT, selectProductForWizard, router, landing, handleOpenCartModal]);

  const handleCartContinue = useCallback(() => {
    if ((cartItems || []).length === 0 || totalMonthlyQuota > MAX_MONTHLY_QUOTA) {
      if (totalMonthlyQuota > MAX_MONTHLY_QUOTA) showToast(`La cuota total supera S/${MAX_MONTHLY_QUOTA}/mes`, 'warning');
      return;
    }

    // Build products for solicitar context from CartItem[] + supplementary cartProducts data
    if ((cartItems || []).length > 0) {
      const productsForContext = (cartItems || []).map((item) => {
        const product = cartProducts.find((p) => p.id === item.productId);
        return {
          id: item.productId,
          slug: item.slug || product?.slug,
          name: item.name,
          shortName: item.shortName || item.name,
          brand: item.brand,
          price: item.price,
          monthlyPayment: item.monthlyPayment,
          months: item.months,
          term: item.term ?? item.months,
          paymentFrequency: item.paymentFrequency,
          initialPercent: item.initialPercent,
          initialAmount: Math.round((item.price * item.initialPercent) / 100),
          image: item.image,
          type: product?.deviceType || 'laptop',
          specs: product?.specs ? {
            processor: product.specs.processor?.model || '',
            ram: product.specs.ram ? `${product.specs.ram.size}GB RAM` : '',
            storage: product.specs.storage ? `${product.specs.storage.size}GB ${product.specs.storage.type}` : '',
          } : undefined,
          variantId: item.variantId,
          colorName: item.colorName,
          colorHex: item.colorHex,
          paymentPlans: item.paymentPlans,
        };
      });

      // Write directly to localStorage (each page has its own ProductProvider instance)
      try {
        localStorage.setItem(getStorageKey(landing), JSON.stringify(productsForContext[0]));
        localStorage.setItem(getCartProductsKey(landing), JSON.stringify(productsForContext));
      } catch {
        // localStorage not available
      }
    }

    analytics.trackCartContinue({
      item_count: (cartItems || []).length,
      total_monthly_quota: totalMonthlyQuota,
    });
    router.push(routes.solicitar(landing));
  }, [cartItems, cartProducts, totalMonthlyQuota, router, showToast, landing, analytics, MAX_MONTHLY_QUOTA]);

  // Detect which rows contain at least one promotional card so the sibling
  // (non-promo) cards in that row can reserve vertical space and stay aligned.
  // Parity with CatalogoClient normal.
  const promoSpacerFlags = useMemo(() => {
    const cols = gridColumns || 1;
    const flags = new Array(allProducts.length).fill(false);
    for (let i = 0; i < allProducts.length; i += cols) {
      const rowEnd = Math.min(i + cols, allProducts.length);
      let rowHasPromo = false;
      for (let j = i; j < rowEnd; j++) {
        if (allProducts[j].promotion?.template) {
          rowHasPromo = true;
          break;
        }
      }
      if (rowHasPromo) {
        for (let j = i; j < rowEnd; j++) flags[j] = true;
      }
    }
    return flags;
  }, [allProducts, gridColumns]);

  // Sync filter state to URL query params (shareable links)
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    const apiRange: [number, number] = [defaultFilterState.quotaRange[0], defaultFilterState.quotaRange[1]];
    const filterParams = buildParamsFromFilters(filters, sort, searchQuery, apiRange);
    const queryString = filterParams.toString().replace(/%2C/g, ',');
    router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  }, [filters, sort, searchQuery, router]);
  // Note: {scroll:false} ensures changing a filter doesn't scroll-jump to top

  // Scroll lock for drawers/sheets/modals (iOS Safari fix).
  // Prevents body scroll under the overlay and restores scrollY on close.
  const scrollYRef = useRef<number>(0);
  const isAnyOverlayOpen =
    showMobileFilters ||
    showMobileSearch ||
    (isWishlistDrawerOpen && isMobileViewport) ||
    isCartDrawerOpen ||
    showCompareModal ||
    isCartModalOpen ||
    isCartLimitModalOpen;

  useEffect(() => {
    if (isAnyOverlayOpen) {
      if (document.body.style.position !== 'fixed') {
        scrollYRef.current = window.scrollY;
      }
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      const savedScrollY = scrollYRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScrollY);
    }
  }, [isAnyOverlayOpen]);

  // Reset mobile search state when the bottom sheet closes
  useEffect(() => {
    if (!showMobileSearch) {
      setMobileSearchQuery('');
      setMobileSearchResults([]);
      setMobileSearchLoading(false);
      if (mobileSearchDebounce.current) {
        clearTimeout(mobileSearchDebounce.current);
        mobileSearchDebounce.current = undefined;
      }
      // Invalidate any in-flight request so it doesn't apply stale results
      mobileSearchReqIdRef.current += 1;
    }
  }, [showMobileSearch]);

  // Global Escape handler: closes the top-most overlay (by precedence)
  useEffect(() => {
    if (!isAnyOverlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Precedence: narrower/modal-like first
      if (isCartLimitModalOpen) { setIsCartLimitModalOpen(false); return; }
      if (isCartModalOpen) { setIsCartModalOpen(false); return; }
      if (showCompareModal) { setShowCompareModal(false); return; }
      if (showMobileSearch) { setSheetDragY(0); setShowMobileSearch(false); return; }
      if (showMobileFilters) { setShowMobileFilters(false); return; }
      if (isCartDrawerOpen) { setIsCartDrawerOpen(false); return; }
      if (isWishlistDrawerOpen) { setIsWishlistDrawerOpen(false); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    isAnyOverlayOpen,
    isCartLimitModalOpen,
    isCartModalOpen,
    showCompareModal,
    showMobileSearch,
    showMobileFilters,
    isCartDrawerOpen,
    isWishlistDrawerOpen,
  ]);

  // Active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.brands.length;
    count += filters.gama.length;
    count += filters.condition.length;
    count += filters.usage.length;
    count += filters.deviceTypes.length;
    count += filters.tags.length;
    count += filters.ram.length;
    count += filters.storage.length;
    count += filters.gpuType.length;
    count += filters.processorModel.length;
    count += filters.displaySize.length;
    if (searchQuery.trim()) count += 1;
    return count;
  }, [filters, searchQuery]);


  // Show loading until the first paint is ready AND layout data is fetched
  if (isPageLoading || isLayoutLoading) {
    return <GamerLoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  // Show full error page if API failed and no filters are applied
  if (error && activeFilterCount === 0) {
    return (
      <div style={{ background: T.bg, minHeight: '100vh', fontFamily: "'Rajdhani', sans-serif" }}>
        <GamerNavbar
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          catalogUrl={routes.catalogo(landing)}
          hideSecondaryBar
          fullWidth
        />
        <main style={{ paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{
              background: 'rgba(255,50,50,0.06)',
              border: `1px solid ${T.neonRed}40`,
              borderRadius: 16,
              padding: '40px 32px',
            }}>
              <AlertCircle style={{ width: 56, height: 56, color: T.neonRed, margin: '0 auto 16px', display: 'block' }} />
              <h1 style={{
                fontSize: 22, fontWeight: 700, color: T.textPrimary,
                fontFamily: "'Rajdhani', sans-serif", marginBottom: 8,
              }}>
                Catálogo no disponible
              </h1>
              <p style={{ fontSize: 14, color: T.textSecondary, marginBottom: 24 }}>
                {error || 'No se pudieron cargar los productos del catálogo'}
              </p>
              <button
                onClick={() => router.push(routes.landingHome(landing))}
                style={{
                  padding: '12px 32px', background: T.neonCyan, border: 'none',
                  borderRadius: 10, color: '#0a0a0a', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: "'Rajdhani', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700&family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;500;600;700&display=swap');
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(0,255,213,0.3); }
          50% { box-shadow: 0 0 20px rgba(0,255,213,0.6); }
        }
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60% { content: '...'; }
          80%, 100% { content: ''; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ====== PROMO BANNER ====== (solo se muestra si el backend devuelve data) */}
      {navbarProps?.promoBannerData && (navbarProps.promoBannerData.text || navbarProps.promoBannerData.highlight) && (
        <GamerPromoBanner
          isDark={isDark}
          T={T}
          text={navbarProps.promoBannerData.text}
          highlight={navbarProps.promoBannerData.highlight}
          ctaText={navbarProps.promoBannerData.ctaText}
          ctaUrl={navbarProps.promoBannerData.ctaUrl || routes.catalogo(landing)}
          dismissible={navbarProps.promoBannerData.dismissible}
        />
      )}

      {/* ====== HEADER ====== */}
      <GamerNavbar
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        catalogUrl={routes.catalogo(landing)}
        hideSecondaryBar
        fullWidth
        onMobileMenuChange={setMobileMenuOpen}
      />

      {/* ====== SECONDARY NAV ====== */}
      <div
        className={mobileMenuOpen ? 'max-md:hidden' : ''}
        style={{
          background: isDark ? 'rgba(14,14,14,0.95)' : 'rgba(255,255,255,0.95)',
          borderBottom: `1px solid ${T.border}`,
          padding: '0 24px',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 'clamp(52px, 10vw, 64px)',
          zIndex: 99,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
            gap: 16,
          }}
        >

          {/* Mobile search button */}
          <div className="md:hidden">
            <button
              aria-label="Abrir búsqueda"
              onClick={() => { setShowMobileSearch(true); setMobileSearchQuery(searchQuery); }}
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: T.bgSurface, border: `1px solid ${T.border}`,
                color: isDark ? '#fff' : '#555', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop search box */}
          <div className="hidden md:flex" style={{ flex: 1, justifyContent: 'center' }}>
            <div ref={searchBoxRef} style={{ position: 'relative', width: 600, maxWidth: '100%' }}>
              <div
                className="focus-within:shadow-[0_0_15px_rgba(0,255,213,0.1)]"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  background: T.bgSurface,
                  border: `2px solid ${showSearchDropdown ? 'rgba(70,84,205,0.5)' : (isDark ? 'rgba(70,84,205,0.2)' : '#d0d0d0')}`,
                  borderRadius: 12,
                  padding: '0 12px',
                  height: 40,
                  transition: 'all 0.3s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isDark ? '#fff' : '#999', flexShrink: 0 }}>
                  <path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" />
                </svg>
                <input
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  placeholder="Buscar equipos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => { if (searchQuery.trim() && allProducts.length > 0) setShowSearchDropdown(true); }}
                  onKeyDown={(e) => { if (e.key === 'Escape') setShowSearchDropdown(false); }}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    padding: '8px 12px', fontSize: 14, color: isDark ? '#fff' : '#333',
                    fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.5px',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { handleSearchClear('desktop_search'); setShowSearchDropdown(false); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, padding: 2 }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search dropdown */}
              {showSearchDropdown && searchQuery.trim() && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
                  background: isDark ? '#1a1a1a' : '#fff',
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 40px rgba(0,0,0,0.15)',
                  maxHeight: 400, overflowY: 'auto', zIndex: 200,
                }}>
                  {isLoading && (
                    <div style={{ padding: '16px 20px', textAlign: 'center', color: T.textMuted, fontSize: 13, fontFamily: "'Rajdhani', sans-serif" }}>
                      Buscando...
                    </div>
                  )}
                  {!isLoading && allProducts.length === 0 && (
                    <div style={{ padding: '16px 20px', textAlign: 'center', color: T.textMuted, fontSize: 13, fontFamily: "'Rajdhani', sans-serif" }}>
                      No se encontraron equipos para &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                  {!isLoading && allProducts.length > 0 && (
                    <>
                      {allProducts.slice(0, 8).map((product) => (
                        <button
                          key={product.id}
                          onClick={() => { setShowSearchDropdown(false); router.push(routes.producto(landing, product.slug)); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                            padding: '10px 16px', background: 'none', border: 'none',
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0'}`,
                            cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#f8f8f8'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                        >
                          <div style={{
                            width: 44, height: 44, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                            background: isDark ? '#111' : '#f5f5f5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <img
                              src={(product.images?.length > 0 ? product.images[0] : product.thumbnail) || '/images/products/placeholder.jpg'}
                              alt={product.displayName || product.name}
                              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                              onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f0f0f0' : '#333', fontFamily: "'Rajdhani', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.displayName || product.name}
                            </div>
                            <div style={{ fontSize: 11, color: T.textMuted, fontFamily: "'Share Tech Mono', monospace" }}>
                              {product.brand}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.neonCyan, fontFamily: "'Orbitron', sans-serif" }}>
                              S/{Math.round(product.quotaMonthly)}<span style={{ fontSize: 10, color: T.textMuted }}>/mes</span>
                            </div>
                            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: "'Share Tech Mono', monospace" }}>
                              x {product.maxTermMonths || 24} meses
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile spacer */}
          <div className="md:hidden" style={{ flex: 1 }} />

          {/* Actions: favorites + cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Favorites button — dropdown desktop / bottom-sheet mobile */}
            <div ref={wishlistCatalogDropdownRef} style={{ position: 'relative' }}>
              <button
                id="onboarding-wishlist"
                onClick={() => setIsWishlistDrawerOpen(prev => !prev)}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: T.bgSurface, border: `1px solid ${T.border}`,
                  color: isDark ? '#fff' : '#555', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s', position: 'relative',
                }}
                aria-label={`Favoritos${wishlistCount > 0 ? ` (${wishlistCount})` : ''}`}
                title="Favoritos"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -5, right: -5,
                    minWidth: 18, height: 18, borderRadius: '50%',
                    background: '#ff0055', color: '#fff',
                    fontSize: 10, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(255,0,85,0.5)', padding: '0 4px', lineHeight: 1,
                  }}>
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Desktop dropdown */}
              {isWishlistDrawerOpen && !isMobileViewport && (
                <div
                  className="hidden md:block absolute top-full right-0 mt-2 w-80 rounded-xl overflow-hidden z-50"
                  style={{
                    background: isDark ? '#1a1a1a' : '#fff',
                    border: `1px solid ${T.border}`,
                    boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.12)',
                  }}
                >
                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${isDark ? '#2a2a2a' : '#f0f0f0'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Heart className="w-4 h-4" style={{ color: T.neonCyan, fill: T.neonCyan }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, fontFamily: "'Rajdhani', sans-serif" }}>
                        Mis favoritos ({wishlistCount})
                      </span>
                    </div>
                    {wishlistCount > 0 && (
                      <button
                        onClick={() => clearWishlist()}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: T.textMuted, fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  {wishlistCount === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                      <Heart className="w-10 h-10 mx-auto mb-2" style={{ color: isDark ? '#3a3a3a' : '#d4d4d4' }} />
                      <p style={{ fontSize: 13, color: T.textMuted, margin: 0, fontFamily: "'Rajdhani', sans-serif" }}>Sin favoritos aún</p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: 340, overflowY: 'auto', padding: 10 }}>
                      {wishlist.map((item) => (
                        <div
                          key={item.productId}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 8, background: isDark ? '#222' : '#fafafa', marginBottom: 6 }}
                        >
                          <div
                            onClick={() => {
                              setIsWishlistDrawerOpen(false);
                              if (item.slug) router.push(routes.producto(landing, item.slug));
                            }}
                            style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, background: isDark ? '#2a2a2a' : '#fff', border: `1px solid ${isDark ? '#333' : '#e5e5e5'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image || '/images/products/placeholder.jpg'}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 11, color: T.textMuted, margin: 0, textTransform: 'uppercase' }}>{item.brand}</p>
                            <p
                              onClick={() => {
                                setIsWishlistDrawerOpen(false);
                                if (item.slug) router.push(routes.producto(landing, item.slug));
                              }}
                              style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, margin: 0, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Rajdhani', sans-serif" }}
                            >
                              {item.name}
                            </p>
                            <p style={{ fontSize: 12, fontWeight: 700, color: T.neonCyan, margin: '2px 0 0', fontFamily: "'Rajdhani', sans-serif" }}>
                              S/{Math.floor(item.monthlyPayment)}/mes
                              <span style={{ fontWeight: 400, color: T.textMuted, marginLeft: 4, fontSize: 11 }}>
                                x {item.months} meses
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromWishlist(item.productId)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.textMuted, display: 'flex' }}
                            aria-label="Quitar de favoritos"
                            title="Quitar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart button — only when multi-product is enabled */}
            {ALLOW_MULTI_PRODUCT && (
              <button
                id="onboarding-cart"
                onClick={() => setIsCartDrawerOpen(true)}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: T.bgSurface, border: `1px solid ${T.border}`,
                  color: isDark ? '#fff' : '#555', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s', position: 'relative',
                }}
                aria-label={`Carrito${cartCount > 0 ? ` (${cartCount})` : ''}`}
                title="Carrito"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -5, right: -5,
                    minWidth: 18, height: 18, borderRadius: '50%',
                    background: T.neonCyan, color: isDark ? '#0a0a0a' : '#fff',
                    fontSize: 10, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 8px ${T.neonCyan}80`, padding: '0 4px', lineHeight: 1,
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* ====== CATALOG INTRO ====== */}
      <section id="catalogo" style={{ padding: '40px 0 20px' }}>
        <div className="w-full" style={{ padding: '0 24px' }}>
          <div
            className="inline-flex items-center gap-2"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: T.neonCyan,
              marginBottom: 16,
              padding: '5px 14px',
              borderRadius: 4,
              background: isDark ? 'rgba(0,255,213,0.05)' : 'rgba(14,148,133,0.06)',
              border: `1px solid ${isDark ? 'rgba(0,255,213,0.12)' : 'rgba(14,148,133,0.15)'}`,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
            CATÁLOGO GAMING
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(36px, 5vw, 64px)',
              lineHeight: 1,
              letterSpacing: 1,
              marginBottom: 16,
              color: isDark ? '#ffffff' : '#1a1a1a',
            }}
          >
            NUESTRO{' '}
            <span
              style={{
                backgroundImage: isDark
                  ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              CATÁLOGO
            </span>
          </h2>
          <p style={{ color: isDark ? '#ffffff' : '#333', fontSize: 16, maxWidth: 560, lineHeight: 1.6 }}>
            Filtra por marca, gama, uso y más. Encuentra el equipo perfecto para ti.
          </p>
        </div>
      </section>

      {/* ====== FIND YOUR DEVICE CARD ====== */}
      <div className="w-full" style={{ padding: '0 24px 16px' }}>
        <div style={{
          background: isDark ? T.bgCard : '#fff',
          border: `1px solid ${isDark ? T.border : 'rgba(0,0,0,0.08)'}`,
          borderRadius: 16,
          padding: 'clamp(16px, 4vw, 24px)',
          boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: `${T.neonCyan}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Search className="w-5 h-5" style={{ color: T.neonCyan }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: 'clamp(14px, 3.5vw, 18px)', fontWeight: 700, color: T.textPrimary, margin: 0, fontFamily: "'Rajdhani', sans-serif", lineHeight: 1.3 }}>
                  Encuentra tu equipo ideal
                </h2>
                <p style={{ fontSize: 'clamp(11px, 2.5vw, 14px)', color: T.textMuted, margin: 0 }}>
                  Selecciona según tu necesidad principal
                </p>
              </div>
            </div>
            <div id="onboarding-sort" className="flex items-center gap-2 sm:gap-4 min-w-0">
              <span style={{ fontSize: 13, color: T.textMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>
                <span style={{ fontWeight: 600, color: T.textPrimary }}>{displayTotal}</span> equipos
              </span>
              <GamerSortDropdown
                isDark={isDark}
                T={T}
                sort={sort}
                onSortChange={setSortTracked}
                options={catalogFilters.sortOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ====== MAIN CONTENT ====== */}
      <div
        className="w-full"
        style={{ padding: '24px 24px', display: 'flex', gap: 20 }}
      >
        {/* ====== SIDEBAR FILTERS (desktop) ====== */}
        <aside
          id="onboarding-filters-desktop"
          className="hidden lg:block shrink-0"
          style={{
            width: 260,
            position: 'sticky',
            top: 130,
            maxHeight: 'calc(100svh - 150px)',
            overflow: 'hidden',
          }}
        >
          <GamerSidebar
            isDark={isDark}
            T={T}
            filters={filters}
            apiFilters={catalogFilters.apiFilters}
            sort={sort}
            onSortChange={setSortTracked}
            expandedSections={expandedSections}
            onToggleSection={handleToggleSection}
            onBrandToggle={handleBrandToggle}
            onGamaToggle={handleGamaToggle}
            onConditionToggle={handleConditionToggle}
            onDeviceTypeToggle={handleDeviceTypeToggle}
            onUsageToggle={handleUsageToggle}
            onTagToggle={handleTagToggle}
            onRamToggle={handleRamToggle}
            onStorageToggle={handleStorageToggle}
            onGpuToggle={handleGpuToggle}
            onProcessorToggle={handleProcessorToggle}
            onScreenSizeToggle={handleScreenSizeToggle}
            onQuotaRangeChange={handleQuotaRangeChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
            sortOptions={catalogFilters.sortOptions}
            isFiltersLoading={catalogFilters.isLoading}
          />
        </aside>

        {/* ====== PRODUCT GRID ====== */}
        <main className="lg:pt-5" style={{ flex: 1, minWidth: 0 }}>
          {/* Mobile filter panel - fullscreen overlay */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-[100] flex flex-col" style={{ background: isDark ? '#0e0e0e' : '#fff' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SlidersHorizontal className="w-5 h-5" style={{ color: T.neonCyan }} />
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, margin: 0, fontFamily: "'Rajdhani', sans-serif" }}>Filtros</h2>
                </div>
                <button aria-label="Cerrar filtros" onClick={() => setShowMobileFilters(false)} style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: `1px solid ${T.border}`, color: T.textSecondary, cursor: 'pointer' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Scrollable filters */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
                <GamerSidebar
                  isDark={isDark}
                  T={T}
                  filters={filters}
                  apiFilters={catalogFilters.apiFilters}
                  sort={sort}
                  onSortChange={setSortTracked}
                  expandedSections={expandedSections}
                  onToggleSection={handleToggleSection}
                  onBrandToggle={handleBrandToggle}
                  onGamaToggle={handleGamaToggle}
                  onConditionToggle={handleConditionToggle}
                  onDeviceTypeToggle={handleDeviceTypeToggle}
                  onUsageToggle={handleUsageToggle}
                  onTagToggle={handleTagToggle}
                  onRamToggle={handleRamToggle}
                  onStorageToggle={handleStorageToggle}
                  onGpuToggle={handleGpuToggle}
                  onProcessorToggle={handleProcessorToggle}
                  onScreenSizeToggle={handleScreenSizeToggle}
                  onQuotaRangeChange={handleQuotaRangeChange}
                  onClearFilters={handleClearFilters}
                  activeFilterCount={activeFilterCount}
                  sortOptions={catalogFilters.sortOptions}
                  isFiltersLoading={catalogFilters.isLoading}
                  bare
                />
              </div>
              {/* Footer */}
              <div style={{ padding: '16px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => { handleClearFilters(); }} style={{ padding: '12px 20px', borderRadius: 12, border: `1px solid ${T.border}`, background: 'none', color: T.textSecondary, fontSize: 14, fontWeight: 600, fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer' }}>
                  Limpiar
                </button>
                <button onClick={() => setShowMobileFilters(false)} style={{ flex: 1, padding: '12px 20px', borderRadius: 12, border: 'none', background: T.neonCyan, color: isDark ? '#0a0a0a' : '#fff', fontSize: 14, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer' }}>
                  Ver {displayTotal} resultados
                </button>
              </div>
            </div>
          )}

          {/* Active filters bar */}
          {activeFilterCount > 0 && (
            <GamerActiveFilters
              isDark={isDark}
              T={T}
              filters={filters}
              searchQuery={searchQuery}
              onBrandToggle={handleBrandToggle}
              onGamaToggle={handleGamaToggle}
              onConditionToggle={handleConditionToggle}
              onDeviceTypeToggle={handleDeviceTypeToggle}
              onUsageToggle={handleUsageToggle}
              onTagToggle={handleTagToggle}
              onRamToggle={handleRamToggle}
              onStorageToggle={handleStorageToggle}
              onGpuToggle={handleGpuToggle}
              onProcessorToggle={handleProcessorToggle}
              onScreenSizeToggle={handleScreenSizeToggle}
              onClearSearch={() => handleSearchClear('active_filters_chip')}
              onClearAll={handleClearFilters}
            />
          )}

          {/* Error state */}
          {error && (
            <div
              style={{
                padding: '40px 24px',
                textAlign: 'center',
                color: T.neonRed,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 14,
              }}
            >
              Error al cargar productos: {error}
            </div>
          )}

          {/* Loading skeleton — rounded to fill complete rows */}
          {isLoading && !error && (
            <div
              ref={gridRef}
              className="gap-[14px]"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
            >
              {Array.from({ length: roundToColumns(12, gridColumns) }).map((_, i) => (
                <GamerCardSkeleton key={i} isDark={isDark} T={T} />
              ))}
            </div>
          )}

          {/* Products grid — auto-fill: el número de columnas crece con el ancho disponible */}
          {!isLoading && !error && allProducts.length > 0 && (
            <>
              <div
                ref={gridRef}
                className="gamer-products-grid gap-[14px]"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                }}
              >
                {allProducts.map((product, idx) => (
                  <GamerProductCard
                    key={product.landingProductId ?? product.id}
                    product={product}
                    isDark={isDark}
                    T={T}
                    isWishlisted={isInWishlist(product.id)}
                    onWishlistToggle={() => handleWishlistToggle(product)}
                    isCompared={isInCompare(product.id)}
                    onCompare={() => handleToggleCompare(product)}
                    onDetail={() => handleProductDetail(product)}
                    onSolicitar={() => handleProductSolicitar(product)}
                    isInCart={ALLOW_MULTI_PRODUCT ? isInCart(product.id) : false}
                    isFirstCard={idx === 0}
                    needsPromoSpacer={promoSpacerFlags[idx]}
                    onHoverStart={() => {
                      tracker?.track('product_hover', {
                        product_id: product.id,
                        product_name: product.name,
                        brand: product.brand,
                      });
                    }}
                  />
                ))}
              </div>

              {/* Load More skeletons */}
              {isLoadingMore && (
                <div
                  className="gap-[14px] mt-[14px]"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
                >
                  {Array.from({ length: roundToColumns(6, gridColumns) }).map((_, i) => (
                    <GamerCardSkeleton key={`more-${i}`} isDark={isDark} T={T} />
                  ))}
                </div>
              )}

              {/* Load More button */}
              {hasMore && !isLoadingMore && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <button
                    onClick={handleLoadMore}
                    style={{
                      padding: '14px 40px',
                      background: 'transparent',
                      border: `2px solid ${T.neonCyan}`,
                      borderRadius: 12,
                      color: T.neonCyan,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: 1,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  >
                    Cargar más
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {!isLoading && !error && allProducts.length === 0 && (
            <div
              style={{
                padding: '60px 24px',
                textAlign: 'center',
              }}
            >
              <Zap
                className="mx-auto mb-4"
                style={{ width: 48, height: 48, color: T.neonCyan, opacity: 0.4 }}
              />
              {activeFilterCount > 0 ? (
                <>
                  <p
                    style={{
                      color: T.textSecondary,
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    No encontramos productos con esos filtros
                  </p>
                  <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 20 }}>
                    Intenta cambiar los filtros o buscar algo diferente
                  </p>
                  <button
                    onClick={handleClearFilters}
                    style={{
                      padding: '10px 24px',
                      background: 'transparent',
                      border: `1px solid ${T.neonPurple}`,
                      borderRadius: 8,
                      color: T.neonPurple,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Limpiar filtros
                  </button>
                </>
              ) : (
                <>
                  <p
                    style={{
                      color: T.textSecondary,
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    El catálogo está vacío temporalmente
                  </p>
                  <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 20 }}>
                    Pronto tendremos nuevos equipos disponibles
                  </p>
                  <button
                    onClick={() => router.push(routes.landingHome(landing))}
                    style={{
                      padding: '10px 24px',
                      background: T.neonCyan,
                      border: 'none',
                      borderRadius: 8,
                      color: '#0a0a0a',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Volver al inicio
                  </button>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ====== GAMER TOAST ====== */}
      {toast && isToastVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(94px + env(safe-area-inset-bottom))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 20px',
            borderRadius: 12,
            maxWidth: 420,
            background: isDark ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${
              toast.type === 'warning'
                ? (isDark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.5)')
                : toast.type === 'error'
                  ? (isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.5)')
                  : (isDark ? T.border : '#e5e5e5')
            }`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.12)',
            fontFamily: "'Rajdhani', sans-serif",
            animation: 'fadeInUp 0.25s ease-out',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: toast.type === 'warning'
                ? (isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)')
                : toast.type === 'error'
                  ? (isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)')
                  : (isDark ? 'rgba(0,255,213,0.1)' : 'rgba(0,137,122,0.1)'),
              color: toast.type === 'warning'
                ? '#f59e0b'
                : toast.type === 'error'
                  ? '#ef4444'
                  : T.neonCyan,
            }}
          >
            {toast.type === 'warning' ? '⚠' : toast.type === 'error' ? '✕' : '✓'}
          </div>
          <p style={{
            fontSize: 13,
            fontWeight: 500,
            color: isDark ? '#e0e0e0' : '#333',
            margin: 0,
            lineHeight: 1.4,
          }}>
            {toast.message}
          </p>
          <button
            onClick={hideToast}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? '#555' : '#aaa',
              padding: 4,
              display: 'flex',
              flexShrink: 0,
              marginLeft: 4,
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ====== FLOATING COMPARE BAR ====== */}
      {compareList.length > 0 && !showCompareModal && (
        <div
          className="hidden lg:flex"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 90,
            background: isDark ? T.bgCard : '#ffffff',
            borderRadius: 16,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)'
              : '0 8px 32px rgba(0,0,0,0.12)',
            border: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
            padding: '12px 16px',
            alignItems: 'center',
            gap: 16,
            transition: 'all 0.3s',
          }}
        >
          {/* Icon + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `${T.neonCyan}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scale className="w-5 h-5" style={{ color: T.neonCyan }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, margin: 0, fontFamily: "'Rajdhani', sans-serif" }}>
                {compareList.length} de 3
              </p>
              <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
                equipos seleccionados
              </p>
            </div>
          </div>

          {/* Thumbnail stack — uses refreshed compareProducts from API */}
          <div style={{ display: 'flex', marginLeft: -8 }}>
            {compareProducts.map((p, i) => (
              <div
                key={p.id}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: isDark ? T.bgSurface : '#fff',
                  border: `2px solid ${isDark ? T.bgCard : '#fff'}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  marginLeft: i > 0 ? -8 : 0,
                  zIndex: 4 - i,
                  position: 'relative',
                }}
              >
                <img
                  src={(p.images?.length > 0 ? p.images[0] : p.thumbnail) || '/images/products/placeholder.jpg'}
                  alt={p.displayName || p.name}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderLeft: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
              paddingLeft: 16,
            }}
          >
            {/* Trash button */}
            <button
              onClick={() => setCompareList([])}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'transparent',
                border: 'none',
                color: T.textMuted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s',
              }}
              title="Limpiar comparación"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Compare button */}
            <button
              onClick={handleOpenCompareModal}
              disabled={compareList.length < 2}
              style={{
                height: 32,
                padding: '0 24px',
                background: compareList.length >= 2 ? T.neonCyan : T.textMuted,
                border: 'none',
                borderRadius: 14,
                color: isDark ? '#000' : '#fff',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                cursor: compareList.length >= 2 ? 'pointer' : 'not-allowed',
                opacity: compareList.length >= 2 ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
              }}
            >
              Comparar
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ====== MOBILE SEARCH BOTTOM SHEET ====== */}
      {showMobileSearch && (
        <div className="md:hidden fixed inset-0 z-[300]">
          {/* Backdrop */}
          <div
            onClick={() => { setSheetDragY(0); setShowMobileSearch(false); }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}
          />
          {/* Bottom sheet */}
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: isDark ? '#1a1a1a' : '#fff',
              borderRadius: '24px 24px 0 0',
              display: 'flex', flexDirection: 'column',
              maxHeight: 'calc(100svh - 6rem)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              transform: sheetDragY > 0 ? `translateY(${sheetDragY}px)` : undefined,
              transition: sheetDragStartRef.current === null ? 'transform 0.2s ease-out' : undefined,
              animation: sheetDragY === 0 && sheetDragStartRef.current === null ? 'gamerSlideUp 0.25s ease-out' : undefined,
              touchAction: 'pan-y',
            }}
          >
            <style>{`
              @keyframes gamerSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
            {/* Drag handle (swipe down to dismiss) */}
            <div
              role="button"
              aria-label="Arrastra hacia abajo para cerrar"
              style={{ display: 'flex', justifyContent: 'center', padding: '12px 0', cursor: 'grab', touchAction: 'none' }}
              onPointerDown={(e) => {
                sheetDragStartRef.current = e.clientY;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (sheetDragStartRef.current === null) return;
                const delta = e.clientY - sheetDragStartRef.current;
                if (delta > 0) setSheetDragY(delta);
              }}
              onPointerUp={() => {
                const shouldDismiss = sheetDragY > 100;
                sheetDragStartRef.current = null;
                if (shouldDismiss) {
                  setSheetDragY(0);
                  setShowMobileSearch(false);
                } else {
                  setSheetDragY(0);
                }
              }}
              onPointerCancel={() => {
                sheetDragStartRef.current = null;
                setSheetDragY(0);
              }}
            >
              <div style={{ width: 40, height: 6, background: isDark ? '#444' : '#d4d4d4', borderRadius: 3 }} />
            </div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: `${T.neonCyan}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search className="w-4 h-4" style={{ color: T.neonCyan }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: 0, fontFamily: "'Rajdhani', sans-serif" }}>Buscar equipos</h2>
                  <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>Encuentra tu equipo ideal</p>
                </div>
              </div>
              <button
                aria-label="Cerrar búsqueda"
                onClick={() => setShowMobileSearch(false)}
                style={{ width: 44, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Search input */}
            <div style={{ padding: '0 16px 12px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', width: '100%',
                background: isDark ? '#111' : '#f5f5f5',
                borderRadius: 12, border: `2px solid transparent`,
                transition: 'all 0.2s',
              }}>
                {mobileSearchLoading ? (
                  <div className="w-5 h-5 ml-4 shrink-0" style={{ border: `2px solid ${T.border}`, borderTopColor: T.neonCyan, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                ) : (
                  <Search className="w-5 h-5 ml-4 shrink-0" style={{ color: T.textMuted }} />
                )}
                <input
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  placeholder="Buscar por marca, modelo..."
                  value={mobileSearchQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setMobileSearchQuery(q);
                    if (mobileSearchDebounce.current) clearTimeout(mobileSearchDebounce.current);
                    // Bump request id — any in-flight fetch from a previous keystroke is now stale
                    mobileSearchReqIdRef.current += 1;
                    if (!q.trim()) { setMobileSearchResults([]); setMobileSearchLoading(false); return; }
                    setMobileSearchLoading(true);
                    // TODO: Extraer a hook cuando se refactorice este archivo
                    mobileSearchDebounce.current = setTimeout(async () => {
                      const reqId = mobileSearchReqIdRef.current;
                      try {
                        const data = await fetchCatalogData(landing, { filters: { q: q.trim() }, limit: 8 });
                        // Ignore stale responses (sheet closed or another keystroke bumped the id)
                        if (reqId !== mobileSearchReqIdRef.current) return;
                        if (data) {
                          setMobileSearchResults(data.products.map((p) => ({
                            id: p.id, slug: p.slug, name: p.name, displayName: p.displayName,
                            brand: p.brand, thumbnail: p.thumbnail, images: p.images || [],
                            quotaMonthly: p.quotaMonthly, maxTermMonths: p.maxTermMonths,
                          })));
                        } else { setMobileSearchResults([]); }
                      } catch {
                        if (reqId !== mobileSearchReqIdRef.current) return;
                        setMobileSearchResults([]);
                      }
                      if (reqId === mobileSearchReqIdRef.current) setMobileSearchLoading(false);
                    }, 300);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { handleSearch(mobileSearchQuery); setShowMobileSearch(false); } }}
                  autoFocus
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    padding: '14px 12px', fontSize: 16, color: T.textPrimary,
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                />
                {mobileSearchQuery && (
                  <button onClick={() => { setMobileSearchQuery(''); setMobileSearchResults([]); }} style={{ background: 'none', border: 'none', color: T.textMuted, padding: 8, marginRight: 4, cursor: 'pointer', borderRadius: 8 }}>
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            {/* Results list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 8px' }}>
              {!mobileSearchLoading && mobileSearchQuery.trim() && mobileSearchResults.length === 0 && (
                <p style={{ textAlign: 'center', color: T.textMuted, fontSize: 13, padding: 16, fontFamily: "'Rajdhani', sans-serif" }}>No se encontraron equipos</p>
              )}
              {!mobileSearchLoading && mobileSearchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {mobileSearchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setShowMobileSearch(false); router.push(routes.producto(landing, p.slug)); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 12, textAlign: 'left',
                        background: 'none', border: 'none', cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                        background: isDark ? '#111' : '#f5f5f5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <img
                          src={(p.images?.length > 0 ? p.images[0] : p.thumbnail) || '/images/products/placeholder.jpg'}
                          alt={p.displayName || p.name}
                          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, color: T.textMuted, textTransform: 'uppercase', margin: 0 }}>{p.brand}</p>
                        <p style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Rajdhani', sans-serif" }}>{p.displayName || p.name}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: T.neonCyan, margin: 0, fontFamily: "'Orbitron', sans-serif" }}>S/{Math.round(p.quotaMonthly)}/mes</p>
                        <p style={{ fontSize: 10, color: T.textMuted, margin: 0 }}>x {p.maxTermMonths} meses</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Footer */}
            <div style={{ borderTop: `1px solid ${T.border}`, padding: 16, display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setMobileSearchQuery(''); setMobileSearchResults([]); handleSearchClear('mobile_search'); }}
                style={{
                  padding: '10px 16px', borderRadius: 12, border: 'none',
                  background: 'none', color: T.textMuted,
                  fontSize: 14, fontWeight: 500, fontFamily: "'Rajdhani', sans-serif",
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Trash2 className="w-4 h-4" />
                Limpiar
              </button>
              <button
                onClick={() => { handleSearch(mobileSearchQuery); setShowMobileSearch(false); }}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 12, border: 'none',
                  background: T.neonCyan, color: isDark ? '#0a0a0a' : '#fff',
                  fontSize: 14, fontWeight: 600, fontFamily: "'Rajdhani', sans-serif",
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Search className="w-4 h-4" />
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MOBILE FILTERS FAB ====== */}
      <div className="lg:hidden" style={{ position: 'fixed', bottom: 'calc(24px + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', zIndex: 90 }}>
        <button
          id="onboarding-filters-mobile"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            borderRadius: 16,
            border: 'none',
            background: T.neonCyan,
            color: isDark ? '#0a0a0a' : '#fff',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Rajdhani', sans-serif",
            cursor: 'pointer',
            boxShadow: isDark ? '0 4px 20px rgba(0,255,213,0.3)' : '0 4px 20px rgba(0,137,122,0.25)',
            transition: 'all 0.2s',
          }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, borderRadius: 999,
              minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 5px', background: isDark ? '#0a0a0a' : '#fff', color: T.neonCyan,
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ====== MOBILE COMPARE FAB ====== */}
      {compareList.length > 0 && !showCompareModal && (
        <button
          className="lg:hidden flex items-center gap-2"
          onClick={handleOpenCompareModal}
          style={{
            position: 'fixed',
            bottom: 'calc(76px + env(safe-area-inset-bottom))',
            left: 24,
            zIndex: 90,
            padding: '10px 16px',
            borderRadius: 16,
            border: 'none',
            background: T.neonCyan,
            color: isDark ? '#0a0a0a' : '#fff',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Rajdhani', sans-serif",
            cursor: 'pointer',
            boxShadow: isDark ? '0 4px 20px rgba(0,255,213,0.3)' : '0 4px 20px rgba(0,137,122,0.25)',
            transition: 'all 0.2s',
          }}
        >
          <Scale className="w-5 h-5" />
          <span className="hidden sm:inline">Comparar</span>
          <span style={{
            fontSize: 12, fontWeight: 700, borderRadius: 999,
            minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 6px', background: isDark ? '#0a0a0a' : '#fff', color: T.neonCyan,
          }}>
            {compareList.length}/3
          </span>
        </button>
      )}

      {/* ====== COMPARE MODAL ====== */}
      {showCompareModal && compareProducts.length > 0 && (
        <GamerCompareModal
          products={compareProducts}
          isDark={isDark}
          T={T}
          showDiffOnly={showDiffOnly}
          onToggleDiffOnly={() => setShowDiffOnly(prev => !prev)}
          onClose={() => setShowCompareModal(false)}
          onRemove={(id) => setCompareList(prev => prev.filter(cid => cid !== id))}
          onClearAll={() => { setCompareList([]); setShowCompareModal(false); }}
          onSelectProduct={(product) => {
            selectProductForWizard(product);
            router.push(routes.solicitar(landing));
            setShowCompareModal(false);
          }}
          showCart={ALLOW_MULTI_PRODUCT}
          onAddToCart={(product) => {
            handleAddToCart(product.id, product);
          }}
          cartItems={ALLOW_MULTI_PRODUCT ? cartIds : []}
        />
      )}

      {/* ====== Wishlist Drawer — sólo bottom-sheet mobile. En desktop usamos el dropdown inline arriba. ====== */}
      <WishlistDrawer
        isOpen={isWishlistDrawerOpen && isMobileViewport}
        onClose={() => setIsWishlistDrawerOpen(false)}
        products={wishlist}
        onRemoveProduct={(productId) => removeFromWishlist(productId)}
        onClearAll={() => clearWishlist()}
        onViewProduct={(productId) => {
          setIsWishlistDrawerOpen(false);
          const prod = findProductOrSibling(productId);
          if (prod) {
            router.push(routes.producto(landing, prod.slug));
            return;
          }
          // Fall back to the slug stored in the wishlist item if the product is no longer in the catalog
          const item = wishlist.find((w) => w.productId === productId);
          if (item?.slug) router.push(routes.producto(landing, item.slug));
        }}
        onAddToCompare={(productId) => {
          const prod = findProductOrSibling(productId);
          if (prod) handleToggleCompare(prod);
        }}
        onAddToCart={ALLOW_MULTI_PRODUCT ? (productId) => {
          const wishlistItem = wishlist.find((w) => w.productId === productId);
          if (wishlistItem) {
            handleAddToCart(productId, undefined, {
              productId: wishlistItem.productId,
              slug: wishlistItem.slug,
              name: wishlistItem.name,
              shortName: wishlistItem.shortName,
              brand: wishlistItem.brand,
              image: wishlistItem.image,
              price: wishlistItem.price,
              months: wishlistItem.months,
              initialPercent: wishlistItem.initialPercent,
              initialAmount: wishlistItem.initialAmount,
              monthlyPayment: wishlistItem.monthlyPayment,
              addedAt: Date.now(),
            });
          }
        } : undefined}
        compareList={compareList}
        maxCompareProducts={3}
        unavailableIds={unavailableWishlistIds}
        themeClassName={isDark ? 'gamer-wishlist-dark' : 'gamer-wishlist-light'}
      />

      {/* Gamer Wishlist Drawer theme overrides */}
      <style>{`
        /* ========= Shared tokens (light + dark gamer) ========= */
        .gamer-wishlist-dark, .gamer-wishlist-dark *,
        .gamer-wishlist-light, .gamer-wishlist-light * {
          font-family: 'Rajdhani', sans-serif;
        }
        .gamer-wishlist-dark {
          --color-primary: #00ffd5;
          --color-primary-rgb: 0,255,213;
        }
        .gamer-wishlist-light {
          --color-primary: #00897a;
          --color-primary-rgb: 0,137,122;
        }

        /* ========= DARK MODE ========= */
        .gamer-wishlist-dark {
          background: #0e0e0e !important;
          color: #f0f0f0 !important;
        }
        .gamer-wishlist-dark .bg-white { background: #1a1a1a !important; }
        .gamer-wishlist-dark .bg-neutral-50 { background: #151515 !important; }
        .gamer-wishlist-dark .bg-neutral-100 { background: #252525 !important; }
        .gamer-wishlist-dark .bg-neutral-200 { background: #2a2a2a !important; }
        .gamer-wishlist-dark .bg-neutral-300 { background: #333 !important; }
        .gamer-wishlist-dark .border-neutral-100,
        .gamer-wishlist-dark .border-neutral-200,
        .gamer-wishlist-dark .border-neutral-300 { border-color: #2a2a2a !important; }
        .gamer-wishlist-dark .text-neutral-900,
        .gamer-wishlist-dark .text-neutral-800 { color: #f0f0f0 !important; }
        .gamer-wishlist-dark .text-neutral-700 { color: #d4d4d4 !important; }
        .gamer-wishlist-dark .text-neutral-600 { color: #a0a0a0 !important; }
        .gamer-wishlist-dark .text-neutral-500 { color: #888 !important; }
        .gamer-wishlist-dark .text-neutral-400 { color: #666 !important; }
        .gamer-wishlist-dark .text-neutral-300 { color: #555 !important; }
        .gamer-wishlist-dark .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.4) !important; }
        .gamer-wishlist-dark .shadow-md { box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important; }
        .gamer-wishlist-dark .bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.1\\)\\] {
          background: rgba(0,255,213,0.15) !important;
        }
        .gamer-wishlist-dark .text-\\[var\\(--color-primary\\)\\],
        .gamer-wishlist-dark .fill-\\[var\\(--color-primary\\)\\] {
          color: #00ffd5 !important;
          fill: #00ffd5 !important;
        }
        .gamer-wishlist-dark .hover\\:text-\\[var\\(--color-primary\\)\\]:hover {
          color: #00ffd5 !important;
        }
        /* Empty state icon */
        .gamer-wishlist-dark .rounded-full.bg-neutral-100 { background: #252525 !important; }
        /* Amber warning box */
        .gamer-wishlist-dark .bg-amber-50 { background: rgba(245, 158, 11, 0.12) !important; }
        .gamer-wishlist-dark .border-amber-200 { border-color: rgba(245, 158, 11, 0.35) !important; }
        .gamer-wishlist-dark .text-amber-600 { color: #fbbf24 !important; }
        .gamer-wishlist-dark .text-amber-700 { color: #fcd34d !important; }
        /* Red accents (remove btn hover) */
        .gamer-wishlist-dark .text-red-500 { color: #ff4d6d !important; }
        .gamer-wishlist-dark .hover\\:bg-red-50:hover { background: rgba(255,77,109,0.1) !important; }
        .gamer-wishlist-dark .hover\\:text-red-500:hover { color: #ff4d6d !important; }
        /* Drag handle */
        .gamer-wishlist-dark .rounded-t-3xl .bg-neutral-300 { background: #00ffd5 !important; opacity: 0.4; }
        /* NextUI default button surfaces inside drawer */
        .gamer-wishlist-dark .border-medium { border-color: #2a2a2a !important; }
        /* NextUI "text-foreground" resuelve a casi-negro en modo claro; forzar claro en dark */
        .gamer-wishlist-dark .text-foreground,
        .gamer-wishlist-dark .text-default-foreground { color: #f0f0f0 !important; }
        /* Botón "Comparar" bordered en dark */
        .gamer-wishlist-dark button.border-neutral-300 {
          border-color: #3a3a3a !important;
          color: #d4d4d4 !important;
        }
        .gamer-wishlist-dark button.border-neutral-300:hover {
          border-color: #00ffd5 !important;
          color: #00ffd5 !important;
        }
        /* Botones solid (En comparador / Agregar): texto oscuro sobre fondo cyan */
        .gamer-wishlist-dark button.text-white {
          color: #0a0a0a !important;
        }

        /* ========= LIGHT MODE ========= */
        .gamer-wishlist-light {
          background: #f5f5f5 !important;
          color: #1a1a1a !important;
        }
        .gamer-wishlist-light .bg-white { background: #ffffff !important; }
        .gamer-wishlist-light .bg-neutral-50 { background: #fafafa !important; }
        .gamer-wishlist-light .bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.1\\)\\] {
          background: rgba(0,137,122,0.12) !important;
        }
        .gamer-wishlist-light .text-\\[var\\(--color-primary\\)\\],
        .gamer-wishlist-light .fill-\\[var\\(--color-primary\\)\\] {
          color: #00897a !important;
          fill: #00897a !important;
        }
        .gamer-wishlist-light .hover\\:text-\\[var\\(--color-primary\\)\\]:hover {
          color: #00897a !important;
        }
        /* Drag handle (light) */
        .gamer-wishlist-light .rounded-t-3xl .bg-neutral-300 { background: #00897a !important; opacity: 0.35; }
      `}</style>

      {/* ====== FOOTER ====== */}
      {/* Wishlist toast */}
      {wishlistToast && (
        <div style={{
          position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', zIndex: 200,
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12,
          background: isDark ? '#1a1a1a' : '#fff', border: `1px solid ${T.border}`,
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
          fontSize: 13, fontWeight: 500, color: T.textPrimary,
          fontFamily: "'Rajdhani', sans-serif", animation: 'fadeIn 0.25s ease-out',
        }}>
          <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
          <Heart size={16} style={{ color: T.neonCyan, fill: wishlistToast.includes('Agregado') ? T.neonCyan : 'none' }} />
          {wishlistToast}
        </div>
      )}

      <GamerNewsletter theme={theme} />
      <GamerFooter theme={theme} />

      {/* Blip Chat (hidden button, opened from help menu) */}
      <BlipChat
        buttonColor={isDark ? '#1a1a1a' : T.neonCyan}
        hideFloatingButton={true}
        onOpen={() => {}}
        onClose={() => {}}
        customStyle={isDark ? `
          #blip-chat-header { background-color: #1a1a1a !important; }
          .ss-content { background-color: #0e0e0e !important; }
          .blip-container { background-color: #0e0e0e !important; }
          #message-input { background-color: #1a1a1a !important; border-top: 1px solid #2a2a2a !important; }
          #msg-textarea { background-color: #1a1a1a !important; color: #f0f0f0 !important; }
          #msg-textarea::placeholder { color: #707070 !important; }
          .blip-chat-bot-name { color: #00ffd5 !important; }
          .blip-chat-bot-status span { color: #00ffd5 !important; }
          #blip-send-message { background-color: #00ffd5 !important; }
          .blip-cards-items-list { background-color: #0e0e0e !important; }
          .infinite-status-prompt { color: #707070 !important; }
        ` : ''}
      />
      {/* Override Blip Chat colors based on theme */}
      <style>{`
        #blip-chat-container #blip-chat-open-iframe.opened,
        #blip-chat-container #blip-chat-open-iframe {
          background-color: ${isDark ? '#1a1a1a' : T.neonCyan} !important;
        }
        #blip-chat-header {
          background-color: ${isDark ? '#1a1a1a' : T.neonCyan} !important;
        }
        #blip-chat-container #blip-chat-close-icon g#Close g#close path {
          fill: ${isDark ? '#00ffd5' : '#ffffff'} !important;
        }
      `}</style>

      {/* Help button */}
      {!showMobileFilters && !showCompareModal && <GamerHelpButton isDark={isDark} T={T} onOpenChat={() => blipChat.openChat()} onStartTour={handleStartTour} />}

      {/* Onboarding Tour */}
      <GamerOnboardingTour
        isActive={tourActive}
        currentStep={currentTourStep}
        currentStepIndex={tourStep}
        totalSteps={gamerTourSteps.length}
        theme={theme}
        onNext={handleTourNext}
        onPrev={handleTourPrev}
        onSkip={handleTourSkip}
      />

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: 'calc(24px + env(safe-area-inset-bottom))',
            right: 24,
            zIndex: 100,
            width: 40,
            height: 40,
            borderRadius: 10,
            border: 'none',
            background: T.neonCyan,
            color: isDark ? '#0a0a0a' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isDark ? '0 4px 16px rgba(0,255,213,0.3)' : '0 4px 16px rgba(0,137,122,0.25)',
            transition: 'all 0.3s',
          }}
        >
          <ArrowRight className="w-5 h-5" style={{ transform: 'rotate(-90deg)' }} />
        </button>
      )}

      {/* ====== CART MODALS (multi-product) ====== */}
      {ALLOW_MULTI_PRODUCT && (
        <CartSelectionModal
          isOpen={isCartModalOpen}
          onClose={() => { setIsCartModalOpen(false); setSelectedVariantForCart(null); }}
          product={selectedProductForCart}
          onRequestEquipment={() => {
            if (selectedProductForCart) selectProductForWizard(selectedProductForCart);
            setSelectedVariantForCart(null);
            router.push(routes.solicitar(landing));
          }}
          onAddToCart={() => {
            if (selectedProductForCart) {
              handleAddToCart(selectedProductForCart.id, selectedProductForCart, selectedVariantForCart || undefined);
            }
            setSelectedVariantForCart(null);
          }}
        />
      )}
      {ALLOW_MULTI_PRODUCT && (
        <CartDrawer
          isOpen={isCartDrawerOpen}
          onClose={() => setIsCartDrawerOpen(false)}
          items={cartItems || []}
          onRemoveItem={handleRemoveFromCart}
          onClearAll={() => { handleClearCart(); setIsCartDrawerOpen(false); }}
          onContinue={() => { handleCartContinue(); setIsCartDrawerOpen(false); }}
          unavailableIds={unavailableCartIds}
        />
      )}
      {ALLOW_MULTI_PRODUCT && (
        <CartLimitModal
          isOpen={isCartLimitModalOpen}
          onClose={() => { setIsCartLimitModalOpen(false); setAttemptedCartProduct(null); }}
          cartItems={cartItems || []}
          onRemoveItem={handleRemoveFromCart}
          attemptedProduct={attemptedCartProduct}
          totalMonthlyQuota={totalMonthlyQuota}
        />
      )}
    </div>
  );
}

// NOTE: PromoBanner, GamerCatalogHeader, GamerSidebar, FilterSection, SortDropdown,
// ActiveFiltersBar, GamerProductCard, BrandButton, GamerHelpButton, GamerCompareModal,
// and GamerCardSkeleton have been extracted to ./components/gamer/
