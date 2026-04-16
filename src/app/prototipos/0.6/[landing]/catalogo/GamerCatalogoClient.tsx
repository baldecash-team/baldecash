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

import { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect, useSyncExternalStore, Suspense } from 'react';
import Image from 'next/image';
import {
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  X,
  Sun,
  Moon,
  SlidersHorizontal,
  Zap,
  Eye,
  ArrowRight,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  GitCompareArrows,
  Trash2,
  Trophy,
  Scale,
  Laptop,
  Tablet,
  Smartphone,
  Gamepad2,
  BookOpen,
  Palette,
  Briefcase,
  Code2,
  Package,
  CheckCircle2,
  Layers,
  Maximize,
  Settings2,
  Info,
  Star,
  Sparkles,
  HelpCircle,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';

// Hooks de datos (los mismos que CatalogoClient)
import { useCatalogProducts, useCatalogFilters } from './hooks/useCatalogProducts';
import { useCatalogSharedState } from './hooks/useCatalogSharedState';
import { WishlistDrawer } from './components/wishlist/WishlistDrawer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { ProductProvider, useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import {
  parseFiltersFromParams,
  buildParamsFromFilters,
  mergeFiltersWithDefaults,
} from './utils/queryFilters';
import { routes } from '@/app/prototipos/0.6/utils/routes';

// Types
import type {
  CatalogProduct,
  FilterState,
  SortOption,
  WishlistItem,
} from './types/catalog';
import { defaultFilterState } from './types/catalog';
import { fetchCatalogData } from '../../services/catalogApi';
import type { CatalogFilters as ApiCatalogFilters, SortBy as ApiSortBy } from '../../services/catalogApi';

// Zona Gamer components
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';
import { GamerNewsletter } from '@/app/prototipos/0.6/components/zona-gamer/GamerNewsletter';
import { GamerNavbar } from '@/app/prototipos/0.6/components/zona-gamer/GamerNavbar';
import { BlipChat, useBlipChat } from '@/app/prototipos/0.6/components/BlipChat';
import { GamerOnboardingTour } from '@/app/prototipos/0.6/components/zona-gamer/GamerOnboardingTour';
import type { OnboardingStep } from './types/catalog';
import { Toast, useToast, CubeGridSpinner } from '@/app/prototipos/_shared';

// ============================================
// Theme helpers
// ============================================

function gamerTheme(isDark: boolean) {
  return {
    bg: isDark ? '#0e0e0e' : '#f5f5f5',
    bgCard: isDark ? '#1a1a1a' : '#ffffff',
    bgSurface: isDark ? '#1e1e1e' : '#f0f0f0',
    neonCyan: isDark ? '#00ffd5' : '#00897a',
    neonPurple: isDark ? '#6366f1' : '#4f46e5',
    neonRed: '#ff0055',
    border: isDark ? '#2a2a2a' : '#e0e0e0',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a1a',
    textSecondary: isDark ? '#a0a0a0' : '#555',
    textMuted: isDark ? '#707070' : '#888',
  };
}

