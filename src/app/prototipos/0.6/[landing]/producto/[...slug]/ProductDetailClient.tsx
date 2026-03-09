'use client';

/**
 * Product Detail Client v0.6
 * Fetches product data from API with fallback to mock data
 */

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { AlertCircle } from 'lucide-react';

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
import type { CatalogProduct } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';

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

  // Drawer states for mobile
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Products for wishlist and cart display (fetched from API)
  const [wishlistProducts, setWishlistProducts] = useState<CatalogProduct[]>([]);
  const [cartProducts, setCartProducts] = useState<CatalogProduct[]>([]);

  // Fetch wishlist products from API
  useEffect(() => {
    if (catalogState.isHydrated && catalogState.wishlist.length > 0) {
      fetchProductsByIds(landing, catalogState.wishlist).then(setWishlistProducts);
    } else {
      setWishlistProducts([]);
    }
  }, [catalogState.wishlist, catalogState.isHydrated, landing]);

  // Fetch cart products from API
  useEffect(() => {
    if (catalogState.isHydrated && catalogState.cart.length > 0) {
      fetchProductsByIds(landing, catalogState.cart).then(setCartProducts);
    } else {
      setCartProducts([]);
    }
  }, [catalogState.cart, catalogState.isHydrated, landing]);

  // Handle cart continue - save products to context before navigating
  const handleCartContinue = useCallback(() => {
    if (cartProducts.length === 0) return;

    // Transform CatalogProduct[] to SelectedProduct[] format for solicitar context
    const productsForContext = cartProducts.map((product) => ({
      id: product.id,
      name: product.displayName,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      monthlyPayment: product.quotaMonthly,
      months: WIZARD_SELECTED_TERM,
      initialPercent: 0,
      initialAmount: 0,
      image: product.thumbnail,
      specs: {
        processor: product.specs?.processor?.model || '',
        ram: product.specs?.ram ? `${product.specs.ram.size}GB RAM` : '',
        storage: product.specs?.storage ? `${product.specs.storage.size}GB ${product.specs.storage.type}` : '',
      },
    }));

    // Set all products to cart context
    setContextCartProducts(productsForContext);

    // Also set the first product as selectedProduct for backwards compatibility
    setSelectedProduct(productsForContext[0]);

    // Navigate to solicitar
    router.push(`/prototipos/0.6/${landing}/solicitar`);
  }, [cartProducts, router, setContextCartProducts, setSelectedProduct, landing]);

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

  // Show error if product not found or API error (NO fallback to mock)
  if (apiError || !apiData) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar
          landing={landing}
          promoBannerData={navbarProps?.promoBannerData}
          logoUrl={navbarProps?.logoUrl}
          customerPortalUrl={navbarProps?.customerPortalUrl}
          navbarItems={navbarProps?.navbarItems}
          megamenuItems={navbarProps?.megamenuItems}
          activeSections={['convenios', 'como-funciona', 'faq', 'testimonios']}
        />
        <main className="pt-40">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-800 mb-2">
                Producto no disponible
              </h1>
              <p className="text-red-600 mb-6">
                {apiError || 'No se pudo cargar la información del producto'}
              </p>
              <p className="text-sm text-neutral-500 mb-6">
                Slug: <code className="bg-neutral-100 px-2 py-1 rounded">{slug}</code>
              </p>
              <button
                onClick={() => router.push(`/prototipos/0.6/${landing}/catalogo`)}
                className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Ver catálogo de productos
              </button>
            </div>
          </div>
        </main>
        <Footer data={footerData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-hidden">
      {/* Preview Banner - shows when navigating from /preview with preview_key */}
      <PreviewBanner pageName="Detalle del Producto" />

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
        wishlistItems={wishlistProducts}
        onWishlistRemove={catalogState.removeFromWishlist}
        onWishlistClear={catalogState.clearWishlist}
        onWishlistViewProduct={(productId) => {
          const product = wishlistProducts.find((p) => p.id === productId);
          if (product) {
            router.push(`/prototipos/0.6/${landing}/producto/${product.slug}`);
          }
        }}
        cartItems={cartProducts}
        onCartRemove={catalogState.removeFromCart}
        onCartClear={catalogState.clearCart}
        onCartContinue={handleCartContinue}
        onMobileSearchClick={() => setIsSearchDrawerOpen(true)}
        onMobileWishlistClick={() => setIsWishlistDrawerOpen(true)}
        onMobileCartClick={() => setIsCartDrawerOpen(true)}
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
      />

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        items={cartProducts}
        onRemoveItem={catalogState.removeFromCart}
        onClearAll={() => {
          catalogState.clearCart();
          setIsCartDrawerOpen(false);
        }}
        onContinue={() => {
          setIsCartDrawerOpen(false);
          handleCartContinue();
        }}
      />
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
