'use client';

/**
 * GamerProductDetailClient - Detalle de producto con estética gaming (Zona Gamer)
 * Reutiliza fetchProductDetail, useCatalogSharedState, ProductProvider, useProduct.
 * Tema: neon cyan (#00ffd5), neon purple (#6366f1), fondo oscuro (#0e0e0e)
 */

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Award, Calculator, Calendar, Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, Eye, FileText, Headphones, Heart, ImageIcon, Info, Laptop, Loader2, Maximize2, Minus, Network, Package, Percent, Play, Plus, Puzzle, Scale, Star, TrendingUp, Usb, X, Zap, Cpu, MemoryStick, HardDrive, Monitor, Wifi, Battery, ShieldCheck, CircleAlert } from 'lucide-react';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useCatalogSharedState } from '@/app/prototipos/0.6/[landing]/catalogo/hooks/useCatalogSharedState';
import { ProductProvider, useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import type { Accessory } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';
import { fetchProductDetail, ProductDetailResult } from './api/productDetailApi';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { getAllowMultiProduct } from '@/app/prototipos/0.6/utils/featureFlags';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';
import { GamerNewsletter } from '@/app/prototipos/0.6/components/zona-gamer/GamerNewsletter';
import { GamerNavbar } from '@/app/prototipos/0.6/components/zona-gamer/GamerNavbar';
import { CartDrawer } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/CartDrawer';
import type { CartItem, TermMonths, InitialPaymentPercent, CatalogDeviceType, CartPaymentPlan } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import type { ProductSpec, ProductPort, SimilarProduct } from './types/detail';

// localStorage keys — must match ProductContext keys exactly
const getStorageKey = (landing: string) => `baldecash-${landing}-solicitar-selected-product`;
const getCartProductsKey = (landing: string) => `baldecash-${landing}-solicitar-cart-products`;
const getAccessoriesKey = (landing: string) => `baldecash-${landing}-solicitar-selected-accessories`;
import { generateSpecSheetPDF } from './utils/generateSpecSheetPDF';
import { generateCronogramaPDF } from './utils/generateCronogramaPDF';
import { getLandingAccessories } from '@/app/prototipos/0.6/services/landingApi';
import { fetchLandingConfig } from '@/app/prototipos/0.6/services/landingConfigApi';
import { DEFAULT_LANDING_CONFIG, type LandingConfig } from '@/app/prototipos/0.6/types/landingConfig';
import { CubeGridSpinner, Toast, useToast, useScrollToTop } from '@/app/prototipos/_shared';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';
import { ZONA_GAMER_ASSETS } from '@/app/prototipos/0.6/utils/assets';

// Theme helper (same as GamerCatalogoClient)
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

type Theme = ReturnType<typeof gamerTheme>;

// Spec icon mapping
const SPEC_ICONS: Record<string, React.ReactNode> = {
  procesador: <Cpu size={20} />, processor: <Cpu size={20} />,
  memoria: <MemoryStick size={20} />, ram: <MemoryStick size={20} />,
  almacenamiento: <HardDrive size={20} />, storage: <HardDrive size={20} />,
  pantalla: <Monitor size={20} />, display: <Monitor size={20} />,
  gpu: <Zap size={20} />, 'tarjeta gráfica': <Zap size={20} />,
  conectividad: <Wifi size={20} />, connectivity: <Wifi size={20} />,
  batería: <Battery size={20} />, battery: <Battery size={20} />,
  garantía: <ShieldCheck size={20} />, warranty: <ShieldCheck size={20} />,
};

const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;500;600;700&family=Bebas+Neue&display=swap');`;

// Font shorthand constants
const F = {
  raj: "'Rajdhani', sans-serif",
  orb: "'Orbitron', sans-serif",
  mono: "'Share Tech Mono', monospace",
  bar: "'Barlow Condensed', sans-serif",
  bebas: "'Bebas Neue', sans-serif",
} as const;

// ============================================
// Main export
// ============================================

export function GamerProductDetailClient() {
  const params = useParams();
  const landing = (params.landing as string) || 'zona-gamer';
  return (
    <ProductProvider landingSlug={landing}>
      <Suspense fallback={<LoadingFallback />}>
        <DetailContent />
      </Suspense>
    </ProductProvider>
  );
}

function LoadingFallback() {
  return (
    <div className="gamer-loading-fallback">
      <CubeGridSpinner />
    </div>
  );
}

// ============================================
// Content
// ============================================

function DetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const landing = (params.landing as string) || 'zona-gamer';
  const slugArray = params.slug as string[] | undefined;
  const slug = slugArray?.join('/') || '';
  // Note: we write directly to localStorage instead of using context setters
  // because each page has its own ProductProvider instance.

  // Scroll to top on mount (when arriving from catalog with scroll)
  useScrollToTop();

  // Read pricing defaults from URL params so user's selection from catalog is preserved
  const urlDefaultTerm = (() => {
    const p = searchParams.get('term');
    if (!p) return undefined;
    const n = parseInt(p);
    return isNaN(n) ? undefined : n;
  })();
  const urlDefaultInitial = (() => {
    const p = searchParams.get('initial');
    if (!p) return undefined;
    const n = parseInt(p);
    return isNaN(n) ? undefined : n;
  })();

  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;
  const { settings } = useLayout();
  const ALLOW_MULTI_PRODUCT = getAllowMultiProduct(settings);
  const tracker = useEventTrackerOptional();
  const analytics = useAnalytics();

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

  const [data, setData] = useState<ProductDetailResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  // Reset image index when the user navigates to another product (e.g. color sibling)
  // so the gallery doesn't show a stale index from the previous product.
  useEffect(() => {
    setSelectedImage(0);
  }, [data?.product?.id]);
  const [zoom, setZoom] = useState<{ active: boolean; x: number; y: number }>({ active: false, x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(100);

  // Gallery tracking helpers — emit open/close/zoom/image-change with payloads
  // identical to the normal landing (parity with ProductGallery.tsx).
  const openLightbox = useCallback((index: number) => {
    setLightboxZoom(100);
    setLightboxOpen(true);
    if (data?.product) {
      analytics.trackGalleryLightbox({ open: true, product_id: String(data.product.id), index });
    }
  }, [analytics, data]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    if (data?.product) {
      analytics.trackGalleryLightbox({ open: false, product_id: String(data.product.id) });
    }
  }, [analytics, data]);

  const changeGalleryImage = useCallback((newIndex: number, method: 'thumb' | 'arrow' | 'keyboard' | 'swipe') => {
    setSelectedImage(newIndex);
    if (data?.product) {
      analytics.trackGalleryImageChange({
        product_id: String(data.product.id),
        index: newIndex,
        total: data.product.images?.length ?? 0,
        method,
      });
    }
  }, [analytics, data]);

  const zoomLightbox = useCallback((direction: 'in' | 'out') => {
    setLightboxZoom((z) => {
      const next = direction === 'in' ? Math.min(300, z + 25) : Math.max(50, z - 25);
      if (data?.product && next !== z) {
        analytics.trackGalleryZoom({ product_id: String(data.product.id), direction, level: next });
      }
      return next;
    });
  }, [analytics, data]);
  const [selectedTerm, setSelectedTerm] = useState(12);
  const [selectedInitialPercent, setSelectedInitialPercent] = useState<number>(0);

  // Accessories
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  const catalogState = useCatalogSharedState(landing, previewKey);

  // Cart UI state
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast(4000);

  // Accessory toast (matches wishlist toast styling in GamerCatalogoClient)
  const [accessoryToast, setAccessoryToast] = useState<{ message: string; isAdded: boolean } | null>(null);
  const accessoryToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerAccessoryToast = useCallback((message: string, isAdded: boolean) => {
    setAccessoryToast({ message, isAdded });
    if (accessoryToastTimerRef.current) clearTimeout(accessoryToastTimerRef.current);
    accessoryToastTimerRef.current = setTimeout(() => {
      setAccessoryToast(null);
      accessoryToastTimerRef.current = null;
    }, 2500);
  }, []);
  useEffect(() => () => {
    if (accessoryToastTimerRef.current) clearTimeout(accessoryToastTimerRef.current);
  }, []);

  // Download loading states
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [specDownloadSuccess, setSpecDownloadSuccess] = useState(false);

  // Landing config (drives feature flags like show_platform_commission).
  // Mirrors ProductDetailClient normal so the cronograma respects the same toggle.
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);
  useEffect(() => {
    let cancelled = false;
    fetchLandingConfig(landing).then((cfg) => {
      if (!cancelled) setLandingConfig(cfg);
    }).catch((err) => {
      console.warn('[GamerProductDetail] Failed to load landing config:', err);
    });
    return () => { cancelled = true; };
  }, [landing]);
  const showPlatformCommission = landingConfig.features.show_platform_commission;

  // Add to cart handler
  const handleAddToCart = useCallback((cartItem: CartItem) => {
    if (!catalogState.isInCart(cartItem.productId)) {
      catalogState.addToCart(cartItem);
      showToast('Producto añadido al carrito', 'success');
    }
  }, [catalogState, showToast]);

  // Cart continue — save products directly to localStorage before navigating
  const handleCartContinue = useCallback(() => {
    if (catalogState.cart.length === 0) return;
    const productsForContext = catalogState.cart.map((item) => ({
      id: item.productId,
      slug: item.slug,
      name: item.name,
      shortName: item.shortName,
      brand: item.brand,
      price: item.price,
      monthlyPayment: item.monthlyPayment,
      months: item.months,
      term: item.term ?? item.months,
      paymentFrequency: item.paymentFrequency,
      initialPercent: item.initialPercent,
      initialAmount: item.initialAmount,
      image: item.image,
      type: item.type,
      variantId: item.variantId,
      colorName: item.colorName,
      colorHex: item.colorHex,
      specs: item.specs,
      paymentPlans: item.paymentPlans,
    }));
    // Write directly to localStorage (each page has its own ProductProvider instance)
    try {
      localStorage.setItem(getStorageKey(landing), JSON.stringify(productsForContext[0]));
      localStorage.setItem(getCartProductsKey(landing), JSON.stringify(productsForContext));
    } catch {
      // localStorage not available
    }
    router.push(routes.solicitar(landing));
  }, [catalogState.cart, router, landing]);

  // Cleanup toast timers on unmount (prevents setState-after-unmount)
  useEffect(() => () => {
    if (wishlistToastTimerRef.current) clearTimeout(wishlistToastTimerRef.current);
    if (specDownloadTimerRef.current) clearTimeout(specDownloadTimerRef.current);
  }, []);

  // Scroll lock + Escape for the image lightbox (a11y + iOS Safari)
  useEffect(() => {
    if (!lightboxOpen) return;
    const savedY = window.scrollY;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      overflow: document.body.style.overflow,
    };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.left = prev.left;
      document.body.style.right = prev.right;
      document.body.style.overflow = prev.overflow;
      window.scrollTo(0, savedY);
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen, closeLightbox]);

  // Fetch product data desde el endpoint real de zona-gamer — sin fallback a mocks
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchProductDetail(landing, slug)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setData(result);
          tracker?.track('product_view', {
            product_id: result.product.id,
            product_name: result.product.name,
            brand: result.product.brand,
            slug,
          });
        } else {
          setError('Producto no encontrado');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Error al cargar el producto');
        setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [landing, slug]);

  // Set default term and initial: URL params first (user's selection from catalog),
  // then API defaultTerm/defaultInitial, then fallback to max term / 0.
  //
  // Fires once per product (keyed on product.id). Without this guard, any
  // subsequent mutation of `data` (e.g. after the user switches color and the
  // fetch replaces `data` with the sibling's) would overwrite the user's manual
  // term/initial selection.
  const defaultsAppliedForIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!data?.paymentPlans?.length) return;
    const currentId = String(data.product.id);
    if (defaultsAppliedForIdRef.current === currentId) return;
    defaultsAppliedForIdRef.current = currentId;

    const plans = data.paymentPlans;
    // Term
    if (urlDefaultTerm != null && plans.some((p) => p.term === urlDefaultTerm)) {
      setSelectedTerm(urlDefaultTerm);
    } else if (data.defaultTerm != null && plans.some((p) => p.term === data.defaultTerm)) {
      setSelectedTerm(data.defaultTerm);
    } else {
      setSelectedTerm(Math.max(...plans.map((p) => p.term)));
    }
    // Initial
    if (urlDefaultInitial != null) {
      setSelectedInitialPercent(urlDefaultInitial);
    } else if (data.defaultInitial != null) {
      setSelectedInitialPercent(data.defaultInitial);
    }
  }, [data, urlDefaultTerm, urlDefaultInitial]);

  // Fetch accessories — re-runs when the user picks a different plazo so cuotas
  // are recalculated for the active term. Also passes previewKey and paymentFrequency
  // so preview mode + semanal/quincenal products get the right price set.
  useEffect(() => {
    let cancelled = false;
    const deviceType = data?.product?.deviceType;
    if (!deviceType) return;
    // Use the user-selected term (falls back to the first plan's term on first render
    // before defaults settle).
    const term = selectedTerm || data?.paymentPlans?.[0]?.term;
    const paymentFrequency = data?.paymentFrequencies?.[0];
    getLandingAccessories(landing, deviceType, term, previewKey, paymentFrequency).then((items) => {
      if (cancelled || !items?.length) return;
      setAccessories(items.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description || '',
        price: a.price || 0,
        image: a.thumbnail_url || a.image,
        thumbnailUrl: a.thumbnail_url,
        monthlyQuota: a.monthlyQuota,
        term: a.term,
        category: a.category ?? null,
        isRecommended: a.isRecommended,
        compatibleWith: a.compatibleWith,
        specs: a.specs,
        brand: a.brand ?? null,
      })));
    }).catch((err) => {
      // Accessories are optional — log for visibility but don't break the page.
      console.warn('[GamerProductDetail] Failed to load accessories:', err);
    });
    return () => { cancelled = true; };
  }, [landing, data, selectedTerm, previewKey]);

  const product = data?.product;

  // Helper to extract spec values from ProductSpec[] array (same pattern as normal landing)
  const getSpecValue = useCallback((category: string, label: string): string => {
    if (!product?.specs) return '';
    const specCategory = (product.specs as Array<{ category: string; specs: Array<{ label: string; value: string }> }>)
      .find((s) => s.category.toLowerCase() === category.toLowerCase());
    if (!specCategory) return '';
    const spec = specCategory.specs.find((s) => s.label.toLowerCase().includes(label.toLowerCase()));
    return spec?.value || '';
  }, [product?.specs]);

  // Thumbnail: filter out video URLs (same as normal landing)
  const productThumbnail = useMemo(() => {
    if (!product?.images?.length) return '';
    const img = product.images.find((i: { type?: string; url: string }) => i.type !== 'video' && !/\.(mp4|webm|ogg)(\?|$)/i.test(i.url));
    return img?.url || product.images[0]?.url || '';
  }, [product?.images]);

  const paymentPlans = data?.paymentPlans || [];
  const similarProducts = data?.similarProducts || [];
  const limitations = data?.limitations || [];
  const certifications = data?.certifications || [];
  const combo = data?.combo;
  const isAvailable = data?.isAvailable !== false;
  const activePlan = paymentPlans.find((p) => p.term === selectedTerm) || paymentPlans[0];
  const lowestOption = activePlan?.options?.find((o) => o.initialPercent === selectedInitialPercent) || activePlan?.options?.[0];
  const isWishlisted = product ? catalogState.isInWishlist(String(product.id)) : false;

  // Month-equivalent of the selected term. For semanal (term=48 weeks → 12 months)
  // or quincenal (term=24 fortnights → 12 months) we need the normalized value
  // so wishlist/cart items show the right plazo regardless of frequency.
  const selectedTermMonths = useMemo(() => {
    const plan = paymentPlans.find((p) => p.term === selectedTerm);
    return plan?.termMonths ?? selectedTerm;
  }, [paymentPlans, selectedTerm]);

  // Tracked setters: emit analytics when the user (not the URL/API default) changes pricing.
  const handleTermChange = useCallback((nextTerm: number) => {
    if (nextTerm === selectedTerm || !product) return;
    analytics.trackPricingTermChange({
      product_id: String(product.id),
      from: selectedTerm,
      to: nextTerm,
      context: 'detail',
      frequency: data?.paymentFrequencies?.[0],
    });
    setSelectedTerm(nextTerm);
  }, [analytics, selectedTerm, product, data]);

  const handleInitialChange = useCallback((nextInitial: number) => {
    if (nextInitial === selectedInitialPercent || !product) return;
    analytics.trackPricingInitialChange({
      product_id: String(product.id),
      from: selectedInitialPercent,
      to: nextInitial,
      context: 'detail',
    });
    setSelectedInitialPercent(nextInitial);
  }, [analytics, selectedInitialPercent, product]);

  // Transform PaymentPlan[] to CartPaymentPlan[] so persisted items match
  // the shape the solicitar flow expects (parity with ProductDetail normal).
  const cartPaymentPlans: CartPaymentPlan[] = useMemo(() => {
    return paymentPlans.map((plan) => ({
      term: plan.term,
      termMonths: plan.termMonths ?? null,
      options: plan.options.map((opt) => ({
        initialPercent: opt.initialPercent,
        initialAmount: opt.initialAmount,
        monthlyQuota: opt.monthlyQuota,
        originalQuota: opt.originalQuota,
      })),
    }));
  }, [paymentPlans]);

  // Color siblings (other color variants of the same product)
  const hasSiblings = (product?.colorSiblings?.length ?? 0) > 1;
  const siblingColors = hasSiblings
    ? product!.colorSiblings.map((sib) => ({ id: String(sib.productId), name: sib.color, hex: sib.colorHex }))
    : null;
  const displayColors = siblingColors || product?.colors || [];
  const defaultColorId = hasSiblings
    ? String(product!.colorSiblings.find((s) => s.slug === product!.slug)?.productId || displayColors[0]?.id)
    : displayColors[0]?.id || '';
  const [selectedColorId, setSelectedColorId] = useState(defaultColorId);

  const handleColorSelect = useCallback((colorId: string) => {
    if (hasSiblings && product?.colorSiblings) {
      const sibling = product.colorSiblings.find((s) => String(s.productId) === colorId);
      if (sibling && sibling.slug !== product.slug) {
        analytics.trackColorSelect({
          product_id: String(product.id),
          color_id: colorId,
          color_name: sibling.color,
          navigates_to_sibling: true,
        });
        // Preserve the user's term + initial choice so the sibling doesn't reset pricing.
        const base = routes.producto(landing, sibling.slug);
        const qs = new URLSearchParams();
        if (selectedTerm) qs.set('term', String(selectedTerm));
        if (selectedInitialPercent != null) qs.set('initial', String(selectedInitialPercent));
        const q = qs.toString();
        router.push(q ? `${base}?${q}` : base);
        return;
      }
    }
    if (product) {
      const selectedColor = displayColors.find((c) => c.id === colorId);
      analytics.trackColorSelect({
        product_id: String(product.id),
        color_id: colorId,
        color_name: selectedColor?.name,
        navigates_to_sibling: false,
      });
    }
    setSelectedColorId(colorId);
  }, [hasSiblings, product, router, landing, analytics, displayColors, selectedTerm, selectedInitialPercent]);

  const [wishlistToast, setWishlistToast] = useState<string | null>(null);
  const wishlistToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const specDownloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleWishlist = () => {
    if (!product) return;
    const pid = String(product.id);
    const wasWishlisted = catalogState.isInWishlist(pid);
    const selectedColor = displayColors.find((c) => c.id === selectedColorId);
    const initialAmount = lowestOption?.initialAmount ?? Math.round((product.price * (selectedInitialPercent || 0)) / 100);
    catalogState.toggleWishlist({
      productId: pid,
      name: product.displayName || product.name,
      shortName: product.name,
      image: productThumbnail,
      price: product.price,
      lowestQuota: lowestOption?.monthlyQuota || 0,
      brand: product.brand,
      slug: product.slug,
      type: product.deviceType as 'laptop' | 'tablet' | 'celular' | 'accesorio',
      months: (selectedTermMonths || 24) as TermMonths,
      term: selectedTerm ?? undefined,
      paymentFrequency: data?.paymentFrequencies?.[0],
      initialPercent: (selectedInitialPercent || 0) as 0 | 10 | 20,
      initialAmount,
      monthlyPayment: lowestOption?.monthlyQuota || 0,
      // Priorize backend variantId (e.g. SKU) over the color swatch id.
      variantId: (product as { variantId?: string | number }).variantId != null
        ? String((product as { variantId: string | number }).variantId)
        : (selectedColorId || undefined),
      colorName: selectedColor?.name,
      colorHex: selectedColor?.hex,
      addedAt: Date.now(),
    });
    setWishlistToast(wasWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos');
    if (wishlistToastTimerRef.current) clearTimeout(wishlistToastTimerRef.current);
    wishlistToastTimerRef.current = setTimeout(() => {
      setWishlistToast(null);
      wishlistToastTimerRef.current = null;
    }, 2500);
  };

  const handleSolicitar = useCallback(() => {
    if (!product) return;

    if (ALLOW_MULTI_PRODUCT) {
      // Multi-product mode: add to cart
      const selectedColor = displayColors.find((c) => c.id === selectedColorId);
      const initialAmount = lowestOption?.initialAmount ?? Math.round((product.price * (selectedInitialPercent || 0)) / 100);
      const cartItem: CartItem = {
        productId: String(product.id),
        slug: product.slug,
        name: product.displayName || product.name,
        shortName: product.name,
        brand: product.brand,
        image: productThumbnail,
        price: product.price,
        months: (selectedTermMonths || 24) as TermMonths,
        term: selectedTerm ?? undefined,
        paymentFrequency: data?.paymentFrequencies?.[0],
        initialPercent: (selectedInitialPercent || 0) as InitialPaymentPercent,
        initialAmount,
        monthlyPayment: lowestOption?.monthlyQuota || 0,
        type: product.deviceType as CatalogDeviceType,
        variantId: (product as { variantId?: string | number }).variantId != null
          ? String((product as { variantId: string | number }).variantId)
          : (selectedColorId || undefined),
        colorName: selectedColor?.name,
        colorHex: selectedColor?.hex,
        addedAt: Date.now(),
        paymentPlans: cartPaymentPlans.length > 0 ? cartPaymentPlans : undefined,
        specs: product.specs?.length ? {
          processor: getSpecValue('procesador', 'modelo') || getSpecValue('processor', 'model'),
          ram: getSpecValue('memoria', 'capacidad') || getSpecValue('ram', 'size'),
          storage: getSpecValue('almacenamiento', 'capacidad') || getSpecValue('storage', 'size'),
        } : undefined,
      };
      if (catalogState.isInCart(String(product.id))) {
        // Already in cart — open cart drawer
        setIsCartDrawerOpen(true);
      } else {
        handleAddToCart(cartItem);
      }
      return;
    }

    // Single-product mode: save directly to localStorage (like normal landing)
    // This ensures data persists across page navigation since each page has its own ProductProvider
    const selectedColor = displayColors.find((c) => c.id === selectedColorId);
    const selectedProductData = {
      id: String(product.id),
      slug: product.slug,
      name: product.displayName || product.name,
      shortName: product.name,
      brand: product.brand,
      price: Math.floor(product.price),
      monthlyPayment: lowestOption?.monthlyQuota || 0,
      months: selectedTermMonths || 24,
      term: selectedTerm ?? undefined,
      paymentFrequency: data?.paymentFrequencies?.[0],
      initialPercent: selectedInitialPercent || 0,
      initialAmount: lowestOption?.initialAmount ?? Math.round((product.price * (selectedInitialPercent || 0)) / 100),
      image: productThumbnail,
      type: product.deviceType,
      variantId: (product as { variantId?: string | number }).variantId != null
        ? String((product as { variantId: string | number }).variantId)
        : (selectedColorId || undefined),
      colorName: selectedColor?.name,
      colorHex: selectedColor?.hex,
      specs: product.specs?.length ? {
        processor: getSpecValue('procesador', 'modelo') || getSpecValue('processor', 'model'),
        ram: getSpecValue('memoria', 'capacidad') || getSpecValue('ram', 'size'),
        storage: getSpecValue('almacenamiento', 'capacidad') || getSpecValue('storage', 'size'),
      } : undefined,
      paymentPlans: cartPaymentPlans.length > 0 ? cartPaymentPlans : undefined,
    };
    try {
      localStorage.setItem(getStorageKey(landing), JSON.stringify(selectedProductData));
      // User explicitly picked THIS single product — wipe stale cart only.
      // Accessories pre-selected in this page must carry over to the wizard.
      localStorage.removeItem(getCartProductsKey(landing));
    } catch {
      // localStorage not available
    }
    router.push(routes.solicitar(landing));
  }, [product, landing, router, lowestOption, selectedTerm, selectedTermMonths, selectedInitialPercent, ALLOW_MULTI_PRODUCT, catalogState, handleAddToCart, cartPaymentPlans, data, productThumbnail, getSpecValue, selectedColorId, displayColors]);

  if (isLoading) return <LoadingFallback />;

  // Error / not found
  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: F.raj, color: T.textPrimary, padding: 32 }}>
        <style>{FONTS_CSS}</style>
        <Zap size={48} style={{ color: T.neonCyan, marginBottom: 16 }} />
        <h2 style={{ fontSize: 28, fontFamily: F.bebas, letterSpacing: 2, marginBottom: 8 }}>Producto no encontrado</h2>
        <p style={{ color: T.textSecondary, marginBottom: 24, textAlign: 'center' }}>
          {error || 'No pudimos encontrar este producto. Es posible que ya no esté disponible.'}
        </p>
        <button onClick={() => router.push(routes.catalogo(landing))} style={{ background: `linear-gradient(135deg, ${T.neonCyan}, ${T.neonPurple})`, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontFamily: F.raj, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          Volver al catálogo
        </button>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : [{ id: '0', url: `${ZONA_GAMER_ASSETS}/branding/logo-ofi.png`, alt: product.name, type: 'main' as const }];
  const currentImage = images[selectedImage] || images[0];

  const quickSpecs = product.specs?.slice(0, 5).map((s) => ({ label: s.category, value: s.specs?.[0]?.value || '' })).filter((s) => s.value) || [];
  const availableTerms = paymentPlans.map((p) => p.term);
  const cyanAlpha = (a: number) => isDark ? `rgba(0,255,213,${a})` : `rgba(0,179,150,${a})`;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.textPrimary, '--gamer-cyan': T.neonCyan, '--gamer-purple': T.neonPurple, '--gamer-border': T.border, '--gamer-bg-card': T.bgCard, '--gamer-btn-text': isDark ? '#0a0a0a' : '#fff', '--gradient-cyber': isDark ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)' } as React.CSSProperties}>
      <style>{FONTS_CSS}</style>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        #section-gallery, #section-pricing, #section-description, #section-specs, #cronograma, #accesorios, #similares { scroll-margin-top: 80px; }
        .gamer-gradient-text {
          background: linear-gradient(90deg, var(--gamer-purple) 0%, var(--gamer-cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gallery-img-wrap img {
          will-change: transform;
        }
        .gallery-zoom-hint {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(6px);
          border-radius: 8px;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
          color: #525252;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          z-index: 2;
        }
        .gallery-img-wrap:hover ~ .gallery-zoom-hint { opacity: 1; }
        .gallery-thumb {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid var(--gamer-border, #e5e7eb);
          cursor: pointer;
          transition: border-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
          background: #fff;
        }
        @media (min-width: 480px) {
          .gallery-thumb { width: 52px; height: 52px; flex: 0 0 52px; border-radius: 7px; padding: 4px; }
        }
        @media (min-width: 768px) {
          .gallery-thumb { width: 64px; height: 64px; flex: 0 0 64px; border-radius: 8px; padding: 5px; }
        }
        @media (min-width: 1024px) {
          .gallery-thumb { width: 72px; height: 72px; flex: 0 0 72px; padding: 6px; }
        }
        .gallery-thumb.active-thumb {
          border-color: #4654CD;
          box-shadow: 0 0 0 2px rgba(70,84,205,0.2);
        }
        .gallery-thumbs-scroll::-webkit-scrollbar { display: none; }
        .gallery-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .gamer-thumbs-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }
        @media (min-width: 768px) {
          .gamer-thumbs-grid { grid-template-columns: repeat(6, 1fr); }
        }
        /* Ficha técnica card */
        .gamer-ficha-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .gamer-ficha-info {
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .gamer-ficha-subtitle { display: none; }
        .gamer-ficha-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px 24px;
          border-radius: 10px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Rajdhani', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s;
          min-height: 40px;
        }
        .gamer-ficha-btn:hover { opacity: 0.9; }
        @media (min-width: 640px) {
          .gamer-ficha-inner { flex-direction: row; }
          .gamer-ficha-info { text-align: left; }
          .gamer-ficha-subtitle { display: block; }
          .gamer-ficha-btn { width: auto; }
        }
        .btn-loquiero-detalle {
          background: var(--gamer-cyan, #00ffd5);
          color: var(--gamer-btn-text, #0a0a0a);
          border: none;
          border-radius: 12px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: ${isDark ? '0 8px 24px rgba(0,255,213,0.25)' : '0 8px 24px rgba(0,137,122,0.25)'};
        }
        .btn-loquiero-detalle:hover { filter: brightness(0.9); }
        /* Mobile-fixed CTA bar; static inline on desktop */
        .gamer-detail-cta-bar {
          display: flex;
          gap: 8px;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 40;
          padding: 12px 12px calc(12px + env(safe-area-inset-bottom));
          background: ${isDark ? '#0e0e0e' : '#fff'};
          border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'};
          box-shadow: 0 -4px 12px rgba(0,0,0,${isDark ? '0.4' : '0.08'});
        }
        @media (min-width: 640px) {
          .gamer-detail-cta-bar { gap: 12px; }
        }
        @media (min-width: 1024px) {
          .gamer-detail-cta-bar {
            position: static;
            z-index: auto;
            padding: 0;
            background: transparent;
            border-top: none;
            box-shadow: none;
          }
        }
        .gamer-detail-cta-heart {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          flex-shrink: 0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: ${isDark ? 'rgba(255,255,255,0.04)' : '#fafafa'};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'};
          color: ${isDark ? '#707070' : '#a0a0a0'};
        }
        .gamer-detail-cta-heart.is-wishlisted {
          background: ${isDark ? 'rgba(0,255,213,0.15)' : 'rgba(0,137,122,0.1)'};
          border-color: var(--gamer-cyan);
          color: var(--gamer-cyan);
        }
        .gamer-detail-cta-heart:hover {
          color: var(--gamer-cyan);
          border-color: rgba(0,255,213,0.3);
          background: ${isDark ? 'rgba(0,255,213,0.08)' : 'rgba(0,137,122,0.05)'};
        }
        @media (min-width: 640px) {
          .gamer-detail-cta-heart { padding: 14px 24px; }
        }
        /* Reserve space so fixed bar doesn't cover content on mobile */
        @media (max-width: 1023px) {
          .gamer-detail-mobile-spacer { height: calc(72px + env(safe-area-inset-bottom)); }
        }
        /* Wishlist toast: on mobile sits above the fixed CTA bar; on desktop at standard bottom */
        .gamer-detail-toast {
          bottom: calc(84px + env(safe-area-inset-bottom));
        }
        @media (min-width: 1024px) {
          .gamer-detail-toast { bottom: 24px; }
        }
        .spec-card {
          position: relative;
          background: var(--gamer-bg-card, #1a1a1a);
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'};
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .spec-card::before, .spec-card::after {
          content: '';
          position: absolute;
          width: 14px;
          height: 14px;
          transition: opacity 0.25s ease;
          opacity: 0.4;
        }
        .spec-card::before { top: 9px; left: 9px; border-top: 2px solid var(--gamer-cyan); border-left: 2px solid var(--gamer-cyan); }
        .spec-card::after { bottom: 9px; right: 9px; border-bottom: 2px solid var(--gamer-cyan); border-right: 2px solid var(--gamer-cyan); }
        .spec-card:hover { transform: translateY(-3px); border-color: rgba(0,255,213,0.4); box-shadow: ${isDark ? '0 0 20px rgba(0,255,213,0.15), 0 8px 24px rgba(0,0,0,0.4)' : '0 0 16px rgba(0,137,122,0.12), 0 8px 24px rgba(0,0,0,0.08)'}; }
        .spec-card:hover::before, .spec-card:hover::after { opacity: 1; }
        .spec-card-icon {
          width: 40px; height: 40px; border-radius: 8px;
          background: rgba(0,255,213,0.08); border: 1px solid rgba(0,255,213,0.2);
          display: flex; align-items: center; justify-content: center;
          color: var(--gamer-cyan); flex-shrink: 0;
        }
        .spec-card-title {
          font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.5px; color: ${isDark ? '#ffffff' : '#1a1a1a'};
        }
        .spec-card-divider { height: 1px; background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}; margin: 12px 0; }
        .spec-row { display: flex; align-items: center; justify-content: space-between; padding: 3px 0; }
        .spec-row-label { font-size: 13px; color: ${isDark ? '#ffffff' : '#1a1a1a'}; font-family: 'Rajdhani', sans-serif; }
        .spec-row-value { font-size: 13px; font-weight: 600; color: ${isDark ? '#ffffff' : '#1a1a1a'}; font-family: 'Rajdhani', sans-serif; text-align: right; }
        .spec-row-value.primary { color: var(--gamer-cyan); }
        @media (min-width: 768px) {
          .gamer-specs-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .gamer-detail-grid { grid-template-columns: 1fr 1fr !important; align-items: stretch !important; }
          .gamer-detail-gallery-order { order: 1; }
          .gamer-detail-pricing-order { order: 2; align-self: start; }
        }
        @media (max-width: 1023px) {
          .gamer-detail-gallery-order { order: 1; }
          .gamer-detail-pricing-order { order: 2; position: static !important; }
        }
        .gamer-term-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 0;
        }
        @media (min-width: 480px) {
          .gamer-term-grid { gap: 12px; }
        }
        @media (min-width: 768px) {
          .gamer-term-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
        @media (min-width: 1024px) {
          .gamer-term-grid { grid-template-columns: repeat(5, 1fr); }
        }
      `}</style>

      {/* HEADER */}
      <GamerNavbar
        theme={theme}
        onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
        catalogUrl={routes.catalogo(landing)}
      />

      {/* SIDE NAV - only visible on xl+ */}
      <SideNav
        isDark={isDark}
        T={T}
        hasDescription={!!product.description}
        hasAccessories={accessories.length > 0}
        hasSimilar={similarProducts.length > 0}
        onTabClick={(sectionId) => {
          analytics.trackDetailTabClick({
            product_id: String(product.id),
            section: sectionId,
          });
        }}
      />

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(12px, 3vw, 24px) clamp(8px, 3vw, 16px) 48px' }} className="detail-main product-font">
        {/* BREADCRUMB */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'clamp(12px, 2.5vw, 14px)', fontFamily: F.raj, flexWrap: 'nowrap', marginBottom: 16, overflow: 'hidden' }}>
          <button onClick={() => router.push(routes.landingHome(landing))} style={{ background: 'none', border: 'none', color: isDark ? '#a0a0a0' : '#737373', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0, textDecoration: 'none' }}>Inicio</button>
          <ChevronRight size={14} style={{ color: isDark ? '#555' : '#a3a3a3' }} />
          <button onClick={() => router.push(routes.catalogo(landing))} style={{ background: 'none', border: 'none', color: isDark ? '#a0a0a0' : '#737373', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0, textDecoration: 'none' }}>Catálogo</button>
          <ChevronRight size={14} style={{ color: isDark ? '#555' : '#a3a3a3' }} />
          <span style={{ color: isDark ? '#f0f0f0' : '#262626', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{product.displayName || product.name}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'clamp(16px, 4vw, 32px)', alignItems: 'start', animation: 'fadeIn 0.4s ease-out' }} className="gamer-detail-grid">

        {/* LEFT: Gallery */}
        <div id="section-gallery" className="gamer-detail-gallery-order">
          <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Gallery header: brand + rating + title + specs line */}
            <div style={{ padding: 'clamp(10px, 2.5vw, 20px) clamp(10px, 2.5vw, 20px) 0', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 10px', background: T.neonPurple, color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: 6 }}>{product.brand}</span>
                {/* Badges from backend */}
                {product.badges?.map((badge, i) => {
                  const badgeColors: Record<string, { bg: string; color: string }> = {
                    success: { bg: isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7', color: '#16a34a' },
                    warning: { bg: isDark ? 'rgba(234,179,8,0.15)' : '#fef9c3', color: '#ca8a04' },
                    info: { bg: isDark ? 'rgba(59,130,246,0.15)' : '#dbeafe', color: '#2563eb' },
                    primary: { bg: isDark ? 'rgba(99,102,241,0.15)' : '#e0e7ff', color: T.neonPurple },
                  };
                  const style = badgeColors[badge.variant || 'primary'] || badgeColors.primary;
                  return (
                    <span key={i} style={{ padding: '4px 10px', background: style.bg, color: style.color, fontSize: 11, fontWeight: 600, borderRadius: 6, fontFamily: F.mono, letterSpacing: 0.5 }}>
                      {badge.text}
                    </span>
                  );
                })}
                {/* Rating solo si el backend trae reviews reales */}
                {product.rating != null && product.reviewCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={20} style={{ color: T.neonCyan, fill: T.neonCyan }} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{product.rating}</span>
                    <span style={{ fontSize: 14, color: T.textMuted }}>({product.reviewCount})</span>
                  </div>
                )}
              </div>
              <h1 className="gamer-gradient-text" style={{ fontFamily: F.raj, fontWeight: 700, fontSize: 'clamp(18px, 4.5vw, 30px)', lineHeight: 1.2, margin: '0 0 2px' }}>
                {product.displayName || product.name}
              </h1>
              {/* Quick specs pipe-separated line */}
              {quickSpecs.length > 0 && (
                <p style={{ fontSize: 'clamp(11px, 2.8vw, 14px)', fontFamily: F.raj, color: T.textPrimary, margin: '4px 0 0', lineHeight: 1.4 }}>
                  {quickSpecs.map((s) => s.value).join(' | ')}
                </p>
              )}
              {/* Color selector */}
              {displayColors.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: T.textMuted, fontFamily: F.mono }}>Color:</span>
                  <div role="radiogroup" aria-label="Colores disponibles" style={{ display: 'flex', gap: 6 }}>
                    {displayColors.map((c) => {
                      const isSelected = c.id === selectedColorId;
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleColorSelect(c.id)}
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={c.name}
                          title={c.name}
                          style={{
                            width: 28, height: 28, borderRadius: '50%', border: isSelected ? `2px solid ${T.neonCyan}` : `2px solid ${T.border}`,
                            background: c.hex || '#888', cursor: 'pointer', padding: 0,
                            boxShadow: isSelected ? `0 0 8px ${T.neonCyan}40` : 'none',
                            transition: 'all 0.2s',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Main image/video viewer — square aspect with cursor-guided zoom (imagen) o controles nativos (video) */}
            <div
              className="gallery-img-wrap"
              style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', cursor: currentImage.type === 'video' ? 'default' : 'zoom-in', background: currentImage.type === 'video' ? '#000' : undefined }}
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null || images.length <= 1) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                touchStartX.current = null;
                if (Math.abs(dx) < 50) return;
                if (dx < 0 && selectedImage < images.length - 1) changeGalleryImage(selectedImage + 1, 'swipe');
                else if (dx > 0 && selectedImage > 0) changeGalleryImage(selectedImage - 1, 'swipe');
              }}
              {...(currentImage.type !== 'video' && {
                onMouseEnter: () => setZoom((z) => ({ ...z, active: true })),
                onMouseLeave: () => setZoom({ active: false, x: 50, y: 50 }),
                onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setZoom({ active: true, x, y });
                },
                onClick: () => openLightbox(selectedImage),
                role: 'button',
                tabIndex: 0,
                onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(selectedImage); },
              })}
            >
              {currentImage.type === 'video' ? (
                <video
                  key={currentImage.url}
                  src={currentImage.url}
                  controls
                  playsInline
                  preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentImage.url}
                    alt={currentImage.alt || product.name}
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: 'clamp(16px, 6vw, 32px)',
                      transform: zoom.active ? 'scale(2.5)' : 'scale(1)',
                      transformOrigin: `${zoom.x}% ${zoom.y}%`,
                      transition: 'transform 0.1s ease-out',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  />
                  {/* Zoom hint (hover only) */}
                  <div className="gallery-zoom-hint">
                    <Maximize2 size={14} />
                    <span>Pasa el cursor para ampliar</span>
                  </div>
                  {/* Imagen referencial label */}
                  <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', borderRadius: 8, padding: '4px 10px' }}>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.8)' }}>Imagen referencial</span>
                  </div>
                </>
              )}
              {/* Image counter */}
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', borderRadius: 8, padding: '4px 10px', zIndex: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{selectedImage + 1} / {images.length}</span>
              </div>
            </div>

            {/* Thumbnails — grid */}
            {images.length > 1 && (
              <div style={{ padding: '12px 16px', borderTop: `1px solid ${isDark ? T.border : '#f5f5f5'}` }}>
                <div className="gamer-thumbs-grid">
                  {images.map((img, idx) => {
                    const isActive = idx === selectedImage;
                    return (
                      <div
                        key={img.id}
                        onClick={() => changeGalleryImage(idx, 'thumb')}
                        role="button"
                        tabIndex={0}
                        style={{
                          position: 'relative',
                          aspectRatio: '1 / 1',
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: `2px solid ${isActive ? T.neonCyan : (isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb')}`,
                          boxShadow: isActive ? `0 0 0 2px ${isDark ? 'rgba(0,255,213,0.25)' : 'rgba(0,137,122,0.2)'}` : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: isDark ? T.bgSurface : '#fff',
                        }}
                      >
                        {img.type === 'video' ? (
                          <>
                            <video
                              src={`${img.url}#t=0.1`}
                              muted
                              playsInline
                              preload="metadata"
                              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 6, pointerEvents: 'none', background: '#000' }}
                            />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                              <Play size={16} color="#fff" fill="#fff" style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))' }} />
                            </div>
                          </>
                        ) : (
                          <Image src={img.url} alt={img.alt || `Vista ${idx + 1}`} fill style={{ objectFit: 'contain', padding: 6 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Pricing (sticky on desktop) */}
        <div id="section-pricing" className="gamer-detail-pricing-order" style={{ position: 'sticky', top: 168, alignSelf: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2.5vw, 24px)' }}>
            {/* Combo banner */}
            {combo && combo.accessories.length > 0 && (
              <div style={{ background: isDark ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(0,255,213,0.05))' : 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(0,137,122,0.04))', borderRadius: 16, border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.15)'}`, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Package size={18} style={{ color: T.neonPurple }} />
                  <span style={{ fontFamily: F.raj, fontWeight: 700, fontSize: 15, color: T.textPrimary }}>
                    {combo.displayName || 'Combo incluye'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {combo.accessories.map((acc) => (
                    <div key={acc.productId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 10 }}>
                      {acc.imageUrl && (
                        <Image src={acc.imageUrl} alt={acc.productName} width={36} height={36} style={{ borderRadius: 6, objectFit: 'contain' }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.productName}</p>
                      </div>
                      {acc.isIncludedFree ? (
                        <div style={{ textAlign: 'right' }}>
                          {acc.unitPrice > 0 && <span style={{ fontSize: 11, textDecoration: 'line-through', color: T.textMuted }}>S/{Math.round(acc.unitPrice)}</span>}
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', display: 'block' }}>Gratis</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.neonCyan }}>+S/{Math.round(acc.unitPrice)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Pricing card */}
            <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : T.border}`, padding: 24, boxShadow: isDark ? '0 0 32px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontFamily: F.raj, fontSize: 20, fontWeight: 700, color: T.textPrimary, letterSpacing: 0, margin: '0 0 8px' }}>Calcula tu cuota mensual</h3>
              <p style={{ fontFamily: F.raj, fontSize: 14, color: T.textSecondary, letterSpacing: 0, margin: '0 0 20px' }}>Selecciona el plazo que mejor se ajuste a tu presupuesto</p>

              {/* Initial payment selector */}
              {activePlan && activePlan.options.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: T.textPrimary, fontFamily: F.raj, letterSpacing: 0, marginBottom: 12 }}>Cuota inicial (opcional)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {activePlan.options.map((opt) => {
                      const isActive = opt.initialPercent === selectedInitialPercent;
                      return (
                        <button
                          key={opt.initialPercent}
                          onClick={() => handleInitialChange(opt.initialPercent)}
                          aria-pressed={isActive}
                          aria-label={opt.initialPercent === 0 ? 'Sin cuota inicial' : `Cuota inicial ${opt.initialPercent}% (S/${Math.round(opt.initialAmount)})`}
                          style={{
                            padding: '10px 16px', fontSize: 14, fontFamily: F.raj, borderRadius: 999, cursor: 'pointer', transition: 'all 0.2s',
                            minHeight: 40,
                            fontWeight: isActive ? 700 : 500,
                            background: isActive ? T.neonCyan : (isDark ? 'rgba(255,255,255,0.06)' : '#f5f5f5'),
                            color: isActive ? (isDark ? '#0a0a0a' : '#fff') : T.textSecondary,
                            border: `1px solid ${isActive ? T.neonCyan : 'transparent'}`,
                            boxShadow: isActive ? `0 2px 10px rgba(0,255,213,0.35)` : 'none',
                          }}
                        >
                          {opt.initialPercent === 0 ? 'Sin inicial' : `S/${Math.round(opt.initialAmount)}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Term cards grid */}
              {availableTerms.length > 0 && (
                <div className="gamer-term-grid">
                  {availableTerms.map((term) => {
                    const plan = paymentPlans.find((p) => p.term === term);
                    const opt = plan?.options?.find((o) => o.initialPercent === selectedInitialPercent) || plan?.options?.[0];
                    const originalOpt = opt?.originalQuota;
                    const isSelected = term === selectedTerm;
                    return (
                      <button
                        key={term}
                        onClick={() => handleTermChange(term)}
                        aria-pressed={isSelected}
                        aria-label={`Plazo de ${term} meses — cuota S/${opt ? Math.round(opt.monthlyQuota) : 'no disponible'} mensual`}
                        style={{
                          position: 'relative', padding: 12, borderRadius: 10, cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center',
                          background: isSelected ? T.neonCyan : T.bgSurface,
                          border: isSelected ? `2px solid ${T.neonCyan}` : `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: isSelected ? (isDark ? '0 8px 24px rgba(0,255,213,0.35)' : '0 8px 24px rgba(0,137,122,0.3)') : 'none',
                        }}
                      >
                        {isSelected && (
                          <div style={{ position: 'absolute', top: -7, right: -7, background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999 }}>✓</div>
                        )}
                        <p style={{ fontSize: 13, fontWeight: 500, color: isSelected ? (isDark ? 'rgba(10,10,10,0.8)' : 'rgba(255,255,255,0.85)') : T.textSecondary, fontFamily: F.raj, marginBottom: 6, lineHeight: 1.2 }}>
                          {term}<br />meses
                        </p>
                        {originalOpt && !isSelected && (
                          <p style={{ fontSize: 11, textDecoration: 'line-through', color: isDark ? 'rgba(255,255,255,0.5)' : '#999', fontFamily: F.mono, marginBottom: 3 }}>S/{Math.round(originalOpt)}</p>
                        )}
                        <p style={{ fontFamily: F.orb, fontSize: 18, fontWeight: 800, color: isSelected ? (isDark ? '#0a0a0a' : '#fff') : T.neonCyan, textShadow: !isSelected && isDark ? '0 0 10px rgba(0,255,213,0.5)' : 'none', margin: 0, wordBreak: 'break-word' }}>
                          S/{opt ? Math.round(opt.monthlyQuota) : '—'}
                        </p>
                        <p style={{ fontSize: 11, color: isSelected ? (isDark ? 'rgba(10,10,10,0.8)' : 'rgba(255,255,255,0.85)') : T.textSecondary, fontFamily: F.raj, marginTop: 3 }}>al mes</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Payment summary */}
              <div style={{ marginTop: 32, padding: 24, borderRadius: 12, background: isDark ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(0,255,213,0.06))' : 'linear-gradient(135deg, #eff6ff, #eef2ff)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'transparent'}`, textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: T.textSecondary, fontFamily: F.raj, letterSpacing: 0, marginBottom: 8 }}>Pagarías</p>
                {/* Cuota tachada solo si el backend trae originalQuota real (no inventamos descuento) */}
                {lowestOption?.originalQuota != null && lowestOption.originalQuota > lowestOption.monthlyQuota && (
                  <p style={{ textDecoration: 'line-through', fontSize: 20, color: isDark ? 'rgba(255,255,255,0.5)' : '#999', fontFamily: F.mono, marginBottom: 4 }}>
                    S/{Math.round(lowestOption.originalQuota)}/mes
                  </p>
                )}
                <p style={{ fontFamily: F.orb, fontSize: 'clamp(2rem, 8vw, 2.5rem)', fontWeight: 800, color: T.neonCyan, textShadow: isDark ? '0 0 20px rgba(0,255,213,0.6)' : 'none', lineHeight: 1.1, margin: 0 }}>
                  S/{lowestOption ? Math.round(lowestOption.monthlyQuota) : Math.round(product.lowestQuota)}/mes
                </p>
                <p style={{ fontSize: 14, color: T.textSecondary, fontFamily: F.raj, marginTop: 8 }}>durante {selectedTerm} meses</p>
                {lowestOption && lowestOption.initialPercent > 0 && lowestOption.initialAmount > 0 && (
                  <p style={{ fontSize: 14, color: T.textSecondary, fontFamily: F.raj, marginTop: 4 }}>
                    + S/{Math.round(lowestOption.initialAmount)} de inicial
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons — fixed at bottom on mobile, inline on desktop */}
            {!isAvailable ? (
              <div style={{ background: isDark ? 'rgba(202,138,4,0.1)' : '#fefce8', border: `1px solid ${isDark ? 'rgba(202,138,4,0.3)' : '#fde68a'}`, borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
                <p style={{ color: isDark ? '#eab308' : '#92400e', fontWeight: 600, fontSize: 14, margin: 0, fontFamily: F.raj }}>Este producto no se encuentra disponible actualmente</p>
              </div>
            ) : (
              <div className="gamer-detail-cta-bar">
                {(() => {
                  // Multi-product mode: detect whether the product is in cart with a different
                  // config than the one currently selected. If so, offer "Actualizar carrito"
                  // instead of leaving the user stuck with the old config.
                  if (!ALLOW_MULTI_PRODUCT || !product) {
                    return (
                      <button
                        onClick={handleSolicitar}
                        className="btn-loquiero-detalle"
                        style={{ flex: 1, padding: '14px 0', fontSize: 'clamp(0.95rem, 3vw, 1.1rem)' }}
                      >
                        ¡Lo quiero!
                      </button>
                    );
                  }
                  const pid = String(product.id);
                  const cartItem = catalogState.getCartItem(pid);
                  if (!cartItem) {
                    return (
                      <button
                        onClick={handleSolicitar}
                        className="btn-loquiero-detalle"
                        style={{ flex: 1, padding: '14px 0', fontSize: 'clamp(0.95rem, 3vw, 1.1rem)' }}
                      >
                        Agregar al carrito
                      </button>
                    );
                  }
                  const configChanged =
                    cartItem.months !== (selectedTermMonths || 24) ||
                    cartItem.initialPercent !== (selectedInitialPercent || 0);
                  if (configChanged) {
                    return (
                      <button
                        onClick={() => {
                          const initialAmount = lowestOption?.initialAmount ?? Math.round((product.price * (selectedInitialPercent || 0)) / 100);
                          catalogState.updateCartItem(pid, {
                            months: (selectedTermMonths || 24) as TermMonths,
                            term: selectedTerm ?? undefined,
                            paymentFrequency: data?.paymentFrequencies?.[0],
                            initialPercent: (selectedInitialPercent || 0) as InitialPaymentPercent,
                            initialAmount,
                            monthlyPayment: lowestOption?.monthlyQuota || 0,
                            paymentPlans: cartPaymentPlans.length > 0 ? cartPaymentPlans : undefined,
                          });
                          showToast('Carrito actualizado', 'success');
                        }}
                        className="btn-loquiero-detalle"
                        style={{ flex: 1, padding: '14px 0', fontSize: 'clamp(0.95rem, 3vw, 1.1rem)' }}
                      >
                        Actualizar carrito
                      </button>
                    );
                  }
                  return (
                    <button
                      onClick={() => setIsCartDrawerOpen(true)}
                      className="btn-loquiero-detalle"
                      style={{
                        flex: 1, padding: '14px 0', fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
                        background: isDark ? '#1a3a35' : '#e6faf7',
                        border: `2px solid ${T.neonCyan}60`,
                        color: T.neonCyan,
                      }}
                    >
                      <CheckCircle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                      En carrito
                    </button>
                  );
                })()}
                <button
                  onClick={handleToggleWishlist}
                  className={`gamer-detail-cta-heart${isWishlisted ? ' is-wishlisted' : ''}`}
                  aria-label={isWishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart size={20} style={{ fill: isWishlisted ? T.neonCyan : 'none' }} />
                </button>
              </div>
            )}

            {/* Certifications — replica el comportamiento del home: muestra el header
                aunque data.certifications esté vacío, con los chips reales del backend */}
            <div id="section-certifications">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={16} style={{ color: '#16a34a' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: isDark ? T.textPrimary : '#262626', margin: 0 }}>Producto certificado</h3>
                  <p style={{ fontSize: 12, color: isDark ? T.textMuted : '#737373', margin: 0 }}>Garantías verificadas</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {certifications.map((cert) => (
                  <span key={cert.code} title={cert.description} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: isDark ? 'rgba(255,255,255,0.06)' : '#f5f5f5', border: `1px solid ${isDark ? T.border : '#e5e7eb'}`, color: isDark ? '#d4d4d4' : '#404040' }}>
                    <Award size={14} style={{ color: T.neonCyan }} />
                    {cert.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>{/* close grid */}
      </main>{/* close container */}

      {/* DESCRIPTION SECTION */}
      {product.description && (
        <section id="section-description" style={{ maxWidth: 1280, margin: 'clamp(24px, 5vw, 48px) auto 0', padding: '0 clamp(8px, 3vw, 24px)' }}>
          <div style={{
            background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden',
          }}>
            <div style={{ padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)', borderBottom: `1px solid ${T.border}` }}>
              <h2 style={{ fontFamily: F.raj, fontSize: 18, fontWeight: 700, color: T.textPrimary, margin: 0 }}>
                Descripción
              </h2>
            </div>
            <div style={{ padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)' }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: T.textSecondary, margin: 0 }}>
                {product.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* SPECS SECTION */}
      {product.specs && product.specs.length > 0 && (
        <section id="section-specs" style={{ maxWidth: 1280, margin: 'clamp(24px, 5vw, 64px) auto clamp(24px, 5vw, 48px)', padding: '0 clamp(8px, 3vw, 24px)' }}>
          <h2 style={{ fontFamily: F.raj, fontSize: 20, fontWeight: 700, color: T.textPrimary, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            Especificaciones
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="gamer-specs-grid">
            {product.specs.map((spec, idx) => (
              <SpecCard key={idx} spec={spec} />
            ))}
          </div>
        </section>
      )}

      {/* PORTS SECTION */}
      <PortsSection T={T} isDark={isDark} ports={product.ports} />

      {/* FICHA TÉCNICA */}
      <section style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 clamp(8px, 3vw, 24px)' }}>
        <div className="gamer-ficha-card" style={{
          padding: 16, borderRadius: 16,
          background: isDark
            ? 'linear-gradient(to right, rgba(0,255,213,0.05), rgba(0,255,213,0.1))'
            : 'linear-gradient(to right, rgba(0,137,122,0.06), rgba(0,137,122,0.12))',
          border: isDark ? '1px solid rgba(0,255,213,0.2)' : '1px solid rgba(0,137,122,0.2)',
        }}>
          <div className="gamer-ficha-inner">
            <div className="gamer-ficha-info">
              <div style={{ width: 40, height: 40, borderRadius: 8, background: T.neonCyan, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Download size={20} style={{ color: isDark ? '#0a0a0a' : '#fff' }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 600, color: T.textPrimary, margin: 0, fontSize: 15, fontFamily: F.raj }}>Ficha Técnica</h4>
                <p className="gamer-ficha-subtitle" style={{ fontSize: 14, color: T.textSecondary, margin: 0, fontFamily: F.raj }}>Descarga todas las especificaciones en PDF</p>
              </div>
            </div>
            <button
              onClick={async () => {
                if (isGeneratingSpec) return;
                setIsGeneratingSpec(true);
                analytics.trackSpecSheetDownload({
                  product_id: String(product.id),
                  format: 'pdf',
                });
                try {
                  await generateSpecSheetPDF({
                    productName: product.displayName || product.name,
                    productBrand: product.brand,
                    productImage: product.images?.[0]?.url,
                    productUrl: typeof window !== 'undefined' ? window.location.href : undefined,
                    specs: product.specs || [],
                    ports: product.ports,
                    description: product.description,
                    shortDescription: product.shortDescription,
                    generatedDate: new Date(),
                    primaryColor: isDark ? [0, 255, 213] : [0, 137, 122],
                    logoUrl: `${ZONA_GAMER_ASSETS}/branding/logo-ofi.png`,
                    darkMode: isDark,
                  });
                  setSpecDownloadSuccess(true);
                  if (specDownloadTimerRef.current) clearTimeout(specDownloadTimerRef.current);
                  specDownloadTimerRef.current = setTimeout(() => {
                    setSpecDownloadSuccess(false);
                    specDownloadTimerRef.current = null;
                  }, 3000);
                } catch (e) {
                  console.error('Error generando PDF:', e);
                } finally {
                  setIsGeneratingSpec(false);
                }
              }}
              className="gamer-ficha-btn"
              disabled={isGeneratingSpec}
              style={{
                background: specDownloadSuccess ? '#22c55e' : T.neonCyan,
                color: isDark ? '#0a0a0a' : '#fff',
                opacity: isGeneratingSpec ? 0.7 : 1,
                cursor: isGeneratingSpec ? 'not-allowed' : 'pointer',
              }}
            >
              {isGeneratingSpec
                ? <><Loader2 size={16} className="animate-spin" /> Generando...</>
                : specDownloadSuccess
                ? <><Check size={16} /> Descargado</>
                : <><Download size={16} /> Descargar PDF</>
              }
            </button>
          </div>
        </div>
      </section>

      {/* CRONOGRAMA / DETALLE DE CUOTAS */}
      <div id="cronograma">
        <CronogramaSection
          T={T}
          isDark={isDark}
          selectedTerm={selectedTerm}
          monthlyQuota={lowestOption?.monthlyQuota || product.lowestQuota}
          price={product.price}
          commission={showPlatformCommission ? (lowestOption?.commissionAmount || null) : null}
          productName={product.displayName || product.name}
          productBrand={product.brand}
          /* TEA/TCEA priority: selected option first (backend may set it per initial%), then plan,
             then null (no amortization). Matches Cronograma normal behavior. */
          tea={lowestOption?.tea ?? activePlan?.tea ?? null}
          tcea={lowestOption?.tcea ?? activePlan?.tcea ?? null}
          onTrackDownload={() => {
            analytics.trackCronogramaDownload({
              product_id: String(product.id),
              term: selectedTerm,
              initial_percent: selectedInitialPercent,
            });
          }}
          onTrackModal={(open) => {
            analytics.trackCronogramaModal({ open, product_id: String(product.id) });
          }}
          onTrackExpand={(expanded) => {
            analytics.trackCronogramaExpand({
              product_id: String(product.id),
              expanded,
              term: selectedTerm,
            });
          }}
        />
      </div>

      {/* ACCESSORIES */}
      {accessories.length > 0 && (
        <div id="accesorios">
          <AccessoriesCarousel
            T={T}
            isDark={isDark}
            accessories={accessories}
            selectedTerm={selectedTerm}
            onTrackView={(accId, accName) => {
              analytics.trackAccessoryView({ accessory_id: accId, accessory_name: accName });
            }}
            onToggleFeedback={(msg, variant) => triggerAccessoryToast(msg, variant === 'success')}
          />
        </div>
      )}

      {/* SIMILAR PRODUCTS */}
      <div id="similares">
        {similarProducts.length > 0 && (
          <SimilarProductsSection
            T={T}
            isDark={isDark}
            similarProducts={similarProducts}
            currentQuota={lowestOption?.monthlyQuota || product.lowestQuota}
            landing={landing}
            allowMultiProduct={ALLOW_MULTI_PRODUCT}
            onAddToCart={handleAddToCart}
            isInCart={(id) => catalogState.isInCart(id)}
            onTrackClick={(targetId, position) => {
              analytics.trackSimilarProductClick({
                source_product_id: String(product.id),
                target_product_id: targetId,
                position,
              });
            }}
            onTrackAddToCart={(targetId) => {
              analytics.trackSimilarProductAddToCart({
                source_product_id: String(product.id),
                target_product_id: targetId,
              });
            }}
          />
        )}
      </div>

      {/* LIMITATIONS */}
      {limitations.length > 0 && (
        <section style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 clamp(8px, 3vw, 24px)' }}>
          <div style={{ background: isDark ? T.bgCard : '#fff', borderRadius: 16, padding: 'clamp(16px, 4vw, 24px)', border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? 'rgba(234,179,8,0.1)' : '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircleAlert size={18} style={{ color: '#ca8a04' }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: 0, fontFamily: F.raj }}>Información importante</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {limitations.map((lim, i) => (
                <div key={i} style={{ padding: '12px 16px', borderRadius: 10, background: isDark ? (lim.severity === 'warning' ? 'rgba(234,179,8,0.06)' : 'rgba(59,130,246,0.06)') : (lim.severity === 'warning' ? '#fffbeb' : '#eff6ff'), border: `1px solid ${isDark ? (lim.severity === 'warning' ? 'rgba(234,179,8,0.12)' : 'rgba(59,130,246,0.12)') : (lim.severity === 'warning' ? '#fef3c7' : '#dbeafe')}` }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, margin: '0 0 4px' }}>{lim.category}</p>
                  <p style={{ fontSize: 13, color: T.textSecondary, margin: 0 }}>{lim.description}</p>
                  {lim.alternative && (
                    <p style={{ fontSize: 12, color: T.neonCyan, margin: '6px 0 0', fontWeight: 500 }}>Alternativa: {lim.alternative}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Wishlist toast — aparece arriba del CTA bar fijo en mobile */}
      {wishlistToast && (
        <div className="gamer-detail-toast" style={{
          position: 'fixed', left: '50%', transform: 'translateX(-50%)', zIndex: 200,
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12,
          background: isDark ? '#1a1a1a' : '#fff', border: `1px solid ${T.border}`,
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
          fontSize: 13, fontWeight: 500, color: isDark ? '#e0e0e0' : '#333',
          fontFamily: "'Rajdhani', sans-serif", animation: 'toastIn 0.25s ease-out',
        }}>
          <Heart size={16} style={{ color: T.neonCyan, fill: wishlistToast.includes('Agregado') ? T.neonCyan : 'none' }} />
          {wishlistToast}
        </div>
      )}

      {/* Cart Drawer — only in multi-product mode */}
      {ALLOW_MULTI_PRODUCT && (
        <CartDrawer
          isOpen={isCartDrawerOpen}
          onClose={() => setIsCartDrawerOpen(false)}
          items={catalogState.cart}
          onRemoveItem={catalogState.removeFromCart}
          onClearAll={() => { catalogState.clearCart(); setIsCartDrawerOpen(false); }}
          onContinue={() => { handleCartContinue(); setIsCartDrawerOpen(false); }}
          onViewProduct={(productId) => {
            setIsCartDrawerOpen(false);
            const item = catalogState.cart.find((c) => c.productId === productId);
            if (item?.slug) router.push(routes.producto(landing, item.slug));
          }}
          unavailableIds={catalogState.unavailableCartIds}
        />
      )}

      {/* Toast for cart feedback */}
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

      {/* Accessory toast — gamer style, matches wishlist toast */}
      {accessoryToast && (
        <div style={{
          position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', zIndex: 200,
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12,
          background: isDark ? '#1a1a1a' : '#fff', border: `1px solid ${T.border}`,
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
          fontSize: 13, fontWeight: 500, color: T.textPrimary,
          fontFamily: "'Rajdhani', sans-serif", animation: 'accToastFadeIn 0.25s ease-out',
        }}>
          <style>{`@keyframes accToastFadeIn { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
          <Heart size={16} style={{ color: T.neonCyan, fill: accessoryToast.isAdded ? T.neonCyan : 'none' }} />
          {accessoryToast.message}
        </div>
      )}

      {/* Newsletter — before footer */}
      <GamerNewsletter theme={theme} />

      <GamerFooter theme={theme} />
      {/* Spacer for mobile fixed CTA bar */}
      <div className="gamer-detail-mobile-spacer" />

      {/* Image Lightbox Modal */}
      {lightboxOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 310,
            background: isDark ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={closeLightbox}
        >
          {/* Top bar: zoom controls + close */}
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 40 }} />
            {/* Zoom controls */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              borderRadius: 999, padding: '6px 14px',
            }}>
              <button
                onClick={() => zoomLightbox('out')}
                disabled={lightboxZoom <= 50}
                aria-label="Reducir zoom"
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'transparent', color: T.textPrimary, cursor: lightboxZoom <= 50 ? 'not-allowed' : 'pointer', opacity: lightboxZoom <= 50 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={16} />
              </button>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, fontFamily: F.raj, minWidth: 50, textAlign: 'center' }}>
                {lightboxZoom}%
              </span>
              <button
                onClick={() => zoomLightbox('in')}
                disabled={lightboxZoom >= 300}
                aria-label="Aumentar zoom"
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'transparent', color: T.textPrimary, cursor: lightboxZoom >= 300 ? 'not-allowed' : 'pointer', opacity: lightboxZoom >= 300 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={closeLightbox}
              aria-label="Cerrar"
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: T.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Main image/video */}
          <div
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {currentImage.type === 'video' ? (
              <video
                key={currentImage.url}
                src={currentImage.url}
                controls
                autoPlay
                playsInline
                style={{ maxWidth: '90%', maxHeight: '100%', objectFit: 'contain', background: '#000' }}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                draggable={false}
                style={{
                  maxWidth: '90%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transform: `scale(${lightboxZoom / 100})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease-out',
                  userSelect: 'none',
                }}
              />
            )}
          </div>

          {/* Bottom: thumbnails + counter */}
          <div
            style={{ padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', maxWidth: '100%', padding: '4px 0' }}>
                {images.map((img, idx) => {
                  const isActive = idx === selectedImage;
                  return (
                    <div
                      key={img.id}
                      onClick={() => { changeGalleryImage(idx, 'thumb'); setLightboxZoom(100); }}
                      role="button"
                      tabIndex={0}
                      style={{
                        width: 56, height: 56, flexShrink: 0,
                        borderRadius: 8, overflow: 'hidden',
                        border: `2px solid ${isActive ? T.neonCyan : 'transparent'}`,
                        cursor: 'pointer',
                        background: isDark ? '#1a1a1a' : '#fff',
                        padding: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {img.type === 'video' ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <video
                            src={`${img.url}#t=0.1`}
                            muted
                            playsInline
                            preload="metadata"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', pointerEvents: 'none' }}
                          />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                            <Play size={14} color="#fff" fill="#fff" style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))' }} />
                          </div>
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={img.url} alt={img.alt || `Vista ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, fontFamily: F.raj }}>
              {selectedImage + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Spec Card
// ============================================

// ============================================
// Ports Section
// ============================================

const PORT_ICON_MAP: Record<string, React.ReactNode> = {
  'usb-c': <Usb size={16} />, 'usb-a': <Usb size={16} />, 'usb': <Usb size={16} />,
  'hdmi': <Monitor size={16} />, 'audio': <Headphones size={16} />, 'audio jack': <Headphones size={16} />,
  'ethernet': <Network size={16} />, 'rj45': <Network size={16} />, 'sd': <HardDrive size={16} />,
  'lector sd': <HardDrive size={16} />,
};

function PortsSection({ T, isDark, ports }: { T: Theme; isDark: boolean; ports: ProductPort[] }) {
  // Si el backend no devuelve ports, ocultamos la sección (no inventamos puertos genéricos)
  if (!ports || ports.length === 0) return null;

  const portList = ports.map((p) => ({ name: p.name, position: p.position, count: p.count }));
  const leftPorts = portList.filter((p) => p.position === 'left');
  const rightPorts = portList.filter((p) => p.position === 'right');
  const totalPorts = portList.reduce((sum, p) => sum + (p.count || 1), 0);

  const getIcon = (name: string) => PORT_ICON_MAP[name.toLowerCase().split(' ')[0]] || <Usb size={16} />;

  const portItemStyle = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px',
    background: isDark ? T.bgSurface : '#fafafa',
    borderRadius: 8,
    border: `1px solid ${isDark ? T.border : '#e5e7eb'}`,
  };

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 clamp(8px, 3vw, 24px)' }}>
      <div style={{ background: isDark ? T.bgCard : '#fff', borderRadius: 16, padding: 'clamp(16px, 4vw, 24px)', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'clamp(16px, 4vw, 24px)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: cyanAlphaFn(isDark)(0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Usb size={20} style={{ color: T.neonCyan }} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#fff' : '#171717', margin: 0 }}>Puertos y Conectividad</h3>
            <p style={{ fontSize: 14, color: isDark ? '#707070' : '#737373', margin: 0 }}>Distribución de puertos en el equipo</p>
          </div>
        </div>

        {/* Ports layout */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 16 }}>
          {/* Left ports */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flex: '1 1 0', minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#707070' : '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Izquierda</span>
            {leftPorts.map((port, i) => (
              <div key={i} style={portItemStyle}>
                <span style={{ color: T.neonCyan }}>{getIcon(port.name)}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: isDark ? '#d4d4d4' : '#404040' }}>{port.name}</span>
                {port.count > 1 && <span style={{ fontSize: 12, color: isDark ? '#707070' : '#737373' }}>×{port.count}</span>}
              </div>
            ))}
          </div>

          {/* Center laptop icon */}
          <div className="hidden sm:flex" style={{ flexShrink: 0, width: 128, height: 96, background: isDark ? T.bgSurface : '#f5f5f5', borderRadius: 8, alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 24, border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
            <Laptop size={48} style={{ color: isDark ? '#555' : '#a3a3a3' }} />
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 4, height: 32, background: 'rgba(0,255,213,0.3)', borderRadius: '0 4px 4px 0' }} />
            <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 4, height: 32, background: 'rgba(0,255,213,0.3)', borderRadius: '4px 0 0 4px' }} />
          </div>

          {/* Right ports */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', flex: '1 1 0', minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#707070' : '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Derecha</span>
            {rightPorts.map((port, i) => (
              <div key={i} style={portItemStyle}>
                <span style={{ color: T.neonCyan }}>{getIcon(port.name)}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: isDark ? '#d4d4d4' : '#404040' }}>{port.name}</span>
                {port.count > 1 && <span style={{ fontSize: 12, color: isDark ? '#707070' : '#737373' }}>×{port.count}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Footer badges */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${isDark ? T.border : '#e5e7eb'}`, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <span style={{ padding: '4px 12px', background: cyanAlphaFn(isDark)(0.1), color: T.neonCyan, borderRadius: 999, fontSize: 12, fontWeight: 500 }}>{totalPorts} puertos totales</span>
          <span style={{ padding: '4px 12px', background: isDark ? 'rgba(255,255,255,0.06)' : '#f5f5f5', color: isDark ? '#a0a0a0' : '#525252', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>{leftPorts.length} izquierda • {rightPorts.length} derecha</span>
        </div>
      </div>
    </section>
  );
}

function cyanAlphaFn(isDark: boolean) {
  return (a: number) => isDark ? `rgba(0,255,213,${a})` : `rgba(0,179,150,${a})`;
}

// ============================================
// Side Navigation
// ============================================

type SideNavItem = { id: string; icon: React.ComponentType<{ className?: string }>; label: string };

const SIDE_NAV_ITEMS_ALL: SideNavItem[] = [
  { id: 'section-gallery', icon: ImageIcon, label: 'Galería' },
  { id: 'section-pricing', icon: Calculator, label: 'Cuotas' },
  { id: 'section-description', icon: FileText, label: 'Descripción' },
  { id: 'section-specs', icon: Cpu, label: 'Specs' },
  { id: 'cronograma', icon: Calendar, label: 'Cronograma' },
  { id: 'accesorios', icon: Puzzle, label: 'Accesorios' },
  { id: 'similares', icon: Package, label: 'Similares' },
];

function SideNav({
  isDark,
  T,
  hasDescription,
  hasAccessories,
  hasSimilar,
  onTabClick,
}: {
  isDark: boolean;
  T: Theme;
  hasDescription: boolean;
  hasAccessories: boolean;
  hasSimilar: boolean;
  onTabClick?: (sectionId: string) => void;
}) {
  // Only show sections that will actually render in the DOM, so clicking a nav
  // item never scrolls to nothing. Parity with DetailTabs normal.
  const SIDE_NAV_ITEMS: SideNavItem[] = SIDE_NAV_ITEMS_ALL.filter((item) => {
    if (item.id === 'section-description') return hasDescription;
    if (item.id === 'accesorios') return hasAccessories;
    if (item.id === 'similares') return hasSimilar;
    return true;
  });

  const [activeSection, setActiveSection] = useState('section-gallery');
  const manualOverride = useRef<string | null>(null);
  const overrideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (manualOverride.current) { setActiveSection(manualOverride.current); return; }

      // Use getBoundingClientRect for accurate position (works with sticky elements)
      const threshold = 200;
      let current = SIDE_NAV_ITEMS[0].id;
      for (const item of SIDE_NAV_ITEMS) {
        // Skip sticky pricing section for scroll detection
        if (item.id === 'section-pricing') continue;
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold) current = item.id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    // Force this section active for 1 second while smooth scroll completes
    manualOverride.current = id;
    setActiveSection(id);
    if (overrideTimer.current) clearTimeout(overrideTimer.current);
    overrideTimer.current = setTimeout(() => { manualOverride.current = null; }, 1000);

    onTabClick?.(id);

    const el = document.getElementById(id);
    if (el) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const rect = el.getBoundingClientRect();
      const targetY = scrollTop + rect.top - 110;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  };

  return (
    <div className="hidden lg:block" style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 40 }}>
      <div style={{ background: isDark ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: 16, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.08)', border: `1px solid ${T.border}`, padding: 8 }}>
        <nav className="flex flex-col gap-1">
          {SIDE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                title={item.label}
                className="group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer"
                style={isActive
                  ? { background: T.neonCyan, color: isDark ? '#0a0a0a' : '#fff', boxShadow: isDark ? '0 0 12px rgba(0,255,213,0.3)' : '0 2px 8px rgba(0,137,122,0.3)' }
                  : { background: 'transparent', color: isDark ? '#707070' : '#a0a0a0' }
                }
                onMouseEnter={(e) => { if (!isActive && e.currentTarget) { e.currentTarget.style.background = isDark ? '#2a2a2a' : '#f0f0f0'; e.currentTarget.style.color = isDark ? '#f0f0f0' : '#333'; } }}
                onMouseLeave={(e) => { if (!isActive && e.currentTarget) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isDark ? '#707070' : '#a0a0a0'; } }}
              >
                <Icon className="w-5 h-5" />
                <span
                  className="absolute left-full ml-3 px-2 py-1 text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={isActive
                    ? { background: T.neonCyan, color: isDark ? '#0a0a0a' : '#fff' }
                    : { background: isDark ? '#2a2a2a' : '#333', color: '#fff' }
                  }
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ============================================
// Financiamiento Modal
// ============================================

function FinanciamientoModal({ T, isDark, price, monthlyQuota, selectedTerm, totalPagar, tea, tcea, commission, onClose, onDownloadPdf, isDownloading }: { T: Theme; isDark: boolean; price: number; monthlyQuota: number; selectedTerm: number; totalPagar: number; tea?: number | null; tcea?: number | null; commission?: number | null; onClose: () => void; onDownloadPdf: () => void; isDownloading?: boolean }) {
  // Block body scroll while modal is open (save/restore scrollY for iOS Safari)
  useEffect(() => {
    const savedY = window.scrollY;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      overflow: document.body.style.overflow,
    };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.left = prev.left;
      document.body.style.right = prev.right;
      document.body.style.overflow = prev.overflow;
      window.scrollTo(0, savedY);
    };
  }, []);

  // Close with Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const bg = isDark ? '#1a1a1a' : '#fff';
  const surface = isDark ? '#252525' : '#fafafa';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const textMain = isDark ? '#f0f0f0' : '#171717';
  const textSec = isDark ? '#a0a0a0' : '#525252';
  const textMut = isDark ? '#707070' : '#737373';
  const accent = T.neonCyan;
  const purple = T.neonPurple;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      {/* Backdrop with blur */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />

      {/* Modal */}
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 50, width: '100%', maxWidth: 512, maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: bg, borderRadius: 16, border: `1px solid ${border}`, boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>

        {/* Header — gradient purple→cyan */}
        <div style={{ background: `linear-gradient(135deg, ${purple}, ${accent})`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={20} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Detalle del Financiamiento</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Información completa de tu crédito</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar detalle de financiamiento" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X size={16} style={{ color: '#fff' }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Summary card */}
          <div style={{ background: isDark ? 'rgba(0,255,213,0.04)' : 'rgba(70,84,205,0.05)', borderRadius: 12, padding: 16, border: `1px solid ${isDark ? 'rgba(0,255,213,0.1)' : 'rgba(70,84,205,0.1)'}`, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: textSec, fontSize: 14 }}>Precio de lista del equipo</span>
              <span style={{ fontWeight: 600, color: textMain, fontSize: 14 }}>S/{price.toLocaleString('es-PE')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: textSec, fontSize: 14 }}>Cuota mensual</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: accent }}>S/{Math.round(monthlyQuota)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: textSec, fontSize: 14 }}>Plazo</span>
              <span style={{ fontWeight: 600, color: textMain, fontSize: 14 }}>{selectedTerm} meses</span>
            </div>
          </div>

          {/* Tasas — desde el plan seleccionado (backend) */}
          {(tea != null || tcea != null) && (
            <>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: textMain, display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 4px' }}>
                <Percent size={16} style={{ color: accent }} />
                Tasas de Interés
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: tea != null && tcea != null ? '1fr 1fr' : '1fr', gap: 12 }}>
                {tea != null && (
                  <div style={{ background: surface, borderRadius: 8, padding: 12, border: `1px solid ${border}` }}>
                    <p style={{ fontSize: 11, color: textMut, marginBottom: 4 }}>TEA (Tasa Efectiva Anual)</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: textMain, margin: 0 }}>{tea}%</p>
                  </div>
                )}
                {tcea != null && (
                  <div style={{ background: surface, borderRadius: 8, padding: 12, border: `1px solid ${border}` }}>
                    <p style={{ fontSize: 11, color: textMut, marginBottom: 4 }}>TCEA (Costo Efectivo Anual)</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: textMain, margin: 0 }}>{tcea}%</p>
                  </div>
                )}
              </div>
              <hr style={{ border: 'none', height: 1, background: border, margin: '12px 0' }} />
            </>
          )}

          {/* Comisión mensual — solo si el backend la envía */}
          {commission != null && commission > 0 && (
            <>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: textMain, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px' }}>
                <CircleAlert size={16} style={{ color: accent }} />
                Comisión mensual
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
                <span style={{ fontSize: 14, color: textSec }}>Comisión mensual incluida en la cuota</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: textMain }}>S/{Math.round(commission)}</span>
              </div>
              <hr style={{ border: 'none', height: 1, background: border, margin: '12px 0' }} />
            </>
          )}

          {/* Total */}
          <div style={{ background: isDark ? 'rgba(0,255,213,0.06)' : '#f0fdf4', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${isDark ? 'rgba(0,255,213,0.15)' : 'rgba(34,197,94,0.2)'}` }}>
            <div>
              <p style={{ fontSize: 14, color: textSec, margin: 0 }}>Monto total a pagar</p>
              <p style={{ fontSize: 12, color: textMut, margin: 0 }}>{selectedTerm} cuotas de S/{Math.round(monthlyQuota)}</p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: isDark ? accent : '#16a34a', margin: 0 }}>S/{totalPagar.toLocaleString('es-PE')}</p>
          </div>

          {/* Disclaimer */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: textMut, marginTop: 8 }}>
            <Scale size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0 }}>Esta información es referencial. Las tasas y condiciones finales serán confirmadas al momento de la aprobación.</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderTop: `1px solid ${border}`, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, border: `2px solid ${isDark ? T.border : '#d4d4d4'}`, background: 'transparent', color: textMain, fontSize: 14, cursor: 'pointer' }}>Cerrar</button>
          <button onClick={onDownloadPdf} disabled={isDownloading} style={{ padding: '10px 16px', borderRadius: 10, border: `2px solid ${accent}`, background: 'transparent', color: accent, fontSize: 14, fontWeight: 500, cursor: isDownloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: isDownloading ? 0.6 : 1 }}>
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isDownloading ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Cronograma Section
// ============================================

const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

function CronogramaSection({
  T,
  isDark,
  selectedTerm,
  monthlyQuota,
  price,
  commission,
  productName,
  productBrand,
  tea,
  tcea,
  onTrackDownload,
  onTrackModal,
  onTrackExpand,
}: {
  T: Theme;
  isDark: boolean;
  selectedTerm: number;
  monthlyQuota: number;
  price: number;
  commission: number | null;
  productName: string;
  productBrand: string;
  tea?: number | null;
  tcea?: number | null;
  onTrackDownload?: () => void;
  onTrackModal?: (open: boolean) => void;
  onTrackExpand?: (expanded: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isGeneratingCronoPDF, setIsGeneratingCronoPDF] = useState(false);
  // TEA viene del plan activo (backend). Sin TEA no mostramos cronograma.
  const effectiveTea = tea ?? null;
  const comisionMensual = commission != null ? commission : 0;

  const rows = useMemo(() => {
    // Sin TEA del backend no calculamos amortización (evitamos data falsa)
    if (effectiveTea == null) return [];
    // Replicate light-mode Cronograma.tsx logic exactly for consistency
    const monthlyRate = effectiveTea / 100 / 12;
    const n = selectedTerm;
    // Derive principal from quota minus commission (exact float)
    const quotaNoComm = monthlyQuota - comisionMensual;
    const principal = monthlyRate > 0
      ? quotaNoComm * (Math.pow(1 + monthlyRate, n) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, n))
      : quotaNoComm * n;

    // French amortization with exact floats
    let balance = principal;
    const schedule: { interestF: number; balanceF: number }[] = [];
    for (let i = 0; i < n; i++) {
      const interestF = balance * monthlyRate;
      const quotaF = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      const capitalF = quotaF - interestF;
      balance = Math.max(0, balance - capitalF);
      schedule.push({ interestF, balanceF: balance });
    }

    const result = [];
    const now = new Date();
    const mesInicio = now.getMonth();
    const anioInicio = now.getFullYear();
    const montoFloor = Math.floor(monthlyQuota);
    const commissionFloor = comisionMensual > 0 ? Math.floor(comisionMensual) : 0;

    for (let i = 0; i < selectedTerm; i++) {
      const interesFloor = Math.floor(schedule[i].interestF);
      // Capital = Monto - Interés - Comisión (siempre cuadra, como en light mode)
      const capital = montoFloor - interesFloor - commissionFloor;
      const saldoFloor = Math.floor(schedule[i].balanceF);

      const mesIdx = (mesInicio + i) % 12;
      const anio = anioInicio + Math.floor((mesInicio + i) / 12);

      result.push({
        num: i + 1,
        fecha: `${MONTH_NAMES[mesIdx]} de ${anio}`,
        capital,
        interes: interesFloor,
        comision: commissionFloor,
        monto: montoFloor,
        saldo: saldoFloor,
        isLast: i === selectedTerm - 1,
      });
    }
    return result;
  }, [selectedTerm, monthlyQuota, comisionMensual, effectiveTea]);

  const visibleRows = expanded ? rows : rows.slice(0, 6);
  const totalPagar = rows.length * Math.round(monthlyQuota);

  const handleDownloadCronograma = useCallback(async () => {
    if (isGeneratingCronoPDF) return;
    setIsGeneratingCronoPDF(true);
    onTrackDownload?.();
    try {
      await generateCronogramaPDF({
        productName,
        productBrand,
        productPrice: price,
        productUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        term: selectedTerm,
        monthlyQuota: Math.round(monthlyQuota),
        totalPayment: totalPagar,
        amortizationSchedule: rows.map((r) => ({
          month: r.num,
          date: r.fecha,
          capital: r.capital,
          interest: r.interes,
          quota: r.monto,
          balance: r.saldo,
        })),
        financialData: {
          tea: tea ?? 0,
          tcea: tcea ?? 0,
          comisionDesembolso: 0,
          seguroDesgravamen: 0,
          seguroMultiriesgo: 0,
          gastoNotarial: 0,
        },
        generatedDate: new Date(),
        primaryColor: isDark ? [0, 255, 213] : [0, 137, 122],
        logoUrl: `${ZONA_GAMER_ASSETS}/branding/logo-ofi.png`,
        darkMode: isDark,
      });
    } catch (e) {
      console.error('Error generando cronograma PDF:', e);
    } finally {
      setIsGeneratingCronoPDF(false);
    }
  }, [price, selectedTerm, monthlyQuota, productName, productBrand, tea, tcea, rows, totalPagar, isDark, isGeneratingCronoPDF, onTrackDownload]);

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 clamp(8px, 3vw, 24px)' }}>
      <div style={{ background: isDark ? T.bgCard : '#fff', borderRadius: 16, padding: 'clamp(16px, 4vw, 24px)', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 'clamp(16px, 4vw, 24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: cyanAlphaFn(isDark)(0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} style={{ color: T.neonCyan }} />
            </div>
            <div>
              <h3 style={{ fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 700, color: isDark ? '#fff' : '#171717', margin: 0 }}>Detalle de Cuotas</h3>
              <p style={{ fontSize: 14, color: isDark ? '#707070' : '#737373', margin: 0 }}>{selectedTerm} pagos mensuales</p>
            </div>
          </div>
        </div>

        {/* Empty state when backend doesn't provide TEA (we can't compute amortization without it) */}
        {rows.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', borderRadius: 12, border: `1px dashed ${isDark ? T.border : '#e5e7eb'}`, color: isDark ? '#a0a0a0' : '#737373' }}>
            <Info size={20} style={{ marginBottom: 8, color: T.neonCyan }} />
            <p style={{ fontSize: 14, margin: 0 }}>
              El cronograma detallado no está disponible para este producto.
            </p>
          </div>
        ) : (
        /* Table */
        <div style={{ overflowX: 'auto', borderRadius: 12, border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
          <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: isDark ? T.bgSurface : '#fafafa' }}>
                {['Cuota', 'Fecha', 'Capital', 'Interés', 'Comisión', 'Monto', 'Saldo'].map((h, i) => (
                  <th key={h} style={{ textAlign: i < 2 ? 'left' : 'right', padding: '12px', fontSize: 12, fontWeight: 600, color: isDark ? '#707070' : '#737373', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.num} style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f5f5f5'}` }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: row.isLast ? (isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7') : cyanAlphaFn(isDark)(0.1), color: row.isLast ? '#16a34a' : T.neonCyan }}>
                      {row.num}
                    </div>
                  </td>
                  <td style={{ padding: 12, fontSize: 14, color: isDark ? '#a0a0a0' : '#525252', textTransform: 'capitalize' }}>{row.fecha}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, color: isDark ? '#d4d4d4' : '#404040' }}>S/{row.capital}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, color: isDark ? '#707070' : '#737373' }}>S/{row.interes}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, color: isDark ? '#707070' : '#737373' }}>S/{row.comision}</td>
                  <td style={{ padding: 12, textAlign: 'right' }}><span style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#fff' : '#171717' }}>S/{row.monto}</span></td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, color: isDark ? '#a0a0a0' : '#525252' }}>S/{row.saldo.toLocaleString('es-PE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Toggle button */}
        {rows.length > 6 && (
          <button onClick={() => { const next = !expanded; setExpanded(next); onTrackExpand?.(next); }} style={{ width: '100%', marginTop: 16, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: T.neonCyan, background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'background 0.2s' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {expanded ? 'Ver menos' : 'Ver todo'}
          </button>
        )}

        {/* Footer: total + buttons */}
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button onClick={() => { setShowDetail(true); onTrackModal?.(true); }} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: `2px solid ${T.neonCyan}`, background: 'transparent', color: T.neonCyan, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            <Info size={16} />
            Ver detalle de pago
          </button>
          <button onClick={handleDownloadCronograma} disabled={isGeneratingCronoPDF} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: `2px solid ${isDark ? T.border : '#d4d4d4'}`, background: 'transparent', color: isDark ? '#d4d4d4' : '#404040', fontSize: 14, fontWeight: 500, cursor: isGeneratingCronoPDF ? 'not-allowed' : 'pointer', opacity: isGeneratingCronoPDF ? 0.6 : 1 }}>
            {isGeneratingCronoPDF ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isGeneratingCronoPDF ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>
      </div>

      {/* Modal: Detalle del Financiamiento */}
      {showDetail && <FinanciamientoModal T={T} isDark={isDark} price={price} monthlyQuota={monthlyQuota} selectedTerm={selectedTerm} totalPagar={totalPagar} tea={tea} tcea={tcea} commission={commission} onClose={() => { setShowDetail(false); onTrackModal?.(false); }} onDownloadPdf={handleDownloadCronograma} isDownloading={isGeneratingCronoPDF} />}
    </section>
  );
}

// ============================================
// Similar Products Section
// ============================================

// ============================================
// Accessories Carousel
// ============================================

function AccessoriesCarousel({ T, isDark, accessories, selectedTerm, onTrackView, onToggleFeedback }: { T: Theme; isDark: boolean; accessories: Accessory[]; selectedTerm: number; onTrackView?: (accessoryId: string, accessoryName: string) => void; onToggleFeedback?: (message: string, variant: 'success' | 'info') => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [accDetailId, setAccDetailId] = useState<string | null>(null);
  const { selectedAccessories, toggleAccessory } = useProduct();
  const selectedIds = useMemo(() => new Set(selectedAccessories.map((a) => a.id)), [selectedAccessories]);

  // Scroll lock + Escape when the accessory detail modal is open
  useEffect(() => {
    if (!accDetailId) return;
    const savedY = window.scrollY;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      overflow: document.body.style.overflow,
    };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAccDetailId(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.left = prev.left;
      document.body.style.right = prev.right;
      document.body.style.overflow = prev.overflow;
      window.scrollTo(0, savedY);
      window.removeEventListener('keydown', onKey);
    };
  }, [accDetailId]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = useCallback((dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 236, behavior: 'smooth' });
  }, []);

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 clamp(8px, 3vw, 24px)' }}>
      <div style={{ background: isDark ? T.bgCard : '#fff', borderRadius: 16, padding: 'clamp(16px, 4vw, 24px)', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(16px, 4vw, 24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${T.neonCyan}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Puzzle size={20} style={{ color: T.neonCyan }} />
            </div>
            <div>
              <h3 style={{ fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 700, color: isDark ? '#fff' : '#171717', margin: '0 0 4px' }}>Complementa tu equipo</h3>
              <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: isDark ? '#707070' : '#737373', margin: 0 }}>Accesorios disponibles con financiamiento</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => scroll(-1)} disabled={!canScrollLeft} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canScrollLeft ? 'pointer' : 'default', border: `1.5px solid ${canScrollLeft ? T.neonCyan : T.border}`, background: isDark ? T.bgSurface : '#fff', color: canScrollLeft ? T.neonCyan : (isDark ? '#555' : '#d4d4d4'), opacity: canScrollLeft ? 1 : 0.5, transition: 'all 0.2s' }}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll(1)} disabled={!canScrollRight} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canScrollRight ? 'pointer' : 'default', border: `1.5px solid ${canScrollRight ? T.neonCyan : T.border}`, background: isDark ? T.bgSurface : '#fff', color: canScrollRight ? T.neonCyan : (isDark ? '#555' : '#d4d4d4'), opacity: canScrollRight ? 1 : 0.5, transition: 'all 0.2s' }}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div ref={scrollRef} onScroll={updateScrollState} style={{ display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8, scrollbarWidth: 'none' }}>
          {accessories.map((acc) => {
            const isSelected = selectedIds.has(acc.id);
            const handleCardToggle = () => {
              const wasSelected = selectedIds.has(acc.id);
              toggleAccessory(acc);
              onToggleFeedback?.(
                wasSelected ? 'Accesorio quitado' : 'Se agregará al financiamiento de tu laptop',
                wasSelected ? 'info' : 'success',
              );
            };
            return (
            <div key={acc.id} style={{ width: 220, minWidth: 220, flexShrink: 0, scrollSnapAlign: 'start' }}>
              <div
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={handleCardToggle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardToggle();
                  }
                }}
                style={{
                  height: '100%', borderRadius: 14, overflow: 'hidden',
                  background: isDark ? T.bgSurface : '#fafafa',
                  border: `${isSelected ? 2 : 1}px solid ${isSelected ? T.neonCyan : (isDark ? T.border : '#e5e7eb')}`,
                  display: 'flex', flexDirection: 'column',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  boxShadow: isSelected
                    ? (isDark ? '0 0 0 3px rgba(0,255,213,0.12)' : '0 0 0 3px rgba(0,137,122,0.12)')
                    : 'none',
                }}
              >
                {/* Image */}
                <div style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
                  <Image
                    src={acc.image}
                    alt={acc.name}
                    width={100}
                    height={100}
                    style={{ objectFit: 'contain', maxHeight: 96, width: 'auto' }}
                  />
                </div>

                {/* Content */}
                <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Category */}
                  {acc.category?.name && (
                    <span style={{ fontSize: 10, color: T.neonCyan, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      {acc.category.name}
                    </span>
                  )}

                  {/* Name */}
                  <h4 style={{
                    fontSize: 13, fontWeight: 600, color: isDark ? '#f0f0f0' : '#333',
                    margin: '0 0 8px', minHeight: '2.4rem',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    fontFamily: "'Rajdhani', sans-serif",
                  }}>
                    {acc.name}
                  </h4>

                  {/* Spacer */}
                  <div style={{ flex: 1 }} />

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: T.neonCyan }}>
                      +S/{Math.round(acc.monthlyQuota)}
                    </span>
                    <span style={{ fontSize: 11, color: isDark ? '#555' : '#999' }}>/mes</span>
                  </div>
                  {acc.term && (
                    <span style={{ fontSize: 10, color: isDark ? '#555' : '#999' }}>en {acc.term} meses</span>
                  )}

                  {/* Action row: Ver detalles + Agregar */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {acc.description && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccDetailId(acc.id);
                          onTrackView?.(acc.id, acc.name);
                        }}
                        role="button"
                        tabIndex={0}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          fontSize: 11, color: T.neonCyan, background: isDark ? 'rgba(0,255,213,0.08)' : 'rgba(0,137,122,0.08)',
                          fontWeight: 500, padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                          transition: 'background 0.2s', fontFamily: "'Rajdhani', sans-serif",
                        }}
                      >
                        <Info size={12} />
                        Ver detalles
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardToggle();
                      }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: 11, fontWeight: 600,
                        color: isSelected ? (isDark ? '#0a0a0a' : '#fff') : T.neonCyan,
                        background: isSelected ? T.neonCyan : (isDark ? 'rgba(0,255,213,0.08)' : 'rgba(0,137,122,0.08)'),
                        border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                        transition: 'all 0.2s', fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {isSelected ? <><Check size={12} />Agregado</> : <><Plus size={12} />Agregar</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Mobile hint */}
        <p className="md:hidden" style={{ textAlign: 'center', fontSize: 12, color: isDark ? '#555' : '#999', marginTop: 4 }}>
          Desliza para ver más
        </p>
      </div>

      {/* Accessory Detail Modal */}
      {accDetailId && (() => {
        const acc = accessories.find((a) => a.id === accDetailId);
        if (!acc) return null;
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setAccDetailId(null)}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 50, width: '100%', maxWidth: 448, maxHeight: 'calc(100svh - 8rem)', display: 'flex', flexDirection: 'column', background: isDark ? T.bgCard : '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: `1px solid ${T.border}` }}>
              {/* Header */}
              <div style={{
                background: isDark ? '#1e1e1e' : '#f5f5f5',
                borderBottom: `1px solid ${T.border}`,
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? 'rgba(0,255,213,0.12)' : 'rgba(0,137,122,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={20} style={{ color: T.neonCyan }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name}</h2>
                  <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{acc.category?.name || acc.brand?.name || 'Accesorio'}</p>
                </div>
                <button onClick={() => setAccDetailId(null)} aria-label="Cerrar detalle del accesorio" style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={16} style={{ color: T.textSecondary }} />
                </button>
              </div>
              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                  <Image src={acc.image} alt={acc.name} width={112} height={112} style={{ objectFit: 'contain', maxHeight: 112 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center' }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: T.neonCyan, fontFamily: "'Rajdhani', sans-serif" }}>+S/{Math.round(acc.monthlyQuota)}</span>
                  <span style={{ fontSize: 14, color: T.textMuted }}>/mes</span>
                </div>
                {acc.price > 0 && (
                  <p style={{ textAlign: 'center', fontSize: 12, color: T.textMuted, margin: 0 }}>Precio: S/{Math.round(acc.price)} {acc.term ? `en ${acc.term} cuotas` : ''}</p>
                )}
                {acc.description && (
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: T.textSecondary, whiteSpace: 'pre-line' }}>
                    {acc.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}

// ============================================
// Similar Products Section
// ============================================

function SimilarProductsSection({
  T,
  isDark,
  similarProducts,
  currentQuota,
  landing,
  allowMultiProduct = false,
  onAddToCart,
  isInCart,
  onTrackClick,
  onTrackAddToCart,
}: {
  T: Theme;
  isDark: boolean;
  similarProducts: SimilarProduct[];
  currentQuota: number;
  landing: string;
  allowMultiProduct?: boolean;
  onAddToCart?: (item: CartItem) => void;
  isInCart?: (id: string) => boolean;
  onTrackClick?: (targetId: string, position: number) => void;
  onTrackAddToCart?: (targetId: string) => void;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Similares vienen directo del backend (data.similarProducts)
  const products = similarProducts;
  // Per-product selected image index
  const [imgIdx, setImgIdx] = useState<Record<string, number>>({});
  // Modal state for multi-product cart selection
  const [modalProd, setModalProd] = useState<(SimilarProduct & { __position?: number }) | null>(null);

  // Scroll lock + Escape when the cart-selection modal is open
  useEffect(() => {
    if (!modalProd) return;
    const savedY = window.scrollY;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      overflow: document.body.style.overflow,
    };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalProd(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.left = prev.left;
      document.body.style.right = prev.right;
      document.body.style.overflow = prev.overflow;
      window.scrollTo(0, savedY);
      window.removeEventListener('keydown', onKey);
    };
  }, [modalProd]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = useCallback((dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 316, behavior: 'smooth' });
  }, []);

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 clamp(8px, 3vw, 24px)' }}>
      <div style={{ background: isDark ? T.bgCard : '#fff', borderRadius: 16, padding: 'clamp(16px, 4vw, 24px)', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(16px, 4vw, 24px)' }}>
          <div>
            <h3 style={{ fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 700, color: isDark ? '#fff' : '#171717', margin: '0 0 4px' }}>También te puede interesar</h3>
            <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: isDark ? '#707070' : '#737373', margin: 0 }}>Desliza para explorar más opciones</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => scroll(-1)} disabled={!canScrollLeft} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canScrollLeft ? 'pointer' : 'default', border: `1.5px solid ${canScrollLeft ? T.neonCyan : T.border}`, background: isDark ? T.bgSurface : '#fff', color: canScrollLeft ? T.neonCyan : (isDark ? '#555' : '#d4d4d4'), opacity: canScrollLeft ? 1 : 0.5, transition: 'all 0.2s' }}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll(1)} disabled={!canScrollRight} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canScrollRight ? 'pointer' : 'default', border: `1.5px solid ${canScrollRight ? T.neonCyan : T.border}`, background: isDark ? T.bgSurface : '#fff', color: canScrollRight ? T.neonCyan : (isDark ? '#555' : '#d4d4d4'), opacity: canScrollRight ? 1 : 0.5, transition: 'all 0.2s' }}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div ref={scrollRef} onScroll={updateScrollState} style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 24, scrollbarWidth: 'none' }}>
          {products.map((prod, position) => {
            // quotaDifference viene del backend; si no, calculamos vs la cuota actual
            const diff = prod.quotaDifference != null ? prod.quotaDifference : Math.round(prod.monthlyQuota) - Math.round(currentQuota);
            const isCheaper = diff < 0;
            const displayName = prod.displayName || prod.name;
            const diffTags = prod.differentiators?.filter((d) => d.toLowerCase() !== prod.brand.toLowerCase()).slice(0, 3) || [];
            const imageUrls = prod.images && prod.images.length > 0 ? prod.images.map((img) => img.url) : [prod.thumbnail];
            const currentImg = imageUrls[imgIdx[prod.id] || 0] || prod.thumbnail;
            // Navigate + emit trackSimilarProductClick once per navigation trigger.
            const goToDetail = () => {
              onTrackClick?.(prod.id, position);
              router.push(routes.producto(landing, prod.slug));
            };
            return (
              <div key={prod.id} style={{ width: 300, minWidth: 300, flexShrink: 0, scrollSnapAlign: 'start' }}>
                <div style={{ height: '100%', borderRadius: 16, overflow: 'hidden', background: isDark ? T.bgSurface : '#fff', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}>
                  {/* Image */}
                  <div style={{ position: 'relative', padding: 16, background: isDark ? 'linear-gradient(to bottom, #1e1e1e, #1a1a1a)' : 'linear-gradient(to bottom, #fafafa, #fff)' }}>
                    <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: 12, marginBottom: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={currentImg || prod.thumbnail} alt={displayName} className="w-full h-full object-contain" onError={(e) => { const el = e.target as HTMLImageElement; if (el.src !== prod.thumbnail) { el.src = prod.thumbnail; } }} />
                    </div>
                    <p style={{ fontSize: 10, color: isDark ? '#555' : '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', marginBottom: 8 }}>Imagen referencial</p>
                    {/* Mini thumbnails */}
                    {imageUrls.length > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                        {imageUrls.map((imgUrl, idx) => {
                          const sel = (imgIdx[prod.id] || 0) === idx;
                          return (
                            <button key={idx} onClick={() => setImgIdx((prev) => ({ ...prev, [prod.id]: idx }))} style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', border: `2px solid ${sel ? T.neonCyan : (isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb')}`, cursor: 'pointer', padding: 2, background: isDark ? T.bgSurface : '#fff', opacity: sel ? 1 : 0.6, transition: 'all 0.2s' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={imgUrl} alt={`${displayName} ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {/* Match badge — solo si el backend lo trae */}
                    {prod.matchScore > 0 && (
                      <div style={{ position: 'absolute', top: 12, left: 12, padding: '6px 12px', background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.neonCyan }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#fff' : '#171717' }}>{prod.matchScore}% match</span>
                      </div>
                    )}
                    {/* Price diff badge */}
                    <div style={{ position: 'absolute', top: 12, right: 12, padding: '6px 12px', borderRadius: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 4, background: isCheaper ? '#10b981' : T.neonPurple, color: '#fff' }}>
                      {isCheaper ? <TrendingUp size={14} style={{ transform: 'scaleY(-1)' }} /> : <TrendingUp size={14} />}
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{isCheaper ? '-' : '+'}S/{Math.abs(diff)}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{ fontSize: 12, color: T.neonCyan, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{prod.brand}</p>
                    <h3 title={displayName} style={{ fontWeight: 700, color: isDark ? '#fff' : '#262626', fontSize: 18, marginBottom: 12, minHeight: '3.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', cursor: 'pointer' }} onClick={goToDetail}>{displayName}</h3>

                    {/* Differentiator tags */}
                    {diffTags.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        {diffTags.map((tag, idx) => (
                          <span key={idx} style={{ padding: '4px 10px', background: isDark ? 'rgba(0,255,213,0.08)' : 'rgba(99,102,241,0.1)', color: T.neonCyan, fontSize: 12, fontWeight: 500, borderRadius: 999 }}>{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Quota box */}
                    <div style={{ borderRadius: 16, padding: '16px 24px', marginBottom: 12, background: isCheaper ? (isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)') : (isDark ? 'rgba(0,255,213,0.04)' : 'rgba(70,84,205,0.05)') }}>
                      <p style={{ fontSize: 12, color: isDark ? '#707070' : '#737373', marginBottom: 4 }}>Cuota mensual</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                        <span style={{ fontSize: 30, fontWeight: 900, color: isCheaper ? '#10b981' : T.neonCyan }}>S/{Math.round(prod.monthlyQuota)}</span>
                        <span style={{ fontSize: 16, color: isDark ? '#555' : '#a3a3a3' }}>/mes</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, marginTop: 4, color: isCheaper ? '#10b981' : T.neonPurple }}>
                        {isCheaper ? <TrendingUp size={12} style={{ transform: 'scaleY(-1)' }} /> : <TrendingUp size={12} />}
                        <span>vs S/{Math.round(currentQuota)}/mes actual</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, minHeight: 16 }} />

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={goToDetail} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: `2px solid ${T.neonCyan}`, background: 'transparent', color: T.neonCyan, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Eye size={18} className="hidden md:block" />
                        Detalle
                      </button>
                      <button
                        onClick={() => {
                          if (allowMultiProduct && isInCart?.(prod.id)) return;
                          if (allowMultiProduct && onAddToCart) {
                            setModalProd({ ...prod, __position: position });
                          } else {
                            // Single mode: navigate to product detail so user can configure term/initial
                            goToDetail();
                          }
                        }}
                        className="btn-loquiero-detalle"
                        style={{
                          flex: 1, padding: '12px 0', fontWeight: 700, fontSize: 14,
                          ...(allowMultiProduct && isInCart?.(prod.id) ? {
                            background: isDark ? '#1a3a35' : '#e6faf7',
                            border: `2px solid ${T.neonCyan}60`,
                            color: T.neonCyan,
                          } : {}),
                        }}
                      >
                        {allowMultiProduct && isInCart?.(prod.id) ? '✓ En carrito' : isCheaper ? 'Ahorrar' : 'Lo quiero'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile hint */}
        <p className="md:hidden" style={{ textAlign: 'center', fontSize: 12, color: isDark ? '#555' : '#a3a3a3', marginTop: 0 }}>Desliza para ver más →</p>
      </div>

      {/* Cart selection modal for multi-product */}
      {allowMultiProduct && modalProd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModalProd(null)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 50, width: '100%', maxWidth: 400, background: isDark ? T.bgCard : '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: `1px solid ${T.border}` }}>
            {/* Product preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: isDark ? '#1e1e1e' : '#f5f5f5', borderBottom: `1px solid ${T.border}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={modalProd.thumbnail} alt={modalProd.displayName} style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 8, background: isDark ? T.bgSurface : '#fff', border: `1px solid ${T.border}` }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, color: T.neonCyan, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>{modalProd.brand}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{modalProd.displayName}</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: T.neonCyan, margin: 0 }}>S/{Math.round(modalProd.monthlyQuota)}/mes</p>
              </div>
              <button onClick={() => setModalProd(null)} aria-label="Cerrar" style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <X size={16} style={{ color: T.textSecondary }} />
              </button>
            </div>
            {/* Options */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => {
                  onTrackClick?.(modalProd.id, modalProd.__position ?? 0);
                  router.push(routes.producto(landing, modalProd.slug));
                  setModalProd(null);
                }}
                style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${T.neonCyan}`, background: 'transparent', color: T.neonCyan, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <Eye size={20} />
                <div style={{ textAlign: 'left' }}>
                  <div>Solicitar equipo</div>
                  <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>Iniciar proceso de solicitud</div>
                </div>
              </button>
              <button
                onClick={() => {
                  if (onAddToCart) {
                    onAddToCart({
                      productId: modalProd.id,
                      slug: modalProd.slug,
                      name: modalProd.displayName || modalProd.name,
                      shortName: modalProd.name,
                      brand: modalProd.brand,
                      image: modalProd.thumbnail,
                      price: Math.floor(modalProd.monthlyQuota * 24),
                      months: 24 as TermMonths,
                      initialPercent: 0,
                      initialAmount: 0,
                      monthlyPayment: modalProd.monthlyQuota,
                      addedAt: Date.now(),
                    });
                    onTrackAddToCart?.(modalProd.id);
                  }
                  setModalProd(null);
                }}
                className="btn-loquiero-detalle"
                style={{ width: '100%', padding: '14px 16px', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-start' }}
              >
                <Plus size={20} />
                <div style={{ textAlign: 'left' }}>
                  <div>Agregar al carrito</div>
                  <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>Seguir comparando equipos</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ============================================
// Spec Card
// ============================================

function SpecCard({ spec }: { spec: ProductSpec }) {
  const icon = SPEC_ICONS[spec.category.toLowerCase()] || <Cpu size={20} />;
  return (
    <div className="spec-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div className="spec-card-icon">{icon}</div>
        <span className="spec-card-title">{spec.category}</span>
      </div>
      <div className="spec-card-divider" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {spec.specs.map((item, i) => (
          <div key={i} className="spec-row">
            <span className="spec-row-label" title={item.tooltip || undefined} style={item.tooltip ? { cursor: 'help', borderBottom: '1px dotted currentColor' } : undefined}>{item.label}</span>
            <span className={`spec-row-value${item.highlight ? ' primary' : ''}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
