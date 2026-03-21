'use client';

/**
 * Product Detail Client v0.6
 * Fetches product data from API with fallback to mock data
 */

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { CubeGridSpinner, useScrollToTop, Toast, useToast } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';

// Hero components (Navbar & Footer)
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { PreviewBanner } from '@/app/prototipos/0.6/components/PreviewBanner';

// Secondary Navbar with search, wishlist, cart
import { CatalogSecondaryNavbar } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/CatalogSecondaryNavbar';
import { useCatalogSharedState } from '@/app/prototipos/0.6/[landing]/catalogo/hooks/useCatalogSharedState';
import { fetchProductsByIds } from '@/app/prototipos/0.6/services/catalogApi';

// Drawers for mobile
import { CartDrawer } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/CartDrawer';
import { SearchDrawer } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/SearchDrawer';
import { WishlistDrawer } from '@/app/prototipos/0.6/[landing]/catalogo/components/wishlist/WishlistDrawer';
import type { CatalogProduct, CartItem } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';

// Layout context for shared data
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

// Product context for solicitar flow
import { useProduct, ProductProvider } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

// Import ProductDetail component and API
import { ProductDetail } from '../components/detail/ProductDetail';
import { fetchProductDetail, ProductDetailResult } from '../api/productDetailApi';
import {
  DetalleConfig,
  DeviceType,
  CronogramaVersion,
  defaultDetalleConfig,
} from '../types/detail';

// Fixed config for quota calculation (same as CatalogoClient)
const WIZARD_SELECTED_TERM = 24;

function ProductDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  // Catch-all route: slug es un array
  const slugArray = params.slug as string[];
  const slug = slugArray?.[0] || '';
  const landing = (params.landing as string) || 'home';

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  // Product context for solicitar flow
  const { setSelectedProduct, setCartProducts: setContextCartProducts } = useProduct();

  // Scroll to top on page load
  useScrollToTop();

  const [isPageLoading, setIsPageLoading] = useState(true);

  // API data state
  const [apiData, setApiData] = useState<ProductDetailResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(true);

  // Shared state for catalog (wishlist, cart)
  const catalogState = useCatalogSharedState(landing);
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
      fetchProductsByIds(landing, catalogState.wishlistIds).then(setWishlistProducts);
    } else {
      setWishlistProducts([]);
    }
  }, [catalogState.wishlistIds, catalogState.isHydrated, landing]);

  // Fetch cart products from API
  // v0.6.1: Use cartIds (string[]) for API fetch
  useEffect(() => {
    if (catalogState.isHydrated && catalogState.cartIds.length > 0) {
      fetchProductsByIds(landing, catalogState.cartIds).then(setCartProducts);
    } else {
      setCartProducts([]);
    }
  }, [catalogState.cartIds, catalogState.isHydrated, landing]);

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
    router.push(`/prototipos/0.6/${landing}/solicitar`);
  }, [catalogState.cart, router, setContextCartProducts, setSelectedProduct, landing]);

  // Build catalog URL helper
  const getCatalogUrl = (queryParams?: Record<string, string>) => {
    const urlParams = new URLSearchParams();
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => urlParams.set(key, value));
    }
    const queryString = urlParams.toString();
    return `/prototipos/0.6/${landing}/catalogo${queryString ? `?${queryString}` : ''}`;
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
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  // Show 404 if product not found (NO fallback to mock)
  if (apiError || !apiData) {
    return (
      <NotFoundContent
        homeUrl={`/prototipos/0.6/${landing}/catalogo`}
        homeLabel="Ir al catálogo"
      />
    );
  }

  const isAvailable = apiData.isAvailable;

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-hidden">
      {/* Preview Banner - shows when navigating from /preview with preview_key */}
      <PreviewBanner landingSlug={landing} pageName="Detalle del Producto" />

      {/* Navbar from Hero */}
      <Navbar
        landing={landing}
        promoBannerData={navbarProps?.promoBannerData}
        logoUrl={navbarProps?.logoUrl}
        customerPortalUrl={navbarProps?.customerPortalUrl}
        navbarItems={navbarProps?.navbarItems}
        megamenuItems={navbarProps?.megamenuItems}
        activeSections={['convenios', 'como-funciona', 'faq', 'testimonios']}
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
          const product = wishlistProducts.find((p) => p.id === productId);
          if (product) {
            router.push(`/prototipos/0.6/${landing}/producto/${product.slug}`);
          }
        }}
        cartItems={catalogState.cart}
        onCartRemove={catalogState.removeFromCart}
        onCartClear={catalogState.clearCart}
        onCartContinue={handleCartContinue}
        onMobileSearchClick={() => setIsSearchDrawerOpen(true)}
        onMobileWishlistClick={() => setIsWishlistDrawerOpen(true)}
        onMobileCartClick={() => setIsCartDrawerOpen(true)}
        unavailableCartIds={catalogState.unavailableCartIds}
        unavailableWishlistIds={catalogState.unavailableWishlistIds}
      />

      {/* Main Content with padding for fixed navbars (promo + primary + secondary) */}
      <main className="pt-40">
        <ProductDetail
          product={apiData.product}
          paymentPlans={apiData.paymentPlans}
          similarProducts={apiData.similarProducts}
          limitations={apiData.limitations}
          certifications={apiData.certifications}
          deviceType={config.deviceType}
          cronogramaVersion={config.cronogramaVersion}
          isAvailable={isAvailable}
          defaultTerm={defaultTerm}
          defaultInitialPercent={defaultInitialPercent}
          onAddToCart={isAvailable ? handleAddToCart : undefined}
          onRemoveFromCart={isAvailable ? catalogState.removeFromCart : undefined}
          onUpdateCart={isAvailable ? catalogState.updateCartItem : undefined}
          cartItem={isAvailable ? catalogState.getCartItem(apiData.product.id) : undefined}
          isInCart={isAvailable ? catalogState.isInCart(apiData.product.id) : false}
          onSimilarAddToCart={isAvailable ? (similarProduct) => {
            // v0.6.2: Build CartItem from SimilarProduct with default pricing
            const estimatedPrice = Math.floor(similarProduct.monthlyQuota * 24 / 0.9);
            const cartItem: CartItem = {
              productId: similarProduct.id,
              slug: similarProduct.slug,  // For API calls when fetching payment plans
              name: similarProduct.displayName,
              shortName: similarProduct.name,
              brand: similarProduct.brand,
              image: similarProduct.thumbnail,
              price: estimatedPrice,
              months: WIZARD_SELECTED_TERM,
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
          cartItems={isAvailable ? catalogState.cartIds : []}
        />
      </main>

      {/* Footer from Hero */}
      <Footer data={footerData} />

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
        products={wishlistProducts}
        onRemoveProduct={catalogState.removeFromWishlist}
        onClearAll={catalogState.clearWishlist}
        onViewProduct={(productId) => {
          setIsWishlistDrawerOpen(false);
          const product = wishlistProducts.find((p) => p.id === productId);
          if (product) {
            router.push(`/prototipos/0.6/${landing}/producto/${product.slug}`);
          }
        }}
        unavailableIds={catalogState.unavailableWishlistIds}
      />

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
        unavailableIds={catalogState.unavailableCartIds}
      />

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