// Badge color mapping — paleta consolidada: cyan (primario), purple (secundario), red (funcional)
// Eliminados: naranja, verde, amber. Solo 3 colores + neutro.
const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  recomendado: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.55)' },       // purple
  mas_vendido: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.55)' },       // purple (era naranja)
  oferta: { bg: 'rgba(255,0,85,0.2)', text: '#ff3366', border: 'rgba(255,0,85,0.55)' },                // red (funcional)
  cuota_baja: { bg: 'rgba(0,255,213,0.15)', text: '#00ffd5', border: 'rgba(0,255,213,0.4)' },          // cyan
  nuevo: { bg: 'rgba(0,255,213,0.15)', text: '#00ffd5', border: 'rgba(0,255,213,0.4)' },               // cyan (era verde)
  premium: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.55)' },           // purple (era naranja)
  destacado: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.55)' },         // purple
  economico: { bg: 'rgba(0,255,213,0.15)', text: '#00ffd5', border: 'rgba(0,255,213,0.4)' },           // cyan (era verde)
};

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
  const [isDark, setIsDark] = useState(true);
  // useLayoutEffect corre antes del paint: actualiza el tema antes de que el browser pinte
  // el primer frame, eliminando el flash de fondo incorrecto al navegar client-side.
  useIsomorphicLayoutEffect(() => {
    setIsDark(localStorage.getItem('baldecash-theme') !== 'light');
  }, []);
  return (
    <div
      suppressHydrationWarning
      style={{
        minHeight: '100vh',
        background: isDark ? '#0e0e0e' : '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CubeGridSpinner />
    </div>
  );
}

// useLayoutEffect solo en browser; useEffect fallback en SSR para evitar warnings.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// ============================================
// Content
// ============================================

function GamerCatalogoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const landing = (params.landing as string) || 'zona-gamer';
  const { setSelectedProduct } = useProduct();

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

  // Preview
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  // Parse URL filters
  const initialUrlFilters = useMemo(() => parseFiltersFromParams(searchParams), [searchParams]);
  const [filters, setFilters] = useState<FilterState>(() => mergeFiltersWithDefaults(initialUrlFilters));
  const [sort, setSort] = useState<SortOption>((initialUrlFilters as { sort?: SortOption }).sort || 'recommended');
  const [searchQuery, setSearchQuery] = useState((initialUrlFilters as { searchQuery?: string }).searchQuery || '');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

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
      description: 'Solicita este equipo directamente para iniciar tu financiamiento.',
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
  ], []);
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
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSearchResults, setMobileSearchResults] = useState<{ id: string; slug: string; name: string; displayName: string; brand: string; thumbnail: string; quotaMonthly: number; maxTermMonths: number }[]>([]);
  const [mobileSearchLoading, setMobileSearchLoading] = useState(false);
  const mobileSearchDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Build API filters
  const apiFilters = useMemo((): ApiCatalogFilters => {
    const af: ApiCatalogFilters = {};
    if (searchQuery.trim()) af.q = searchQuery.trim();
    if (filters.brands.length > 0) {
      // Pass brand slugs as types for text-based filtering
      af.types = filters.deviceTypes.length > 0 ? filters.deviceTypes : undefined;
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
  }, [filters, searchQuery, landing]);

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
    enabled: true,
    previewKey,
  });

  // Productos tal cual vienen del endpoint, sin filtros frontend ni overrides de thumbnail
  const allProducts = products;
  const displayTotal = total;

  // Fetch filter options
  const catalogFilters = useCatalogFilters(landing);

  // Layout data (navbar items, promo banner) desde /landing/zona-gamer/layout
  const { navbarProps } = useLayout();

  // Cart / Wishlist
  const {
    wishlistCount,
    cartCount,
    toggleWishlist,
    isInWishlist,
    wishlist,
    removeFromWishlist,
    clearWishlist,
  } = useCatalogSharedState(landing, previewKey);

  // Toast
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast(4000);

  // Blip Chat
  const blipChat = useBlipChat();

  // Wishlist drawer
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);

  // Compare
  const [compareList, setCompareList] = useState<CatalogProduct[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showDiffOnly, setShowDiffOnly] = useState(false);

  const getDeviceType = (product: CatalogProduct): string => {
    return product.deviceType || 'laptop';
  };

  const handleToggleCompare = useCallback((product: CatalogProduct) => {
    // Si ya está, quitarlo
    if (compareList.some(p => p.id === product.id)) {
      setCompareList(prev => prev.filter(p => p.id !== product.id));
      return;
    }
    // Límite
    if (compareList.length >= 3) return;
    // Validar mismo tipo de dispositivo
    if (compareList.length > 0) {
      const currentDeviceType = getDeviceType(compareList[0]);
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
    setCompareList(prev => [...prev, product]);
  }, [compareList, showToast]);

  const isInCompare = useCallback((id: string) => compareList.some(p => p.id === id), [compareList]);

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
  }, []);

  const handleWishlistToggle = useCallback((product: CatalogProduct) => {
    const wasInWishlist = isInWishlist(product.id);
    const item: WishlistItem = {
      productId: product.id,
      slug: product.slug,
      name: product.displayName || product.name,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      image: product.thumbnail,
      lowestQuota: product.quotaMonthly,
      type: product.deviceType,
      months: (product.maxTermMonths || 24) as 6 | 12 | 18 | 24,
      initialPercent: 0,
      initialAmount: 0,
      monthlyPayment: product.quotaMonthly,
      addedAt: Date.now(),
    };
    toggleWishlist(item);
    setWishlistToast(wasInWishlist ? 'Eliminado de favoritos' : 'Agregado a favoritos');
    setTimeout(() => setWishlistToast(null), 2500);
  }, [toggleWishlist, isInWishlist]);

  const handleProductDetail = useCallback((product: CatalogProduct) => {
    router.push(routes.producto(landing, product.slug));
  }, [router, landing]);

  const handleProductSolicitar = useCallback((product: CatalogProduct) => {
    setSelectedProduct({
      id: product.id,
      slug: product.slug,
      name: product.displayName || product.name,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      monthlyPayment: product.quotaMonthly,
      months: (product as unknown as { maxTermMonths?: number }).maxTermMonths || 24,
      initialPercent: 0,
      initialAmount: 0,
      image: product.thumbnail,
      type: product.deviceType,
      specs: {
        processor: product.specs?.processor?.model || '',
        ram: product.specs?.ram ? `${product.specs.ram.size}GB RAM` : '',
        storage: product.specs?.storage ? `${product.specs.storage.size}GB ${product.specs.storage.type}` : '',
      },
    });
    router.push(routes.solicitar(landing));
  }, [router, landing, setSelectedProduct]);

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
        <PromoBanner
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
                  type="text"
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
                    onClick={() => { handleSearch(''); setShowSearchDropdown(false); }}
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
                            {product.thumbnail ? (
                              <Image src={product.thumbnail} alt={product.name} width={44} height={44} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                            ) : (
                              <Laptop className="w-5 h-5" style={{ color: T.textMuted }} />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f0f0f0' : '#333', fontFamily: "'Rajdhani', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.displayName || product.name}
                            </div>
                            <div style={{ fontSize: 11, color: T.textMuted, fontFamily: "'Share Tech Mono', monospace" }}>
                              {product.brand}
                            </div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.neonCyan, fontFamily: "'Orbitron', sans-serif", whiteSpace: 'nowrap' }}>
                            S/{Math.round(product.quotaMonthly)}<span style={{ fontSize: 10, color: T.textMuted }}>/mes</span>
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
            {/* Favorites button — drawer renderizado en el footer */}
            <button
              id="onboarding-wishlist"
              onClick={() => setIsWishlistDrawerOpen(true)}
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: T.bgSurface, border: `1px solid ${T.border}`,
                color: isDark ? '#fff' : '#555', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s', position: 'relative',
              }}
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
              <SortDropdown
                isDark={isDark}
                T={T}
                sort={sort}
                onSortChange={setSort}
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
            maxHeight: 'calc(100vh - 150px)',
            overflow: 'hidden',
          }}
        >
          <GamerSidebar
            isDark={isDark}
            T={T}
            filters={filters}
            apiFilters={catalogFilters.apiFilters}
            sort={sort}
            onSortChange={setSort}
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
          />
        </aside>

        {/* ====== PRODUCT GRID ====== */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Mobile filter panel - fullscreen overlay */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-[100] flex flex-col" style={{ background: isDark ? '#0e0e0e' : '#fff' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SlidersHorizontal className="w-5 h-5" style={{ color: T.neonCyan }} />
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, margin: 0, fontFamily: "'Rajdhani', sans-serif" }}>Filtros</h2>
                </div>
                <button onClick={() => setShowMobileFilters(false)} style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: `1px solid ${T.border}`, color: T.textSecondary, cursor: 'pointer' }}>
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
                  onSortChange={setSort}
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

          {/* Sort dropdown (desktop) */}
          <div className="flex items-center justify-between mb-4">
            <p style={{ color: T.textMuted, fontSize: 13 }}>
              {isLoading ? 'Cargando...' : `${displayTotal} producto${displayTotal !== 1 ? 's' : ''}`}
            </p>
            <div id="onboarding-sort" className="hidden lg:block">
              <SortDropdown
                isDark={isDark}
                T={T}
                sort={sort}
                onSortChange={setSort}
                options={catalogFilters.sortOptions}
              />
            </div>
          </div>

          {/* Active filters bar */}
          {activeFilterCount > 0 && (
            <ActiveFiltersBar
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
              onClearSearch={() => setSearchQuery('')}
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

          {/* Loading skeleton */}
          {isLoading && !error && (
            <div
              className="gap-[14px]"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <GamerCardSkeleton key={i} isDark={isDark} T={T} />
              ))}
            </div>
          )}

          {/* Products grid — auto-fill: el número de columnas crece con el ancho disponible */}
          {!isLoading && !error && allProducts.length > 0 && (
            <>
              <div
                className="gamer-products-grid gap-[14px]"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                }}
              >
                {allProducts.map((product, idx) => (
                  <GamerProductCard
                    key={product.id}
                    product={product}
                    isDark={isDark}
                    T={T}
                    isWishlisted={isInWishlist(product.id)}
                    onWishlistToggle={() => handleWishlistToggle(product)}
                    isCompared={isInCompare(product.id)}
                    onCompare={() => handleToggleCompare(product)}
                    onDetail={() => handleProductDetail(product)}
                    onSolicitar={() => handleProductSolicitar(product)}
                    isFirstCard={idx === 0}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
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
                      cursor: isLoadingMore ? 'wait' : 'pointer',
                      transition: 'all 0.3s',
                      opacity: isLoadingMore ? 0.6 : 1,
                    }}
                  >
                    {isLoadingMore ? 'Cargando...' : 'Cargar más'}
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
              <p
                style={{
                  color: T.textSecondary,
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                No encontramos productos
              </p>
              <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 20 }}>
                Intenta cambiar los filtros o buscar algo diferente
              </p>
              {activeFilterCount > 0 && (
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
            bottom: 94,
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

          {/* Thumbnail stack */}
          <div style={{ display: 'flex', marginLeft: -8 }}>
            {compareList.map((p, i) => (
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
                <Image src={p.thumbnail} alt={p.name} width={40} height={40} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
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
              onClick={() => setShowCompareModal(true)}
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
        <div className="md:hidden fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div
            onClick={() => setShowMobileSearch(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}
          />
          {/* Bottom sheet */}
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: isDark ? '#1a1a1a' : '#fff',
              borderRadius: '24px 24px 0 0',
              display: 'flex', flexDirection: 'column',
              maxHeight: 'calc(100vh - 6rem)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              animation: 'gamerSlideUp 0.25s ease-out',
            }}
          >
            <style>{`
              @keyframes gamerSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
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
                onClick={() => setShowMobileSearch(false)}
                style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}
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
                  type="text"
                  placeholder="Buscar por marca, modelo..."
                  value={mobileSearchQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setMobileSearchQuery(q);
                    if (mobileSearchDebounce.current) clearTimeout(mobileSearchDebounce.current);
                    if (!q.trim()) { setMobileSearchResults([]); return; }
                    setMobileSearchLoading(true);
                    mobileSearchDebounce.current = setTimeout(async () => {
                      try {
                        const data = await fetchCatalogData(landing, { filters: { q: q.trim() }, limit: 8 });
                        if (data) {
                          setMobileSearchResults(data.products.map((p) => ({
                            id: p.id, slug: p.slug, name: p.name, displayName: p.displayName,
                            brand: p.brand, thumbnail: p.thumbnail, quotaMonthly: p.quotaMonthly,
                            maxTermMonths: p.maxTermMonths,
                          })));
                        } else { setMobileSearchResults([]); }
                      } catch { setMobileSearchResults([]); }
                      setMobileSearchLoading(false);
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
                        <Image src={p.thumbnail} alt={p.name} width={44} height={44} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
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
                onClick={() => { setMobileSearchQuery(''); setMobileSearchResults([]); handleSearch(''); }}
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
      <div className="lg:hidden" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 90 }}>
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
          className="lg:hidden"
          onClick={() => setShowCompareModal(true)}
          style={{
            position: 'fixed',
            bottom: 76,
            left: 24,
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
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
      {showCompareModal && (
        <GamerCompareModal
          products={compareList}
          isDark={isDark}
          T={T}
          showDiffOnly={showDiffOnly}
          onToggleDiffOnly={() => setShowDiffOnly(prev => !prev)}
          onClose={() => setShowCompareModal(false)}
          onRemove={(id) => setCompareList(prev => prev.filter(p => p.id !== id))}
          onClearAll={() => { setCompareList([]); setShowCompareModal(false); }}
          onSelectProduct={(product) => {
            router.push(`/prototipos/0.6/${landing}/solicitar/?product=${product.slug}`);
            setShowCompareModal(false);
          }}
        />
      )}

      {/* ====== Wishlist Drawer (shared component) ====== */}
      <WishlistDrawer
        isOpen={isWishlistDrawerOpen}
        onClose={() => setIsWishlistDrawerOpen(false)}
        products={wishlist}
        onRemoveProduct={(productId) => removeFromWishlist(productId)}
        onClearAll={() => clearWishlist()}
        onViewProduct={(productId) => {
          setIsWishlistDrawerOpen(false);
          const prod = products.find((p) => p.id === productId);
          if (prod) router.push(routes.producto(landing, prod.slug));
        }}
        onAddToCompare={(productId) => {
          const prod = products.find((p) => p.id === productId);
          if (prod) handleToggleCompare(prod);
        }}
        compareList={compareList.map((p) => p.id)}
        maxCompareProducts={3}
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
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
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
            bottom: 24,
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
    </div>
  );
}

// ============================================
// Promo Banner
// ============================================

function PromoBanner({
  isDark,
  T,
  text,
  highlight,
  ctaText,
  ctaUrl,
  dismissible = true,
}: {
  isDark: boolean;
  T: ReturnType<typeof gamerTheme>;
  text: string;
  highlight?: string;
  ctaText?: string;
  ctaUrl?: string;
  dismissible?: boolean;
}) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      className="text-white text-center relative z-[60]"
      style={{
        background: `linear-gradient(to right, ${T.neonPurple}, ${T.neonPurple})`,
        padding: '10px 16px',
        fontSize: 14,
      }}
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 relative">
        <Zap className="w-4 h-4 shrink-0" style={{ color: T.neonCyan }} />
        <span>
          {highlight && <strong>{highlight}</strong>}
          {highlight && text ? ' ' : ''}
          {text}
          {ctaText && ctaUrl && (
            <a
              href={ctaUrl}
              className="text-white font-semibold underline underline-offset-2 ml-2 hover:no-underline hidden sm:inline"
            >
              {ctaText}
            </a>
          )}
        </span>
        {dismissible && (
          <button
            onClick={() => setVisible(false)}
            className="absolute right-0 p-1.5 bg-transparent border-none text-white cursor-pointer rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Header
// ============================================

function GamerCatalogHeader({
  isDark,
  T,
  theme,
  onToggleTheme,
  searchQuery,
  onSearch,
  wishlistCount,
  cartCount,
  landing,
  navbarItems,
  customerPortalUrl,
  portalButtonText,
  onOpenWishlist,
}: {
  isDark: boolean;
  T: ReturnType<typeof gamerTheme>;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  wishlistCount: number;
  cartCount: number;
  landing: string;
  navbarItems: { label: string; href: string; section: string | null; has_megamenu?: boolean; badge_text?: string }[];
  customerPortalUrl?: string;
  portalButtonText?: string;
  onOpenWishlist?: () => void;
}) {
  // Hydration guard: navbarItems llega vacío en SSR (useLayout fetchea en client).
  // Solo renderizamos los links después del mount para evitar mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Navbar items vienen del backend (layout.navbar.content_config.items).
  // Normalizamos los href: si es relativo (ej. 'catalogo') lo componemos con el landing
  const navLinks = navbarItems.map((item) => {
    const isAnchor = item.href.startsWith('#') || item.href.startsWith('http');
    const href = isAnchor
      ? item.href
      : item.href.startsWith('catalogo')
        ? routes.catalogo(landing) + item.href.slice('catalogo'.length)
        : `/${landing}/${item.href.replace(/^\//, '')}`;
    return {
      label: item.label,
      href,
      badge: item.badge_text,
    };
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 64,
        background: isDark ? 'rgba(14,14,14,0.85)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <a
          href={routes.landingHome(landing)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <Image
            src="/images/zona-gamer/logo baldecash/LOGO OFI.png"
            alt="BaldeCash"
            width={140}
            height={32}
            className="object-contain"
            style={{ height: 30 }}
          />
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 8,
              fontWeight: 700,
              color: '#ff0055',
              background: 'rgba(255,32,64,0.08)',
              border: '1px solid rgba(255,32,64,0.25)',
              padding: '2px 6px',
              borderRadius: 4,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            GAMING
          </span>
        </a>
      </div>

      {/* Nav links ocultos en catálogo — no aplican fuera del landing */}
      <nav
        className="hidden"
        style={{ alignItems: 'center', gap: 28 }}
      >
        {mounted && navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            style={{
              position: 'relative',
              fontSize: 14,
              fontWeight: 500,
              color: isDark ? '#ffffff' : '#333',
              textDecoration: 'none',
              transition: 'color 0.2s',
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            {link.label}
            {link.badge && (
              <span
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -8,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  background: T.neonCyan,
                  padding: '0 4px',
                  borderRadius: 4,
                  lineHeight: '16px',
                }}
              >
                {link.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Customer portal button (desde layout.company.customer_portal_url) */}
        {mounted && customerPortalUrl && (
          <a
            href={customerPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex"
            style={{
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: T.neonPurple,
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.12)',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <span>{portalButtonText || 'Mi zona'}</span>
          </a>
        )}

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: T.bgSurface,
            border: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: isDark ? '#ffffff' : '#555',
            position: 'relative',
          }}
          title="Cambiar tema"
        >
          {isDark ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
        </button>

        {/* Hamburger (mobile) */}
        <button
          className="flex md:hidden"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${T.border}`,
            color: T.textSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}

// ============================================
// Sidebar Filters
// ============================================

function GamerSidebar({
  isDark,
  T,
  filters,
  apiFilters,
  sort,
  onSortChange,
  expandedSections,
  onToggleSection,
  onBrandToggle,
  onGamaToggle,
  onConditionToggle,
  onDeviceTypeToggle,
  onUsageToggle,
  onTagToggle,
  onRamToggle,
  onStorageToggle,
  onGpuToggle,
  onProcessorToggle,
  onScreenSizeToggle,
  onQuotaRangeChange,
  onClearFilters,
  activeFilterCount,
  sortOptions,
  bare = false,
}: {
  isDark: boolean;
  T: ReturnType<typeof gamerTheme>;
  filters: FilterState;
  apiFilters: import('@/app/prototipos/0.6/types/filters').CatalogFiltersResponse | null;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  expandedSections: Record<string, boolean>;
  onToggleSection: (s: string) => void;
  onBrandToggle: (b: string) => void;
  onGamaToggle: (g: string) => void;
  onConditionToggle: (c: string) => void;
  onDeviceTypeToggle: (t: string) => void;
  onUsageToggle: (u: string) => void;
  onTagToggle: (t: string) => void;
  onRamToggle: (r: number) => void;
  onStorageToggle: (s: number) => void;
  onGpuToggle: (g: string) => void;
  onProcessorToggle: (p: string) => void;
  onScreenSizeToggle: (s: number) => void;
  onQuotaRangeChange: (min: number, max: number) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  sortOptions: { value: string; label: string }[];
  bare?: boolean;
}) {
  // Quota range bounds vienen del backend (apiFilters.quota_range)
  const RANGE_ABS_MIN = apiFilters?.quota_range?.min ?? 0;
  const RANGE_ABS_MAX = apiFilters?.quota_range?.max ?? 0;
  // Estado local del slider, sincronizado con filters.quotaRange del padre
  const quotaMinSentinel = filters.quotaRange[0] !== defaultFilterState.quotaRange[0];
  const quotaMaxSentinel = filters.quotaRange[1] !== defaultFilterState.quotaRange[1];
  const rangeMin = quotaMinSentinel ? filters.quotaRange[0] : RANGE_ABS_MIN;
  const rangeMax = quotaMaxSentinel ? filters.quotaRange[1] : RANGE_ABS_MAX;

  const gamaOptions: { value: string; label: string; color: string; chipBg: string; chipBorder: string; chipShadow: string }[] = [
    { value: 'economica', label: 'Económica', color: T.textSecondary, chipBg: 'rgba(136,136,170,0.18)', chipBorder: 'rgba(136,136,170,0.5)', chipShadow: 'rgba(136,136,170,0.1)' },
    { value: 'estudiante', label: 'Estudiante', color: '#5b9cff', chipBg: 'rgba(59,130,246,0.18)', chipBorder: 'rgba(59,130,246,0.5)', chipShadow: 'rgba(59,130,246,0.1)' },
    { value: 'profesional', label: 'Profesional', color: '#3de876', chipBg: 'rgba(34,197,94,0.18)', chipBorder: 'rgba(34,197,94,0.5)', chipShadow: 'rgba(34,197,94,0.1)' },
    { value: 'creativa', label: 'Creativa', color: '#818cf8', chipBg: 'rgba(99,102,241,0.18)', chipBorder: 'rgba(99,102,241,0.5)', chipShadow: 'rgba(99,102,241,0.1)' },
    { value: 'gamer', label: 'Gamer', color: '#ff3366', chipBg: 'rgba(255,0,64,0.18)', chipBorder: 'rgba(255,0,64,0.5)', chipShadow: 'rgba(255,0,64,0.1)' },
  ];

  // Paleta consolidada: red (oferta), purple (destacados), cyan (beneficio)
  const destacadosOptions: { value: string; label: string; color: string; chipBg: string; chipBorder: string; chipShadow: string }[] = [
    { value: 'oferta', label: 'Oferta', color: '#ff3366', chipBg: 'rgba(255,0,85,0.18)', chipBorder: 'rgba(255,0,85,0.5)', chipShadow: 'rgba(255,0,85,0.1)' },
    { value: 'mas_vendido', label: 'Más vendido', color: '#818cf8', chipBg: 'rgba(99,102,241,0.18)', chipBorder: 'rgba(99,102,241,0.5)', chipShadow: 'rgba(99,102,241,0.1)' },
    { value: 'recomendado', label: 'Recomendado', color: '#818cf8', chipBg: 'rgba(99,102,241,0.18)', chipBorder: 'rgba(99,102,241,0.5)', chipShadow: 'rgba(99,102,241,0.1)' },
    { value: 'cuota_baja', label: 'Cuota baja', color: T.neonCyan, chipBg: 'rgba(0,255,213,0.12)', chipBorder: 'rgba(0,255,213,0.4)', chipShadow: 'rgba(0,255,213,0.1)' },
  ];

  const usoOptions: { value: string; label: string; icon: React.ReactNode }[] = [
    { value: 'estudios', label: 'Estudios', icon: <BookOpen size={20} /> },
    { value: 'gaming', label: 'Gaming', icon: <Gamepad2 size={20} /> },
    { value: 'diseno', label: 'Diseño', icon: <Palette size={20} /> },
    { value: 'oficina', label: 'Oficina', icon: <Briefcase size={20} /> },
    { value: 'programacion', label: 'Programación', icon: <Code2 size={20} /> },
  ];

  // Range fill calculation (guarda contra división por cero si aún no llega apiFilters)
  const span = RANGE_ABS_MAX - RANGE_ABS_MIN || 1;
  const fillLeft = ((rangeMin - RANGE_ABS_MIN) / span) * 100;
  const fillRight = ((rangeMax - RANGE_ABS_MIN) / span) * 100;

  // Shared button style for grid items (type, uso, condicion, advanced)
  const gridItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: '10px 4px',
    border: `2px solid ${isActive ? T.neonCyan : T.border}`,
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: isActive ? 'rgba(0,255,213,0.06)' : T.bgCard,
    boxShadow: isActive ? '0 0 10px rgba(0,255,213,0.15)' : 'none',
    minHeight: 68,
    color: isActive ? T.neonCyan : T.textMuted,
    fontFamily: "'Rajdhani', sans-serif",
  });

  const gridLabelStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 600,
    color: isActive ? T.neonCyan : T.textSecondary,
    textAlign: 'center',
    lineHeight: 1.2,
  });

  const gridCountStyle: React.CSSProperties = {
    fontSize: 9,
    color: T.textMuted,
    fontFamily: "'Share Tech Mono', monospace",
  };

  const content = (
    <>
      {/* Range slider thumb styles (can't be done inline) */}
      <style>{`
        .gamer-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 20px; height: 20px;
          background: ${isDark ? '#0e0e0e' : '#fff'};
          border: 2px solid ${T.neonCyan};
          border-radius: 50%; cursor: grab;
          pointer-events: auto;
          box-shadow: 0 0 8px rgba(0,255,213,0.4), inset 0 0 4px rgba(0,255,213,0.2);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .gamer-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 15px rgba(0,255,213,0.6);
        }
        .gamer-range-slider::-moz-range-thumb {
          width: 20px; height: 20px;
          background: ${isDark ? '#0e0e0e' : '#fff'};
          border: 2px solid ${T.neonCyan};
          border-radius: 50%; cursor: grab;
          pointer-events: auto;
          box-shadow: 0 0 8px rgba(0,255,213,0.4);
        }
        .gamer-range-slider::-moz-range-track { background: transparent; }
        .gamer-filter-header:hover h3 { color: ${T.neonCyan} !important; }
        .gamer-filter-header:hover .gamer-chevron { color: ${T.neonCyan} !important; }
      `}</style>

      {/* ======= Header (hidden in bare/fullscreen mode) ======= */}
      {!bare && <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          paddingBottom: 16,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: T.textPrimary,
            margin: 0,
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          Filtros
        </h2>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: T.textMuted,
              fontSize: 12,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
              transition: 'all 0.3s',
            }}
          >
            <Trash2 size={16} />
            <span>Limpiar</span>
          </button>
        )}
      </div>}

      {/* Sort (mobile/sidebar - hidden in bare mode) */}
      {!bare && <div className="lg:hidden" style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            color: T.textMuted,
            marginBottom: 6,
            fontFamily: "'Share Tech Mono', monospace",
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Ordenar
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: T.bgSurface,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.textPrimary,
            fontSize: 13,
            fontFamily: "'Rajdhani', sans-serif",
            outline: 'none',
          }}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>}

      {/* =====================================================================
          NUEVO ORDEN DE FILTROS (optimizado para gamers — specs primero)
          Toda la data viene de apiFilters (backend). Solo cambia el ORDEN.
          ===================================================================== */}

      {/* ======= 1. GPU / Tarjeta Gráfica ======= */}
      {apiFilters?.specs?.gpu && apiFilters.specs.gpu.values.length > 0 && (
        <FilterSection title="GPU / Tarjeta Gráfica" T={T} expanded={expandedSections.gpu !== false} onToggle={() => onToggleSection('gpu')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {apiFilters.specs.gpu.values.map((val) => {
              const isActive = (filters.gpuType as string[]).includes(String(val.value));
              return (
                <button key={String(val.value)} onClick={() => onGpuToggle(String(val.value))} style={{ ...gridItemStyle(isActive), minHeight: 60, padding: '8px 4px' }}>
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}><Zap size={18} /></span>
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 10 }}>{val.display}</span>
                  <span style={gridCountStyle}>{val.count} equipo{val.count !== 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 2. Procesador (CPU) ======= */}
      {apiFilters?.specs?.processor && apiFilters.specs.processor.values.length > 0 && (
        <FilterSection title="Procesador" T={T} expanded={expandedSections.procesador !== false} onToggle={() => onToggleSection('procesador')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {apiFilters.specs.processor.values.map((val) => {
              const isActive = (filters.processorModel as string[]).includes(String(val.value));
              return (
                <button key={String(val.value)} onClick={() => onProcessorToggle(String(val.value))} style={{ ...gridItemStyle(isActive), minHeight: 60, padding: '8px 4px' }}>
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}><Cpu size={18} /></span>
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 10 }}>{val.display}</span>
                  <span style={gridCountStyle}>{val.count} equipo{val.count !== 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 3. RAM ======= */}
      {apiFilters?.specs?.ram && apiFilters.specs.ram.values.length > 0 && (
        <FilterSection title="RAM" T={T} expanded={expandedSections.ram !== false} onToggle={() => onToggleSection('ram')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {apiFilters.specs.ram.values.map((val) => {
              const isActive = filters.ram.some((v) => v === val.value);
              return (
                <button key={String(val.value)} onClick={() => onRamToggle(Number(val.value))} style={{ ...gridItemStyle(isActive), minHeight: 60, padding: '8px 4px' }}>
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}><MemoryStick size={18} /></span>
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 10 }}>{val.display}</span>
                  <span style={gridCountStyle}>{val.count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 4. Almacenamiento (debajo de RAM) ======= */}
      {apiFilters?.specs?.storage && apiFilters.specs.storage.values.length > 0 && (
        <FilterSection title="Almacenamiento" T={T} expanded={expandedSections.almacenamiento !== false} onToggle={() => onToggleSection('almacenamiento')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {apiFilters.specs.storage.values.map((val) => {
              const isActive = filters.storage.some((v) => v === val.value);
              return (
                <button key={String(val.value)} onClick={() => onStorageToggle(Number(val.value))} style={{ ...gridItemStyle(isActive), minHeight: 60, padding: '8px 4px' }}>
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}><HardDrive size={18} /></span>
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 10 }}>{val.display}</span>
                  <span style={gridCountStyle}>{val.count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 5. Pantalla ======= */}
      {apiFilters?.specs?.screen_size && apiFilters.specs.screen_size.values.length > 0 && (
        <FilterSection title="Pantalla" T={T} expanded={expandedSections.pantalla !== false} onToggle={() => onToggleSection('pantalla')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {apiFilters.specs.screen_size.values.map((val) => {
              const isActive = filters.displaySize.includes(Number(val.value));
              return (
                <button key={String(val.value)} onClick={() => onScreenSizeToggle(Number(val.value))} style={{ ...gridItemStyle(isActive), minHeight: 60, padding: '8px 4px' }}>
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}><Monitor size={18} /></span>
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 10 }}>{val.display}</span>
                  <span style={gridCountStyle}>{val.count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 6. Cuota mensual ======= */}
      {apiFilters?.quota_range && RANGE_ABS_MAX > RANGE_ABS_MIN && (
      <FilterSection title="Cuota mensual" T={T} expanded={expandedSections.cuota !== false} onToggle={() => onToggleSection('cuota')}>
        {/* Range display boxes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div
            style={{
              flex: 1,
              background: 'rgba(0,255,213,0.05)',
              border: '1px solid rgba(0,255,213,0.15)',
              borderRadius: 8,
              padding: 8,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 2, fontFamily: "'Share Tech Mono', monospace" }}>
              DESDE
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.neonCyan, fontFamily: "'Barlow Condensed', sans-serif", textShadow: '0 0 8px rgba(0,255,213,0.3)' }}>
              S/{rangeMin}
            </div>
          </div>
          <div style={{ color: T.textMuted, fontSize: 12 }}>—</div>
          <div
            style={{
              flex: 1,
              background: 'rgba(0,255,213,0.05)',
              border: '1px solid rgba(0,255,213,0.15)',
              borderRadius: 8,
              padding: 8,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 2, fontFamily: "'Share Tech Mono', monospace" }}>
              HASTA
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.neonCyan, fontFamily: "'Barlow Condensed', sans-serif", textShadow: '0 0 8px rgba(0,255,213,0.3)' }}>
              S/{rangeMax}
            </div>
          </div>
        </div>

        {/* Dual range slider */}
        <div style={{ position: 'relative', height: 36, margin: '0 4px' }}>
          {/* Track bg */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 6,
              transform: 'translateY(-50%)',
              background: T.border,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Fill */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                height: '100%',
                left: `${fillLeft}%`,
                width: `${fillRight - fillLeft}%`,
                background: `linear-gradient(90deg, ${T.neonCyan}, ${T.neonPurple})`,
                borderRadius: 3,
                boxShadow: '0 0 8px rgba(0,255,213,0.3)',
              }}
            />
          </div>
          {/* Min slider */}
          <input
            className="gamer-range-slider"
            type="range"
            min={RANGE_ABS_MIN}
            max={RANGE_ABS_MAX}
            step={1}
            value={rangeMin}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v <= rangeMax - 1) onQuotaRangeChange(v, rangeMax);
            }}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '100%',
              height: 20,
              WebkitAppearance: 'none',
              appearance: 'none' as never,
              background: 'transparent',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
          {/* Max slider */}
          <input
            className="gamer-range-slider"
            type="range"
            min={RANGE_ABS_MIN}
            max={RANGE_ABS_MAX}
            step={1}
            value={rangeMax}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= rangeMin + 1) onQuotaRangeChange(rangeMin, v);
            }}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '100%',
              height: 20,
              WebkitAppearance: 'none',
              appearance: 'none' as never,
              background: 'transparent',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        </div>
        {/* Range labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10,
            color: T.textMuted,
            fontFamily: "'Share Tech Mono', monospace",
            marginTop: 4,
            padding: '0 4px',
          }}
        >
          <span>S/{RANGE_ABS_MIN}</span>
          <span>S/{RANGE_ABS_MAX}</span>
        </div>
      </FilterSection>
      )}

      {/* ======= 7. Destacados ======= */}
      {apiFilters?.labels && apiFilters.labels.length > 0 && (
        <FilterSection title="Destacados" T={T} expanded={expandedSections.destacados !== false} onToggle={() => onToggleSection('destacados')}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {apiFilters.labels.map((lbl) => {
              const isActive = (filters.tags as string[]).includes(lbl.code);
              const preset = destacadosOptions.find((o) => o.value === lbl.code);
              const chipBg = preset?.chipBg || `${lbl.color}22`;
              const chipBorder = preset?.chipBorder || `${lbl.color}99`;
              const chipShadow = preset?.chipShadow || `${lbl.color}33`;
              const color = preset?.color || lbl.color;
              return (
                <span
                  key={lbl.code}
                  onClick={() => onTagToggle(lbl.code)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: `1px solid ${isActive ? T.neonCyan : chipBorder}`,
                    letterSpacing: 0.3,
                    background: chipBg,
                    color,
                    boxShadow: isActive ? `0 0 12px rgba(0,255,213,0.3)` : `0 0 6px ${chipShadow}`,
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  {lbl.name}
                  <span style={{ opacity: 0.7, fontSize: 10, fontFamily: "'Share Tech Mono', monospace" }}>({lbl.count})</span>
                </span>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 8. Marca ======= */}
      {apiFilters?.brands && apiFilters.brands.length > 0 && (
        <FilterSection title="Marca" T={T} expanded={expandedSections.marca !== false} onToggle={() => onToggleSection('marca')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {apiFilters.brands.map((brand) => {
              const isActive = filters.brands.includes(brand.slug);
              return (
                <BrandButton key={brand.id} brand={brand} isActive={isActive} T={T} onToggle={() => onBrandToggle(brand.slug)} />
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 9. Uso recomendado ======= */}
      {apiFilters?.usages && apiFilters.usages.length > 0 && (
        <FilterSection title="Uso recomendado" T={T} expanded={expandedSections.uso !== false} onToggle={() => onToggleSection('uso')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {apiFilters.usages.map((u, idx) => {
              const isActive = (filters.usage as string[]).includes(u.value);
              const isLast = idx === apiFilters.usages.length - 1;
              const isOddLast = isLast && apiFilters.usages.length % 2 !== 0;
              const preset = usoOptions.find((o) => o.value === u.value);
              const icon = preset?.icon || <Laptop size={20} />;
              return (
                <button
                  key={u.value}
                  onClick={() => onUsageToggle(u.value)}
                  style={{
                    ...gridItemStyle(isActive),
                    ...(isOddLast ? { gridColumn: '1 / -1' } : {}),
                  }}
                >
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}>{icon}</span>
                  <span style={gridLabelStyle(isActive)}>{u.label}</span>
                  <span style={gridCountStyle}>{u.count} equipo{u.count !== 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 10. Condición (último) ======= */}
      {apiFilters?.conditions && apiFilters.conditions.length > 0 && (
        <FilterSection title="Condición" T={T} expanded={expandedSections.condicion !== false} onToggle={() => onToggleSection('condicion')} isLast>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {apiFilters.conditions.map((c) => {
              const isActive = (filters.condition as string[]).includes(c.value);
              const isNueva = c.value.startsWith('nuev');
              return (
                <button
                  key={c.value}
                  onClick={() => onConditionToggle(c.value)}
                  style={{
                    ...gridItemStyle(isActive),
                    minHeight: 'unset',
                    padding: '12px 8px',
                  }}
                >
                  {isNueva ? (
                    <Package size={20} style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s', marginBottom: 6 }} />
                  ) : (
                    <CheckCircle2 size={20} style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s', marginBottom: 6 }} />
                  )}
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 11, lineHeight: 1.2 }}>{c.label}</span>
                  <span style={{ ...gridCountStyle, marginTop: 2 }}>{c.count} equipo{c.count !== 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </>
  );

  if (bare) return content;

  return (
    <div
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 20,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        maxHeight: 'calc(100vh - 170px)',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: `${T.border} transparent`,
      }}
    >
      {content}
    </div>
  );
}

// ============================================
// Filter Section (collapsible)
// ============================================

function FilterSection({
  title,
  T,
  expanded,
  onToggle,
  children,
  isLast,
}: {
  title: string;
  T: ReturnType<typeof gamerTheme>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div style={{ borderBottom: isLast ? 'none' : `1px solid ${T.border}`, padding: '16px 0' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          width: '100%',
          padding: 0,
          background: 'none',
          border: 'none',
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: T.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            transition: 'color 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            margin: 0,
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          {title}
        </h3>
        <ChevronUp
          size={18}
          style={{
            color: T.textMuted,
            fontSize: 14,
            transition: 'all 0.3s',
            transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        />
      </button>
      {expanded && (
        <div
          style={{
            marginTop: 12,
            overflow: 'hidden',
            opacity: 1,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// Sort Dropdown (desktop)
// ============================================

function SortDropdown({
  isDark,
  T,
  sort,
  onSortChange,
  options,
}: {
  isDark: boolean;
  T: ReturnType<typeof gamerTheme>;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find(o => o.value === sort)?.label || 'Recomendados';

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 200 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          padding: '8px 12px', borderRadius: 10,
          background: isDark ? T.bgSurface : '#fff',
          border: `1px solid ${open ? T.neonCyan : T.border}`,
          color: T.textPrimary, fontSize: 13,
          fontFamily: "'Rajdhani', sans-serif",
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <ArrowRight className="w-4 h-4 shrink-0" style={{ color: T.textMuted, transform: 'rotate(-90deg)' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{selectedLabel}</span>
        </div>
        <ChevronDown className="w-4 h-4 shrink-0" style={{ color: T.textMuted, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 200,
          background: isDark ? '#1a1a1a' : '#fff',
          border: `1px solid ${T.border}`,
          borderRadius: 12, padding: 4,
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
        }}>
          {options.map((opt) => {
            const isSelected = opt.value === sort;
            return (
              <button
                key={opt.value}
                onClick={() => { onSortChange(opt.value as SortOption); setOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8, border: 'none',
                  fontSize: 13, fontFamily: "'Rajdhani', sans-serif",
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: isSelected ? T.neonCyan : 'transparent',
                  color: isSelected ? (isDark ? '#0a0a0a' : '#fff') : T.textPrimary,
                  fontWeight: isSelected ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = `${T.neonCyan}15`; e.currentTarget.style.color = T.neonCyan; } }}
                onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textPrimary; } }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 17 18" fill="none">
                    <polyline points="1 9 7 14 15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// Active Filters Bar
// ============================================

function ActiveFiltersBar({
  isDark,
  T,
  filters,
  searchQuery,
  onBrandToggle,
  onGamaToggle,
  onConditionToggle,
  onDeviceTypeToggle,
  onUsageToggle,
  onTagToggle,
  onRamToggle,
  onStorageToggle,
  onGpuToggle,
  onProcessorToggle,
  onScreenSizeToggle,
  onClearSearch,
  onClearAll,
}: {
  isDark: boolean;
  T: ReturnType<typeof gamerTheme>;
  filters: FilterState;
  searchQuery: string;
  onBrandToggle: (b: string) => void;
  onGamaToggle: (g: string) => void;
  onConditionToggle: (c: string) => void;
  onDeviceTypeToggle: (t: string) => void;
  onUsageToggle: (u: string) => void;
  onTagToggle: (t: string) => void;
  onRamToggle: (r: number) => void;
  onStorageToggle: (s: number) => void;
  onGpuToggle: (g: string) => void;
  onProcessorToggle: (p: string) => void;
  onScreenSizeToggle: (s: number) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}) {
  const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    background: `${T.neonCyan}10`,
    border: `1px solid ${T.neonCyan}40`,
    borderRadius: 16,
    color: T.neonCyan,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Rajdhani', sans-serif",
    cursor: 'pointer',
  } as const;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {searchQuery.trim() && (
        <button onClick={onClearSearch} style={chipStyle}>
          Búsqueda: {searchQuery}
          <X className="w-3 h-3" />
        </button>
      )}
      {filters.brands.map((b) => (
        <button key={b} onClick={() => onBrandToggle(b)} style={chipStyle}>
          {b}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.deviceTypes.map((t) => (
        <button key={t} onClick={() => onDeviceTypeToggle(t)} style={chipStyle}>
          {t === 'laptop' ? 'Laptops' : t === 'tablet' ? 'Tablets' : t}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.gpuType.map((g) => (
        <button key={g} onClick={() => onGpuToggle(g)} style={chipStyle}>
          {g}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.processorModel.map((p) => (
        <button key={p} onClick={() => onProcessorToggle(p)} style={chipStyle}>
          {p}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.ram.map((r) => (
        <button key={r} onClick={() => onRamToggle(r)} style={chipStyle}>
          {r} GB RAM
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.storage.map((s) => (
        <button key={s} onClick={() => onStorageToggle(s)} style={chipStyle}>
          {s >= 1000 ? `${s / 1000} TB` : `${s} GB`}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.displaySize.map((s) => (
        <button key={s} onClick={() => onScreenSizeToggle(s)} style={chipStyle}>
          {s}&quot;
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.usage.map((u) => (
        <button key={u} onClick={() => onUsageToggle(u)} style={chipStyle}>
          {u}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.gama.map((g) => (
        <button key={g} onClick={() => onGamaToggle(g)} style={chipStyle}>
          {g}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.condition.map((c) => (
        <button key={c} onClick={() => onConditionToggle(c)} style={chipStyle}>
          {c}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.tags.map((t) => (
        <button key={t} onClick={() => onTagToggle(t)} style={chipStyle}>
          {t}
          <X className="w-3 h-3" />
        </button>
      ))}
      <button
        onClick={onClearAll}
        style={{
          ...chipStyle,
          background: 'transparent',
          borderColor: T.textMuted,
          color: T.textMuted,
        }}
      >
        Limpiar todo
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ============================================
// Product Card
// ============================================

function GamerProductCard({
  product,
  isDark,
  T,
  isWishlisted,
  onWishlistToggle,
  isCompared,
  onCompare,
  onDetail,
  onSolicitar,
  isFirstCard = false,
}: {
  product: CatalogProduct;
  isDark: boolean;
  T: ReturnType<typeof gamerTheme>;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  isCompared: boolean;
  onCompare: () => void;
  onDetail: () => void;
  onSolicitar: () => void;
  isFirstCard?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Spec items helper
  const specItems: { icon: React.ReactNode; label: string }[] = [];
  if (product.specs?.processor?.model) {
    specItems.push({ icon: <Cpu className="w-3.5 h-3.5 shrink-0" />, label: product.specs.processor.model });
  }
  if (product.specs?.ram) {
    specItems.push({ icon: <MemoryStick className="w-3.5 h-3.5 shrink-0" />, label: `${product.specs.ram.size}GB DDR${product.specs.ram.type?.includes('5') ? '5' : '4'}` });
  }
  if (product.specs?.storage) {
    specItems.push({ icon: <HardDrive className="w-3.5 h-3.5 shrink-0" />, label: `${product.specs.storage.size}GB ${product.specs.storage.type.toUpperCase()}` });
  }
  if (product.specs?.gpu?.model) {
    specItems.push({ icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M18 12h.01"/><path d="M6 2v4"/><path d="M10 2v4"/><path d="M14 2v4"/><path d="M18 2v4"/></svg>, label: `${product.specs.gpu.model}${product.specs.gpu.vram ? ` ${product.specs.gpu.vram}GB` : ''}` });
  }
  if (product.specs?.display) {
    specItems.push({ icon: <Monitor className="w-3.5 h-3.5 shrink-0" />, label: `${product.specs.display.size}" ${product.specs.display.resolution || 'FHD'} ${product.specs.display.refreshRate ? product.specs.display.refreshRate + 'Hz' : ''} ${product.specs.display.type || ''}`.trim() });
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col"
      style={{
        background: T.bgCard,
        border: `1px solid ${isHovered ? T.neonCyan + '40' : T.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
        transform: isHovered ? 'translateY(-3px)' : 'none',
        boxShadow: isHovered ? `0 8px 24px ${T.neonCyan}18` : 'none',
      }}
    >
      {/* ====== IMAGE AREA ====== */}
      <div
        className="relative"
        style={{
          background: isDark
            ? `linear-gradient(180deg, ${T.bgSurface}, ${T.bgCard})`
            : `linear-gradient(180deg, #f0f0f5, #ffffff)`,
          padding: '20px 20px 12px',
        }}
      >
        {/* Badges top-left */}
        {product.tags.length > 0 && (
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
            {product.tags.slice(0, 2).map((tag) => {
              const colors = BADGE_COLORS[tag] || { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.55)' };
              return (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    background: colors.bg,
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    color: colors.text,
                    fontSize: 10,
                    fontWeight: 600,
                    borderRadius: 6,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: 0.5,
                    border: `1px solid ${colors.border}`,
                    boxShadow: `0 0 10px ${colors.bg}`,
                  }}
                >
                  {tag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              );
            })}
          </div>
        )}

        {/* Action buttons top-right */}
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
          <button
            {...(isFirstCard ? { id: 'onboarding-card-favorite' } : {})}
            onClick={(e) => { e.stopPropagation(); onWishlistToggle(); }}
            className="flex items-center justify-center transition-all"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: isWishlisted
                ? (isDark ? 'rgba(255,0,85,0.15)' : 'rgba(255,0,85,0.1)')
                : (isDark ? 'rgba(10,10,20,0.6)' : 'rgba(255,255,255,0.9)'),
              backdropFilter: 'blur(8px)',
              border: isWishlisted
                ? `1.5px solid ${isDark ? 'rgba(255,0,85,0.3)' : 'rgba(255,0,85,0.3)'}`
                : (isDark ? 'none' : '1.5px solid rgba(0,0,0,0.15)'),
              boxShadow: isWishlisted
                ? '0 0 12px rgba(255,0,85,0.2)'
                : (isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'),
              cursor: 'pointer',
              color: isWishlisted ? '#ff0055' : (isDark ? 'rgba(255,255,255,0.4)' : '#555'),
            }}
            title="Favorito"
          >
            <Heart
              className="w-5 h-5"
              style={{
                fill: isWishlisted ? '#ff0055' : 'none',
              }}
            />
          </button>
          <button
            {...(isFirstCard ? { id: 'onboarding-card-compare' } : {})}
            onClick={(e) => { e.stopPropagation(); onCompare(); }}
            className="flex items-center justify-center transition-all"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: isCompared
                ? `${T.neonCyan}30`
                : (isDark ? 'rgba(10,10,20,0.6)' : 'rgba(255,255,255,0.9)'),
              backdropFilter: 'blur(8px)',
              border: isCompared
                ? `2px solid ${T.neonCyan}`
                : (isDark ? 'none' : '1.5px solid rgba(0,0,0,0.15)'),
              boxShadow: isCompared
                ? `0 0 12px ${T.neonCyan}40`
                : (isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'),
              cursor: 'pointer',
              color: isCompared ? T.neonCyan : (isDark ? 'rgba(255,255,255,0.4)' : '#555'),
            }}
            title={isCompared ? 'Quitar de comparación' : 'Comparar'}
          >
            <GitCompareArrows className="w-5 h-5" />
          </button>
        </div>

        {/* Product image */}
        <Image
          src={product.thumbnail}
          alt={product.displayName}
          width={280}
          height={176}
          className="object-contain block mx-auto"
          style={{ width: '100%', height: 176 }}
        />

      </div>

      {/* ====== CARD BODY ====== */}
      <div style={{ padding: '12px 16px 0', flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
        {/* Brand */}
        <p
          style={{
            fontSize: 12,
            color: T.neonCyan,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 4,
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          {product.brand}
        </p>

        {/* Product name */}
        <h3
          onClick={onDetail}
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: T.textPrimary,
            fontFamily: "'Rajdhani', sans-serif",
            lineHeight: 1.3,
            margin: '0 0 12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '3.5rem',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
        >
          {product.displayName}
        </h3>

        {/* Specs centered with icons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100, marginBottom: 16 }}>
          {specItems.map((spec, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center gap-2"
              style={{
                color: T.textSecondary,
                fontSize: 12,
              }}
            >
              <span style={{ color: T.neonCyan, display: 'flex' }}>{spec.icon}</span>
              <span>{spec.label}</span>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: 16 }} />

        {/* Price box */}
        <div
          style={{
            background: isDark ? 'rgba(0,255,213,0.05)' : 'rgba(0,179,150,0.05)',
            borderRadius: 16,
            padding: '16px 24px',
            marginBottom: 16,
          }}
        >
          {/* Label */}
          <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: T.textMuted }}>Cuota mensual</span>
          </div>
          {/* Main price */}
          <div className="flex items-baseline justify-center gap-0.5" style={{ marginTop: 4 }}>
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 30,
                fontWeight: 900,
                color: T.neonCyan,
              }}
            >
              S/{product.quotaMonthly}
            </span>
            <span
              style={{
                fontSize: 18,
                color: T.textMuted,
              }}
            >
              /mes
            </span>
          </div>
          {/* Sub info */}
          <p
            style={{
              fontSize: 12,
              color: T.textMuted,
              marginTop: 8,
            }}
          >
            en {product.maxTermMonths || 24} meses · sin inicial
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          <button
            {...(isFirstCard ? { id: 'onboarding-card-detail' } : {})}
            onClick={onDetail}
            className="flex items-center justify-center gap-2 transition-all"
            style={{
              height: 48,
              background: 'transparent',
              border: `2px solid ${T.neonCyan}`,
              borderRadius: 12,
              color: T.neonCyan,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Rajdhani', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            <Eye className="w-5 h-5 shrink-0" />
            Detalle
          </button>
          <button
            {...(isFirstCard ? { id: 'onboarding-card-add-to-cart' } : {})}
            onClick={onSolicitar}
            className="flex items-center justify-center gap-2 transition-all"
            style={{
              height: 48,
              backgroundColor: T.neonCyan,
              border: 'none',
              borderRadius: 12,
              color: isDark ? '#0a0a0a' : '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Rajdhani', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            Lo quiero
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Compare Modal
// ============================================

function BrandButton({ brand, isActive, T, onToggle }: { brand: { id: number; slug: string; name: string; logo_url?: string | null; count: number }; isActive: boolean; T: ReturnType<typeof gamerTheme>; onToggle: () => void }) {
  const [imgError, setImgError] = useState(false);
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        padding: '10px 4px', border: `2px solid ${isActive ? T.neonCyan : T.border}`, borderRadius: 10,
        cursor: 'pointer', transition: 'all 0.3s',
        background: isActive ? 'rgba(0,255,213,0.06)' : T.bgCard,
        boxShadow: isActive ? '0 0 12px rgba(0,255,213,0.2)' : 'none', minHeight: 68,
      }}
    >
      {imgError ? (
        <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? T.neonCyan : T.textSecondary, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>{brand.name}</span>
      ) : (
        <Image
          src={brand.logo_url || `/img/logos/${brand.slug}.svg`}
          alt={brand.name}
          width={48}
          height={24}
          style={{ maxWidth: 48, maxHeight: 24, objectFit: 'contain', borderRadius: 4, opacity: isActive ? 1 : 0.8, transition: 'all 0.3s' }}
          onError={() => setImgError(true)}
        />
      )}
      <span style={{ fontSize: 10, color: isActive ? T.neonCyan : T.textMuted, fontFamily: "'Share Tech Mono', monospace" }}>
        {brand.name} ({brand.count})
      </span>
    </button>
  );
}

function GamerHelpButton({ isDark, T, onOpenChat, onStartTour }: { isDark: boolean; T: ReturnType<typeof gamerTheme>; onOpenChat: () => void; onStartTour: () => void }) {
  const [open, setOpen] = useState(false);
  const neonCyan = T.neonCyan;
  const border = T.border;
  const bgCard = T.bgCard;
  const textPrimary = T.textPrimary;
  const textMuted = T.textMuted;

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 100 }}>
      {/* Dropdown */}
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', bottom: 52, left: 0, zIndex: 100,
            width: 256, borderRadius: 12, overflow: 'hidden',
            background: bgCard, border: `1px solid ${border}`,
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
          }}>
            <button
              onClick={() => { setOpen(false); onStartTour(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: 'none', border: 'none', borderBottom: `1px solid ${border}`,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(0,255,213,0.08)' : 'rgba(0,137,122,0.08)', flexShrink: 0 }}>
                <GraduationCap size={20} style={{ color: neonCyan }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: 0 }}>Ver tour guiado</p>
                <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>Aprende a usar el catálogo</p>
              </div>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onOpenChat();
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,213,0.08)', flexShrink: 0 }}>
                <MessageSquare size={20} style={{ color: '#00ffd5' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: 0 }}>Habla con nosotros</p>
                <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>Te ayudamos al instante</p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: neonCyan, color: isDark ? '#0a0a0a' : '#fff', fontSize: 13, fontWeight: 700,
          fontFamily: "'Rajdhani', sans-serif",
          boxShadow: isDark ? '0 4px 16px rgba(0,255,213,0.3)' : '0 4px 16px rgba(0,137,122,0.25)',
          transition: 'all 0.3s',
        }}
      >
        <HelpCircle size={16} />
        <span className="hidden sm:inline">¿Necesitas ayuda?</span>
      </button>
    </div>
  );
}

function GamerCompareModal({
  products,
  isDark,
  T,
  showDiffOnly,
  onToggleDiffOnly,
  onClose,
  onRemove,
  onClearAll,
  onSelectProduct,
}: {
  products: CatalogProduct[];
  isDark: boolean;
  T: ReturnType<typeof gamerTheme>;
  showDiffOnly: boolean;
  onToggleDiffOnly: () => void;
  onClose: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onSelectProduct: (product: CatalogProduct) => void;
}) {
  // Primary color for tints
  const primaryColor = T.neonCyan;
  const trophyGreen = '#00ffd5'; // cyan — paleta consolidada (era verde)
  const colTint = isDark ? 'rgba(0,255,213,0.05)' : 'rgba(70,84,205,0.05)';

  // Extract spec values for comparison
  const getSpecValue = (product: CatalogProduct, spec: string): string => {
    switch (spec) {
      case 'Procesador':
        return product.specs?.processor?.model || '-';
      case 'Memoria RAM':
        return product.specs?.ram ? `${product.specs.ram.size}GB DDR${product.specs.ram.type?.includes('5') ? '5' : '4'}` : '-';
      case 'Gráficos (GPU)':
        return product.specs?.gpu ? `${product.specs.gpu.model}${product.specs.gpu.vram ? ` ${product.specs.gpu.vram}GB` : ''}` : '-';
      case 'Almacenamiento':
        return product.specs?.storage ? `${product.specs.storage.size}GB ${product.specs.storage.type.toUpperCase()}` : '-';
      case 'Tamaño de Pantalla':
        return product.specs?.display ? `${product.specs.display.size}"` : '-';
      case 'Resolución':
        return product.specs?.display?.resolution || '-';
      case 'Refresh Rate':
        return product.specs?.display?.refreshRate ? `${product.specs.display.refreshRate}Hz` : '-';
      case 'Peso':
        return product.specs?.dimensions?.weight ? `${product.specs.dimensions.weight} kg` : '-';
      case 'Precio':
        return `S/ ${product.price.toLocaleString('es-PE')}`;
      case 'Cuota Mensual':
        return `S/ ${product.quotaMonthly.toLocaleString('es-PE')}`;
      default:
        return '-';
    }
  };

  // Numeric extraction for winner detection
  const getNumericValue = (product: CatalogProduct, spec: string): number | null => {
    switch (spec) {
      case 'Memoria RAM':
        return product.specs?.ram?.size ?? null;
      case 'Almacenamiento':
        return product.specs?.storage?.size ?? null;
      case 'Tamaño de Pantalla':
        return product.specs?.display?.size ?? null;
      case 'Refresh Rate':
        return product.specs?.display?.refreshRate ?? null;
      case 'Gráficos (GPU)':
        return product.specs?.gpu?.vram ?? null;
      case 'Peso':
        return product.specs?.dimensions?.weight ?? null;
      case 'Precio':
        return product.price;
      case 'Cuota Mensual':
        return product.quotaMonthly;
      default:
        return null;
    }
  };

  // Determine winner index for a spec row
  const getWinnerIndex = (spec: string): number | null => {
    const values = products.map(p => getNumericValue(p, spec));
    const validValues = values.filter((v): v is number => v !== null);
    if (validValues.length < 2) return null;

    const lowerIsBetter = spec === 'Precio' || spec === 'Cuota Mensual' || spec === 'Peso';
    const bestValue = lowerIsBetter ? Math.min(...validValues) : Math.max(...validValues);

    // Only mark winner if not all values are the same
    if (validValues.every(v => v === validValues[0])) return null;

    const winnerIdx = values.findIndex(v => v === bestValue);
    return winnerIdx >= 0 ? winnerIdx : null;
  };

  const specRows = [
    'Procesador',
    'Memoria RAM',
    'Gráficos (GPU)',
    'Almacenamiento',
    'Tamaño de Pantalla',
    'Resolución',
    'Refresh Rate',
    'Peso',
    'Precio',
    'Cuota Mensual',
  ];

  // Best option state
  const [showBestOption, setShowBestOption] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when best option view is shown
  useEffect(() => {
    if (showBestOption) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showBestOption]);

  // Animation helper
  const fadeIn = (delay: number, duration = 0.4) => ({
    opacity: 0 as const,
    animation: `fadeInUp ${duration}s ease-out ${delay}s forwards`,
  });

  // Calculate winner: product with most spec wins
  const winCounts = products.map((_, pIdx) => {
    let wins = 0;
    specRows.forEach(spec => {
      if (getWinnerIndex(spec) === pIdx) wins++;
    });
    return wins;
  });
  const totalComparableSpecs = specRows.filter(spec => getWinnerIndex(spec) !== null).length;
  const bestIdx = winCounts.indexOf(Math.max(...winCounts));
  const bestProduct = products[bestIdx];
  const bestWins = winCounts[bestIdx];
  const otherProducts = products.filter((_, i) => i !== bestIdx);

  // Notable advantage for losers
  const getNotableAdvantage = (product: CatalogProduct): string | null => {
    const pIdx = products.indexOf(product);
    // Check if this product wins on price
    if (getWinnerIndex('Precio') === pIdx || getWinnerIndex('Cuota Mensual') === pIdx) return 'Más barato';
    if (getWinnerIndex('Memoria RAM') === pIdx) return 'Más RAM';
    if (getWinnerIndex('Almacenamiento') === pIdx) return 'Más almacenamiento';
    if (getWinnerIndex('Gráficos (GPU)') === pIdx) return 'Mejor GPU';
    if (getWinnerIndex('Peso') === pIdx) return 'Más liviano';
    return null;
  };

  // Filter rows for diff-only mode
  const filteredRows = showDiffOnly
    ? specRows.filter(spec => {
        const values = products.map(p => getSpecValue(p, spec));
        return !values.every(v => v === values[0]);
      })
    : specRows;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: isDark ? T.bg : '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding: '16px 20px',
            background: isDark ? T.bgSurface : '#ffffff',
            borderBottom: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Scale className="w-5 h-5" style={{ color: primaryColor }} />
            <div>
              <h2
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: isDark ? T.textPrimary : '#171717',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Comparador de Equipos
              </h2>
              <span
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 13,
                  color: isDark ? T.textMuted : '#737373',
                  fontWeight: 500,
                }}
              >
                {products.length} equipo{products.length > 1 ? 's' : ''} seleccionado{products.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
              background: 'transparent',
              color: isDark ? T.textMuted : '#a3a3a3',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflow: 'auto',
            background: isDark ? T.bgSurface : '#fafafa',
            padding: '20px 16px',
          }}
        >
          {/* Best Option View */}
          {showBestOption && bestProduct && (
            <>
              {/* Winner Hero Card */}
              <div style={{ position: 'relative', marginBottom: 24, ...fadeIn(0.1, 0.5) }}>
                {/* Glow effect - matching HTML: absolute -inset-2, blur-xl */}
                <div
                  style={{
                    position: 'absolute',
                    inset: -8,
                    background: isDark ? 'rgba(0,255,213,0.2)' : 'rgba(70,84,205,0.2)',
                    borderRadius: 24,
                    filter: 'blur(24px)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    border: `2px solid ${primaryColor}`,
                    borderRadius: 14,
                    background: isDark ? T.bgCard : '#ffffff',
                    boxShadow: `0 25px 50px -12px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'}`,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                  }}
                  className="md:!flex-row"
                >
                  {/* Left side - Image & badge */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      flexShrink: 0,
                      padding: '16px 24px',
                      background: isDark ? 'rgba(0,255,213,0.05)' : 'rgba(70,84,205,0.05)',
                      borderRadius: 12,
                      position: 'relative',
                    }}
                    className="w-full md:w-1/3"
                  >
                    {/* Badge - positioned absolute at top center */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        right: 12,
                        display: 'flex',
                        justifyContent: 'center',
                        ...fadeIn(0, 0.4),
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: primaryColor,
                          color: isDark ? '#000' : '#fff',
                          padding: '6px 16px',
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "'Rajdhani', sans-serif",
                          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        }}
                      >
                        <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                        Mejor opción para ti
                      </span>
                    </div>
                    {/* Thumbnail */}
                    <div
                      style={{
                        borderRadius: 16,
                        background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        marginTop: 32,
                        padding: 12,
                        ...fadeIn(0.2, 0.5),
                      }}
                      className="w-28 h-28 md:w-40 md:h-40"
                    >
                      <Image
                        src={bestProduct.thumbnail}
                        alt={bestProduct.displayName}
                        width={160}
                        height={160}
                        className="w-24 h-24 md:w-36 md:h-36"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: 2, ...fadeIn(0.3, 0.3) }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4"
                          style={{ color: primaryColor, fill: primaryColor }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right side - Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, ...fadeIn(0.15, 0.4) }}>
                    {/* Brand */}
                    <span
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        color: isDark ? T.textMuted : '#a3a3a3',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {bestProduct.brand}
                    </span>
                    {/* Product name */}
                    <h3
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 24,
                        fontWeight: 700,
                        color: isDark ? T.textPrimary : '#171717',
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {bestProduct.displayName}
                    </h3>
                    {/* Subtitle */}
                    <p
                      style={{
                        fontSize: 14,
                        color: isDark ? T.textSecondary : '#525252',
                        margin: 0,
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      La mejor relación precio-calidad basada en tus preferencias
                    </p>
                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4, ...fadeIn(0.25, 0.4) }}>
                      <span
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: 36,
                          fontWeight: 700,
                          color: primaryColor,
                          lineHeight: 1,
                        }}
                      >
                        S/{bestProduct.quotaMonthly.toLocaleString('es-PE')}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: 18,
                          color: isDark ? T.textMuted : '#737373',
                        }}
                      >
                        /mes
                      </span>
                    </div>
                    {/* Wins badge */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        alignSelf: 'flex-start',
                        gap: 4,
                        padding: '4px 12px',
                        borderRadius: 999,
                        background: isDark ? 'rgba(0,255,213,0.1)' : 'rgba(70,84,205,0.1)',
                        color: primaryColor,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {bestWins}/{totalComparableSpecs} ventajas
                    </span>
                    {/* Specs grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 8,
                        marginTop: 8,
                        ...fadeIn(0.35, 0.4),
                      }}
                    >
                      {['Procesador', 'Memoria RAM', 'Gráficos (GPU)', 'Almacenamiento'].map(spec => (
                        <div
                          key={spec}
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5',
                            borderRadius: 10,
                            padding: '8px 12px',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "'Rajdhani', sans-serif",
                              fontSize: 11,
                              fontWeight: 500,
                              color: isDark ? T.textMuted : '#a3a3a3',
                              marginBottom: 2,
                            }}
                          >
                            {spec === 'Gráficos (GPU)' ? 'Gráficos' : spec}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Rajdhani', sans-serif",
                              fontSize: 13,
                              fontWeight: 600,
                              color: isDark ? T.textPrimary : '#171717',
                            }}
                          >
                            {getSpecValue(bestProduct, spec)}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Lo quiero button */}
                    <button
                      onClick={() => onSelectProduct(bestProduct)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        height: 44,
                        padding: '0 24px',
                        background: primaryColor,
                        border: 'none',
                        borderRadius: 10,
                        color: isDark ? '#000' : '#fff',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'Rajdhani', sans-serif",
                        marginTop: 8,
                        alignSelf: 'flex-start',
                        ...fadeIn(0.45, 0.4),
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Lo quiero
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Otras opciones */}
              {otherProducts.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h4
                    style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: isDark ? T.textMuted : '#737373',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 12px 0',
                      ...fadeIn(0.5, 0.3),
                    }}
                  >
                    Otras opciones
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gap: 10,
                    }}
                    className="grid-cols-1 md:grid-cols-2"
                  >
                    {otherProducts.map((product, otherIdx) => {
                      const advantage = getNotableAdvantage(product);
                      return (
                        <div
                          key={product.id}
                          style={{
                            position: 'relative',
                            background: isDark ? T.bgCard : '#ffffff',
                            border: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
                            borderRadius: 12,
                            padding: 14,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            ...fadeIn(0.55 + otherIdx * 0.1, 0.3),
                          }}
                          className="group"
                        >
                          {/* Remove button */}
                          <button
                            onClick={() => onRemove(product.id)}
                            className="opacity-0 group-hover:opacity-100"
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
                              background: isDark ? T.bgSurface : '#fff',
                              color: isDark ? T.textMuted : '#a3a3a3',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              transition: 'opacity 0.2s',
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {/* Thumbnail */}
                          <div
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: 10,
                              background: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <Image
                              src={product.thumbnail}
                              alt={product.displayName}
                              width={72}
                              height={72}
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 11,
                                fontWeight: 500,
                                color: isDark ? T.textMuted : '#a3a3a3',
                                textTransform: 'uppercase',
                              }}
                            >
                              {product.brand}
                            </span>
                            <div
                              style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 14,
                                fontWeight: 600,
                                color: isDark ? T.textPrimary : '#171717',
                                lineHeight: 1.2,
                                marginBottom: 4,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {product.displayName}
                            </div>
                            <div
                              style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 16,
                                fontWeight: 700,
                                color: primaryColor,
                                marginBottom: 6,
                              }}
                            >
                              S/{product.quotaMonthly.toLocaleString('es-PE')}<span style={{ fontSize: 12, fontWeight: 400, color: isDark ? T.textMuted : '#737373' }}>/mes</span>
                            </div>
                            {/* Specs chips */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                              {['Procesador', 'Memoria RAM', 'Gráficos (GPU)', 'Almacenamiento'].map(spec => {
                                const val = getSpecValue(product, spec);
                                if (val === '-') return null;
                                return (
                                  <span
                                    key={spec}
                                    style={{
                                      fontSize: 10,
                                      fontFamily: "'Rajdhani', sans-serif",
                                      fontWeight: 500,
                                      color: isDark ? T.textSecondary : '#525252',
                                      background: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0',
                                      padding: '2px 8px',
                                      borderRadius: 6,
                                    }}
                                  >
                                    {val}
                                  </span>
                                );
                              })}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {advantage && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontFamily: "'Rajdhani', sans-serif",
                                    fontWeight: 600,
                                    color: '#00ffd5',
                                    background: 'rgba(34,197,94,0.1)',
                                    padding: '2px 10px',
                                    borderRadius: 999,
                                  }}
                                >
                                  {advantage}
                                </span>
                              )}
                              <button
                                onClick={() => onSelectProduct(product)}
                                style={{
                                  height: 28,
                                  padding: '0 14px',
                                  borderRadius: 6,
                                  border: `1px solid ${isDark ? T.border : '#d4d4d4'}`,
                                  background: 'transparent',
                                  color: isDark ? T.textPrimary : '#171717',
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Elegir
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Card wrapper */}
          <div
            style={{
              background: isDark ? T.bgCard : '#ffffff',
              border: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {/* Card header - "Comparación resumida" + checkbox */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
                background: isDark ? T.bgCard : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? T.textPrimary : '#404040',
                  margin: 0,
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                Comparación resumida
              </h4>
              <button
                type="button"
                onClick={onToggleDiffOnly}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: `2px solid ${showDiffOnly ? primaryColor : (isDark ? T.border : '#d4d4d4')}`,
                    background: showDiffOnly ? primaryColor : (isDark ? T.bgSurface : '#ffffff'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  {showDiffOnly && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: isDark ? T.textPrimary : '#262626',
                    margin: 0,
                    fontFamily: "'Rajdhani', sans-serif",
                    textAlign: 'left',
                  }}
                >
                  Solo mostrar diferencias
                </p>
              </button>
            </div>

            {/* Comparison table */}
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                }}
              >
                {/* Product header row */}
                <thead>
                  <tr>
                    <th
                      style={{
                        width: 'clamp(80px, 22vw, 120px)',
                        padding: 'clamp(8px, 2vw, 16px) clamp(6px, 1.5vw, 12px) 12px',
                        textAlign: 'left',
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 11,
                        fontWeight: 500,
                        color: isDark ? T.textMuted : '#a3a3a3',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        verticalAlign: 'bottom',
                        borderBottom: `1px solid ${isDark ? T.border : '#f0f0f0'}`,
                      }}
                    >
                      Specs
                    </th>
                    {products.map((p, colIdx) => (
                      <th
                        key={p.id}
                        style={{
                          padding: 'clamp(8px, 2vw, 16px) clamp(4px, 1vw, 10px) 12px',
                          textAlign: 'center',
                          verticalAlign: 'bottom',
                          borderBottom: `1px solid ${isDark ? T.border : '#f0f0f0'}`,
                          background: colIdx % 2 === 1 ? colTint : 'transparent',
                          ...fadeIn(0.1 + colIdx * 0.1, 0.3),
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          {/* Thumbnail */}
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 10,
                              background: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <Image
                              src={p.thumbnail}
                              alt={p.displayName}
                              width={48}
                              height={48}
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                          {/* Brand */}
                          <span
                            style={{
                              fontFamily: "'Rajdhani', sans-serif",
                              fontSize: 11,
                              fontWeight: 500,
                              color: isDark ? T.textMuted : '#a3a3a3',
                              textTransform: 'uppercase',
                              letterSpacing: 0.3,
                            }}
                          >
                            {p.brand}
                          </span>
                          {/* Product name */}
                          <span
                            style={{
                              fontFamily: "'Rajdhani', sans-serif",
                              fontSize: 'clamp(11px, 2.8vw, 13px)',
                              fontWeight: 600,
                              color: isDark ? T.textPrimary : '#171717',
                              lineHeight: 1.2,
                              maxWidth: 'clamp(80px, 25vw, 140px)',
                              textAlign: 'center',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {p.displayName}
                          </span>
                          {/* Action buttons */}
                          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                            <button
                              onClick={onClose}
                              style={{
                                height: 28,
                                padding: '0 12px',
                                borderRadius: 6,
                                border: 'none',
                                background: primaryColor,
                                color: isDark ? '#000' : '#fff',
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Elegir
                            </button>
                            <button
                              onClick={() => {/* no-op for now */}}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                border: `1px solid ${isDark ? T.border : '#d4d4d4'}`,
                                background: 'transparent',
                                color: isDark ? T.textSecondary : '#525252',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                flexShrink: 0,
                              }}
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((spec, rowIdx) => {
                    const winnerIdx = getWinnerIndex(spec);
                    return (
                      <tr
                        key={spec}
                        style={{
                          background: rowIdx % 2 === 0
                            ? 'transparent'
                            : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'),
                          ...fadeIn(0.03 * rowIdx, 0.3),
                        }}
                      >
                        <td
                          style={{
                            padding: '10px 12px',
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: 12,
                            fontWeight: 500,
                            color: isDark ? T.textMuted : '#737373',
                            whiteSpace: 'nowrap',
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : '#fafafa'}`,
                          }}
                        >
                          {spec}
                        </td>
                        {products.map((p, colIdx) => {
                          const value = getSpecValue(p, spec);
                          const isWinner = winnerIdx === colIdx;
                          return (
                            <td
                              key={p.id}
                              style={{
                                padding: '10px 8px',
                                textAlign: 'center',
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 13,
                                fontWeight: isWinner ? 600 : 400,
                                color: isWinner ? primaryColor : (isDark ? T.textPrimary : '#404040'),
                                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : '#fafafa'}`,
                                background: colIdx % 2 === 1 ? colTint : 'transparent',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  justifyContent: 'center',
                                }}
                              >
                                {isWinner && (
                                  <Trophy
                                    className="w-3.5 h-3.5"
                                    style={{ color: trophyGreen, flexShrink: 0 }}
                                  />
                                )}
                                {value}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ====== FOOTER ====== */}
        <footer
          style={{
            padding: '16px 20px',
            borderTop: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
            background: isDark ? T.bgCard : '#ffffff',
            flexShrink: 0,
          }}
        >
          {!showBestOption ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Limpiar comparación */}
              <button
                onClick={onClearAll}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  width: '100%', padding: '8px 0',
                  background: 'none', border: 'none',
                  color: isDark ? T.textMuted : '#a3a3a3',
                  fontSize: 13, fontFamily: "'Rajdhani', sans-serif",
                  cursor: 'pointer',
                }}
              >
                <Trash2 className="w-4 h-4" />
                Limpiar comparación
              </button>

              {/* Ver mejor opción */}
              <button
                onClick={() => setShowBestOption(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', height: 44, borderRadius: 12, border: 'none',
                  background: primaryColor, color: isDark ? '#000' : '#fff',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                <Trophy className="w-4 h-4" />
                Ver mejor opción
              </button>

              {/* Cerrar */}
              <button
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', padding: '10px 0',
                  background: 'none', border: 'none',
                  color: isDark ? T.textPrimary : '#171717',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Limpiar */}
                <button
                  onClick={onClearAll}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    width: '100%', padding: '8px 0',
                    background: 'none', border: 'none',
                    color: isDark ? T.textMuted : '#a3a3a3',
                    fontSize: 13, fontFamily: "'Rajdhani', sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar comparación
                </button>

                {/* Elegir ganador */}
                <button
                  onClick={() => onSelectProduct(bestProduct)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', height: 44, borderRadius: 12, border: 'none',
                    background: primaryColor, color: isDark ? '#000' : '#fff',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  Elegir ganador
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Cerrar */}
                <button
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%', padding: '10px 0',
                    background: 'none', border: 'none',
                    color: isDark ? T.textPrimary : '#171717',
                    fontSize: 14, fontWeight: 500, cursor: 'pointer',
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  Cerrar
                </button>
              </div>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

// ============================================
// Card Skeleton
// ============================================

function GamerCardSkeleton({
  isDark,
  T,
}: {
  isDark: boolean;
  T: ReturnType<typeof gamerTheme>;
}) {
  const shimmerBg = isDark
    ? 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)'
    : 'linear-gradient(90deg, #e0e0e0 25%, #ebebeb 50%, #e0e0e0 75%)';
  const shimmerStyle = { backgroundImage: shimmerBg, backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' };

  return (
    <div
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Image placeholder */}
      <div
        style={{
          height: 176,
          ...shimmerStyle,
        }}
      />
      <div style={{ padding: '12px 14px' }}>
        {/* Title placeholder */}
        <div
          style={{
            height: 14,
            width: '80%',
            borderRadius: 4,
            ...shimmerStyle,
            marginBottom: 8,
          }}
        />
        <div
          style={{
            height: 14,
            width: '60%',
            borderRadius: 4,
            ...shimmerStyle,
            marginBottom: 16,
          }}
        />
        {/* Price placeholder */}
        <div
          style={{
            height: 48,
            borderRadius: 10,
            ...shimmerStyle,
            marginBottom: 12,
          }}
        />
        {/* Buttons placeholder */}
        <div className="flex gap-2">
          <div
            style={{
              flex: 1,
              height: 36,
              borderRadius: 8,
              ...shimmerStyle,
            }}
          />
          <div
            style={{
              flex: 1,
              height: 36,
              borderRadius: 8,
              ...shimmerStyle,
            }}
          />
        </div>
      </div>
    </div>
  );
}
