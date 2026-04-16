'use client';

/**
 * Product Detail Client v0.6
 * Fetches product data from API with fallback to mock data
 */

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { CubeGridSpinner, useScrollToTop, Toast, useToast } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { getAllowMultiProduct } from '@/app/prototipos/0.6/utils/featureFlags';

// Hero components (Navbar & Footer)
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { ConvenioFooter } from '@/app/prototipos/0.6/components/hero/convenio';

// Secondary Navbar with search, wishlist, cart
import { CatalogSecondaryNavbar } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/CatalogSecondaryNavbar';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useCatalogSharedState } from '@/app/prototipos/0.6/[landing]/catalogo/hooks/useCatalogSharedState';
import { fetchProductsByIds } from '@/app/prototipos/0.6/services/catalogApi';

// Drawers for mobile
import { CartDrawer } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/CartDrawer';
import { SearchDrawer } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/SearchDrawer';
import { WishlistDrawer } from '@/app/prototipos/0.6/[landing]/catalogo/components/wishlist/WishlistDrawer';
import type { CatalogProduct, CartItem, WishlistItem, TermMonths } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';

// Layout context for shared data
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

// Product context for solicitar flow
import { useProduct, ProductProvider } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';

// Import ProductDetail component and API
import { ProductDetail } from '../components/detail/ProductDetail';
import { fetchProductDetail, ProductDetailResult } from '../api/productDetailApi';
import {
  DetalleConfig,
  DeviceType,
  CronogramaVersion,
  defaultDetalleConfig,
} from '../types/detail';
import { fetchLandingConfig } from '@/app/prototipos/0.6/services/landingConfigApi';
import { DEFAULT_LANDING_CONFIG, type LandingConfig } from '@/app/prototipos/0.6/types/landingConfig';

function ProductDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  // Catch-all route: slug es un array
  const slugArray = params.slug as string[];
  const slug = slugArray?.[0] || '';
  const landing = (params.landing as string) || 'home';

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, agreementData, isLoading: isLayoutLoading, hasError: hasLayoutError, settings } = useLayout();
  const ALLOW_MULTI_PRODUCT = getAllowMultiProduct(settings);
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  // Product context for solicitar flow
  const { setSelectedProduct, setCartProducts: setContextCartProducts } = useProduct();

  // Scroll to top on page load
  useScrollToTop();

  const [isPageLoading, setIsPageLoading] = useState(true);

  // Landing config (for features like show_platform_commission)
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);
  useEffect(() => {
    fetchLandingConfig(landing).then(setLandingConfig);
  }, [landing]);

  // API data state
  const [apiData, setApiData] = useState<ProductDetailResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(true);

  // Shared state for catalog (wishlist, cart)
  const catalogState = useCatalogSharedState(landing, previewKey);
  const tracker = useEventTrackerOptional();
  const [searchQuery, setSearchQuery] = useState('');

  // Toast for feedback
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast(4000);

  // Add to cart with toast feedback
  // v0.6.1: Accept CartItem with variant info - always requires CartItem
  const handleAddToCart = useCallback((cartItem: CartItem) => {
    if (!catalogState.isInCart(cartItem.productId)) {
      catalogState.addToCart(cartItem);
      showToast('Producto añadido al carrito', 'success');
    }
  }, [catalogState, showToast]);

  // Toggle wishlist with toast feedback
  const handleToggleWishlist = useCallback((wishlistItem: WishlistItem) => {
    const wasInWishlist = catalogState.isInWishlist(wishlistItem.productId);
    catalogState.toggleWishlist(wishlistItem);
    showToast(
      wasInWishlist ? 'Eliminado de favoritos' : 'Agregado a favoritos',
      wasInWishlist ? 'info' : 'success'
    );
  }, [catalogState, showToast]);

  // Drawer states for mobile
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Products for wishlist and cart display (fetched from API)
  const [wishlistProducts, setWishlistProducts] = useState<CatalogProduct[]>([]);
  const [cartProducts, setCartProducts] = useState<CatalogProduct[]>([]);

  // Fetch wishlist products from API
  // v0.6.1: Use wishlistIds (string[]) for API fetch
  useEffect(() => {
    if (catalogState.isHydrated && catalogState.wishlistIds.length > 0) {
      fetchProductsByIds(landing, catalogState.wishlistIds, previewKey).then(setWishlistProducts);
    } else {
      setWishlistProducts([]);
    }
  }, [catalogState.wishlistIds, catalogState.isHydrated, landing, previewKey]);

  // Fetch cart products from API
  // v0.6.1: Use cartIds (string[]) for API fetch
  useEffect(() => {
    if (catalogState.isHydrated && catalogState.cartIds.length > 0) {
      fetchProductsByIds(landing, catalogState.cartIds, previewKey).then(setCartProducts);
    } else {
      setCartProducts([]);
    }
  }, [catalogState.cartIds, catalogState.isHydrated, landing, previewKey]);

  // Handle cart continue - save products to context before navigating
  // v0.6.2: Use catalogState.cart (CartItem[]) to preserve user's pricing config
  const handleCartContinue = useCallback(() => {
    if (catalogState.cart.length === 0) return;

    // Transform CartItem[] to SelectedProduct[] format for solicitar context
    // This preserves the user's selected months, initialPercent, and monthlyPayment
    const productsForContext = catalogState.cart.map((cartItem) => ({
      id: cartItem.productId,
      slug: cartItem.slug,  // For API calls when fetching payment plans
      name: cartItem.name,
      shortName: cartItem.shortName,
      brand: cartItem.brand,
      price: cartItem.price,
      monthlyPayment: cartItem.monthlyPayment,  // User's selected config
      months: cartItem.months,                   // User's selected config
      initialPercent: cartItem.initialPercent,   // User's selected config
      initialAmount: cartItem.initialAmount,     // User's selected config
      image: cartItem.image,
      type: cartItem.type,  // Product type for accessory compatibility (no fallback)
      variantId: cartItem.variantId,
      colorName: cartItem.colorName,
      colorHex: cartItem.colorHex,
      specs: cartItem.specs,
      // Payment plans for term standardization
      paymentPlans: cartItem.paymentPlans,
    }));

    // Set all products to cart context
    setContextCartProducts(productsForContext);

    // Also set the first product as selectedProduct for backwards compatibility
    setSelectedProduct(productsForContext[0]);

    // Navigate to solicitar
    router.push(routes.solicitar(landing));
  }, [catalogState.cart, router, setContextCartProducts, setSelectedProduct, landing]);

  const hasCatalog = landingConfig.layout.has_catalog;

  // Build catalog URL helper (falls back to landing home if no catalog)
  const getCatalogUrl = (queryParams?: Record<string, string>) => {
    if (!hasCatalog) return routes.landingHome(landing);
    const urlParams = new URLSearchParams();
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => urlParams.set(key, value));
    }
    const queryString = urlParams.toString();
    return routes.catalogo(landing, queryString || undefined);
  };

  // Build product detail URL with optional pricing params
  const getDetailUrl = (productSlug: string, params?: { term?: number; initial?: number }) => {
    const base = routes.producto(landing, productSlug);
    if (!params) return base;
    const searchParams = new URLSearchParams();
    if (params.term != null) searchParams.set('term', String(params.term));
    if (params.initial != null) searchParams.set('initial', String(params.initial));
    const qs = searchParams.toString();
    return qs ? `${base}?${qs}` : base;
  };

  // Config state - read from URL params
  const [config, setConfig] = useState<DetalleConfig>(() => {
    const deviceParam = searchParams.get('device');
    const cronogramaParam = searchParams.get('cronograma');

    const validDevices: DeviceType[] = ['laptop', 'tablet', 'celular'];
    const validCronogramaVersions: CronogramaVersion[] = [1, 2, 3];

    const deviceType = deviceParam && validDevices.includes(deviceParam as DeviceType)
      ? (deviceParam as DeviceType)
      : defaultDetalleConfig.deviceType;

    const cronogramaVersion = cronogramaParam && validCronogramaVersions.includes(parseInt(cronogramaParam) as CronogramaVersion)
      ? (parseInt(cronogramaParam) as CronogramaVersion)
      : defaultDetalleConfig.cronogramaVersion;

    return { deviceType, cronogramaVersion };
  });

  // Read pricing defaults from URL params (passed from catalog card)
  const defaultTerm = (() => {
    const termParam = searchParams.get('term');
    if (!termParam) return undefined;
    const parsed = parseInt(termParam);
    return isNaN(parsed) ? undefined : parsed;
  })();

  const defaultInitialPercent = (() => {
    const initialParam = searchParams.get('initial');
    if (!initialParam) return undefined;
    const parsed = parseInt(initialParam);
    return isNaN(parsed) ? undefined : parsed;
  })();

  // Fetch product data from API (NO fallback to mock data)
  useEffect(() => {
    async function loadProductData() {
      if (!slug) {
        setApiError('No se especificó un producto');
        setIsApiLoading(false);
        return;
      }

      setIsApiLoading(true);
      setApiError(null);

      try {
        const data = await fetchProductDetail(landing, slug);
        if (data) {
          setApiData(data);
          tracker?.track('product_view', {
            product_id: data.product.id,
            product_name: data.product.name,
            brand: data.product.brand,
            slug,
          });
        } else {
          setApiError(`Producto "${slug}" no disponible`);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setApiError(`Error al cargar el producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      } finally {
        setIsApiLoading(false);
      }
    }

    loadProductData();
  }, [landing, slug]);

  // Preloading: dar tiempo a la página para cargar recursos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while page preloads, layout data or API data is loading
  if (isPageLoading || isLayoutLoading || isApiLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  // Show 404 if product not found (NO fallback to mock)
  if (apiError || !apiData) {
    return (
      <NotFoundContent
        homeUrl={hasCatalog ? routes.catalogo(landing) : routes.landingHome(landing)}
        homeLabel={hasCatalog ? 'Ir al catálogo' : 'Volver al inicio'}
      />
    );
  }

  const isAvailable = apiData.isAvailable;

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-hidden">
      {/* Navbar from Hero */}
      <Navbar
        landing={landing}
        promoBannerData={navbarProps?.promoBannerData}
        logoUrl={navbarProps?.logoUrl}
        customerPortalUrl={navbarProps?.customerPortalUrl}
        portalButtonText={navbarProps?.portalButtonText}
        navbarItems={navbarProps?.navbarItems}
        megamenuItems={navbarProps?.megamenuItems}
        activeSections={navbarProps?.activeSections || []}
        institutionLogo={navbarProps?.institutionLogo}
        institutionName={navbarProps?.institutionName}
      />

      {/* Secondary Navbar with Search, Wishlist, Cart */}
      <CatalogSecondaryNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={() => setSearchQuery('')}
        onSearchSubmit={() => {
          if (searchQuery.trim()) {
            router.push(getCatalogUrl({ search: searchQuery }));
          }
        }}
        wishlistItems={catalogState.wishlist}
        onWishlistRemove={catalogState.removeFromWishlist}
        onWishlistClear={catalogState.clearWishlist}
        onWishlistViewProduct={(productId) => {
          const item = catalogState.wishlist.find((w) => w.productId === productId);
          if (item?.slug) {
            router.push(getDetailUrl(item.slug, { term: item.months, initial: item.initialPercent }));
          } else {
            const product = wishlistProducts.find((p) => p.id === productId);
            if (product) {
              router.push(getDetailUrl(product.slug));
            }
          }
        }}
        cartItems={catalogState.cart}
        onCartRemove={catalogState.removeFromCart}
        onCartClear={catalogState.clearCart}
        onCartContinue={handleCartContinue}
        onCartViewProduct={(productId) => {
          const item = catalogState.cart.find((c) => c.productId === productId);
          if (item?.slug) {
            router.push(getDetailUrl(item.slug, { term: item.months, initial: item.initialPercent }));
          }
        }}
        onMobileSearchClick={() => setIsSearchDrawerOpen(true)}
        onMobileWishlistClick={() => setIsWishlistDrawerOpen(true)}
        onMobileCartClick={() => setIsCartDrawerOpen(true)}
        unavailableCartIds={catalogState.unavailableCartIds}
        unavailableWishlistIds={catalogState.unavailableWishlistIds}
        showCart={ALLOW_MULTI_PRODUCT}
      />

      {/* Main Content — padding-top driven by CSS variables exposed by Navbar
          and CatalogSecondaryNavbar so it adapts to preview banner + promo
          banner + main navbar + secondary navbar dynamically. */}
      <main
        style={{
          paddingTop: 'calc(var(--header-total-height, 6.5rem) + var(--catalog-secondary-height, 3.5rem))',
        }}
      >
        <ProductDetail
          product={apiData.product}
          combo={apiData.combo}
          paymentPlans={apiData.paymentPlans}
          similarProducts={apiData.similarProducts}
          limitations={apiData.limitations}
          certifications={apiData.certifications}
          deviceType={config.deviceType}
          cronogramaVersion={config.cronogramaVersion}
          isAvailable={isAvailable}
          defaultTerm={defaultTerm}
          defaultInitialPercent={defaultInitialPercent}
          paymentFrequencies={apiData.paymentFrequencies}
          showPlatformCommission={landingConfig.features.show_platform_commission}
          onAddToCart={isAvailable && ALLOW_MULTI_PRODUCT ? handleAddToCart : undefined}
          onRemoveFromCart={isAvailable && ALLOW_MULTI_PRODUCT ? catalogState.removeFromCart : undefined}
          onUpdateCart={isAvailable && ALLOW_MULTI_PRODUCT ? catalogState.updateCartItem : undefined}
          cartItem={isAvailable && ALLOW_MULTI_PRODUCT ? catalogState.getCartItem(apiData.product.id) : undefined}
          isInCart={isAvailable && ALLOW_MULTI_PRODUCT ? catalogState.isInCart(apiData.product.id) : false}
          onToggleWishlist={isAvailable ? handleToggleWishlist : undefined}
          isInWishlist={isAvailable ? catalogState.isInWishlist(apiData.product.id) : false}
          onSimilarAddToCart={ALLOW_MULTI_PRODUCT ? (similarProduct) => {
            // Similar products are independent — always allow add-to-cart
            const estimatedPrice = Math.floor(similarProduct.monthlyQuota * 24);
            const cartItem: CartItem = {
              productId: similarProduct.id,
              slug: similarProduct.slug,
              name: similarProduct.displayName,
              shortName: similarProduct.name,
              brand: similarProduct.brand,
              image: similarProduct.thumbnail,
              price: estimatedPrice,
              months: 24 as TermMonths, // Fallback — SimilarProduct no trae maxTermMonths
              initialPercent: 0,
              initialAmount: 0,
              monthlyPayment: similarProduct.monthlyQuota,
              addedAt: Date.now(),
              specs: similarProduct.specs ? {
                processor: similarProduct.specs.processor || '',
                ram: similarProduct.specs.ram || '',
                storage: similarProduct.specs.storage || '',
              } : undefined,
            };
            handleAddToCart(cartItem);
          } : undefined}
          cartItems={ALLOW_MULTI_PRODUCT ? catalogState.cartIds : []}
        />
      </main>

      {/* Footer from Hero */}
      {agreementData ? <ConvenioFooter data={footerData} agreementData={agreementData} landing={landing} /> : <Footer data={footerData} landing={landing} />}

      {/* Mobile Drawers */}
      <SearchDrawer
        isOpen={isSearchDrawerOpen}
        onClose={() => setIsSearchDrawerOpen(false)}
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        onSubmit={() => {
          if (searchQuery.trim()) {
            router.push(getCatalogUrl({ search: searchQuery }));
          }
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistDrawerOpen}
        onClose={() => setIsWishlistDrawerOpen(false)}
        products={catalogState.wishlist}
        onRemoveProduct={catalogState.removeFromWishlist}
        onClearAll={catalogState.clearWishlist}
        onViewProduct={(productId) => {
          setIsWishlistDrawerOpen(false);
          const item = catalogState.wishlist.find((w) => w.productId === productId);
          if (item?.slug) {
            router.push(getDetailUrl(item.slug, { term: item.months, initial: item.initialPercent }));
          } else {
            const product = wishlistProducts.find((p) => p.id === productId);
            if (product) {
              router.push(getDetailUrl(product.slug));
            }
          }
        }}
        unavailableIds={catalogState.unavailableWishlistIds}
      />

      {ALLOW_MULTI_PRODUCT && (
        <CartDrawer
          isOpen={isCartDrawerOpen}
          onClose={() => setIsCartDrawerOpen(false)}
          items={catalogState.cart}
          onRemoveItem={catalogState.removeFromCart}
          onClearAll={() => {
            catalogState.clearCart();
            setIsCartDrawerOpen(false);
          }}
          onContinue={() => {
            setIsCartDrawerOpen(false);
            handleCartContinue();
          }}
          onViewProduct={(productId) => {
            setIsCartDrawerOpen(false);
            const item = catalogState.cart.find((c) => c.productId === productId);
            if (item?.slug) {
              router.push(getDetailUrl(item.slug, { term: item.months, initial: item.initialPercent }));
            }
          }}
          unavailableIds={catalogState.unavailableCartIds}
        />
      )}

      {/* Toast para feedback de carrito */}
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
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export function ProductDetailClient() {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  return (
    <ProductProvider landingSlug={landing}>
      <Suspense fallback={<LoadingFallback />}>
        <ProductDetailContent />
      </Suspense>
    </ProductProvider>
  );
}

export default ProductDetailClient;
