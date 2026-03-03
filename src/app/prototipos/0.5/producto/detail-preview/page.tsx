'use client';

/**
 * Product Detail Preview Page - BaldeCash v0.5
 *
 * Iterable: Device Type (laptop, tablet, celular)
 *
 * Fixed configuration:
 * - InfoHeader: V3 (Horizontal Split)
 * - Gallery: V1 (Thumbnails + zoom)
 * - Tabs: V1 (Scroll continuo)
 * - Specs: V2 (Cards grid)
 * - Pricing: V4 (Cards animadas)
 * - Cronograma: V2 (Tabla colapsable)
 * - Similar: V2 (Carousel horizontal)
 * - Limitations: V6 (Descriptivo)
 * - Certifications: V1 (Logos inline)
 */

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { ArrowLeft, Code, Settings } from 'lucide-react';
import { ProductDetail } from '../components/detail/ProductDetail';
import { DetalleSettingsModal } from '../components/detail';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton, CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';

// Hero components (Navbar & Footer)
import { Navbar } from '@/app/prototipos/0.5/hero/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';

// Product context for wizard integration (ProductProvider is at the 0.5 layout level)

// Catalog secondary navbar and data
import { CatalogSecondaryNavbar } from '@/app/prototipos/0.5/catalogo/components/catalog/CatalogSecondaryNavbar';
import { useCatalogSharedState } from '@/app/prototipos/0.5/catalogo/hooks/useCatalogSharedState';
import { mockProducts } from '@/app/prototipos/0.5/catalogo/data/mockCatalogData';
import {
  DetalleConfig,
  DeviceType,
  CronogramaVersion,
  defaultDetalleConfig,
  deviceTypeLabels,
} from '../types/detail';
import { useToast, Toast } from '@/app/prototipos/_shared';

function DetailPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';

  // Scroll to top on page load
  useScrollToTop();

  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Shared state for catalog (wishlist, cart)
  const catalogState = useCatalogSharedState();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast(4000);

  // Get products for wishlist and cart display
  const wishlistProducts = useMemo(
    () => mockProducts.filter((p) => catalogState.wishlist.includes(p.id)),
    [catalogState.wishlist]
  );
  const cartProducts = useMemo(
    () => mockProducts.filter((p) => catalogState.cart.includes(p.id)),
    [catalogState.cart]
  );

  // Build catalog URL helper
  const getCatalogUrl = (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => searchParams.set(key, value));
    }
    if (isCleanMode) searchParams.set('mode', 'clean');
    const queryString = searchParams.toString();
    return `/prototipos/0.5/catalogo/catalog-preview${queryString ? `?${queryString}` : ''}`;
  };

  // Preloading: dar tiempo a la página para cargar recursos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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

  // Update URL when config changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (config.deviceType !== defaultDetalleConfig.deviceType) {
      params.set('device', config.deviceType);
    }
    if (config.cronogramaVersion !== defaultDetalleConfig.cronogramaVersion) {
      params.set('cronograma', config.cronogramaVersion.toString());
    }
    if (isCleanMode) params.set('mode', 'clean');
    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  }, [config.deviceType, config.cronogramaVersion, router, isCleanMode]);

  // Product ID based on device type
  const currentProductId = config.deviceType === 'tablet' ? 'featured-tablet'
    : config.deviceType === 'celular' ? 'featured-celular'
    : 'featured-laptop';

  const isProductInCart = catalogState.cart.includes(currentProductId);

  // Handler para añadir al carrito desde la página de detalle
  const handleAddToCart = () => {
    if (isProductInCart) {
      showToast('Este producto ya está en tu carrito', 'info');
      return;
    }
    catalogState.addToCart(currentProductId);
    showToast('Producto añadido al carrito', 'success');
  };

  // Fixed config for display (components)
  const componentConfig = {
    infoHeader: 'V3',
    gallery: 'V1',
    tabs: 'V1',
    specs: 'V2',
    pricing: 'V4',
    cronograma: `V${config.cronogramaVersion}`,
    similar: 'V2',
    limitations: 'V6',
    certifications: 'V1',
    deviceType: config.deviceType,
    cronogramaVersion: config.cronogramaVersion,
  };

  // Show loading while preloading
  if (isLoading) {
    return <LoadingFallback />;
  }

  // In clean mode, just render the product detail without controls
  if (isCleanMode) {
    return (
      <div className="min-h-screen bg-neutral-50 relative">
        <Navbar isCleanMode={isCleanMode} />
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
            const product = mockProducts.find((p) => p.id === productId);
            router.push(`/prototipos/0.5/producto/detail-preview?device=${product?.deviceType || 'laptop'}${isCleanMode ? '&mode=clean' : ''}`);
          }}
          cartItems={cartProducts}
          onCartRemove={catalogState.removeFromCart}
          onCartClear={catalogState.clearCart}
          onCartContinue={() => router.push(getCatalogUrl())}
          onMobileSearchClick={() => router.push(getCatalogUrl())}
          onMobileWishlistClick={() => router.push(getCatalogUrl())}
          onMobileCartClick={() => router.push(getCatalogUrl())}
        />
        <main className="pt-40">
          <ProductDetail deviceType={config.deviceType} cronogramaVersion={config.cronogramaVersion} onAddToCart={handleAddToCart} isInCart={isProductInCart} />
        </main>
        <Footer isCleanMode={isCleanMode} />
        <FeedbackButton
          sectionId="detalle"
          className="bottom-20 md:bottom-6"
        />
        {toast && (
          <Toast message={toast.message} type={toast.type} isVisible={isToastVisible} onClose={hideToast} duration={4000} position="bottom" />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar isCleanMode={isCleanMode} />
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
          const product = mockProducts.find((p) => p.id === productId);
          router.push(`/prototipos/0.5/producto/detail-preview?device=${product?.deviceType || 'laptop'}${isCleanMode ? '&mode=clean' : ''}`);
        }}
        cartItems={cartProducts}
        onCartRemove={catalogState.removeFromCart}
        onCartClear={catalogState.clearCart}
        onCartContinue={() => router.push(getCatalogUrl())}
        onMobileSearchClick={() => router.push(getCatalogUrl())}
        onMobileWishlistClick={() => router.push(getCatalogUrl())}
        onMobileCartClick={() => router.push(getCatalogUrl())}
      />
      <main className="pt-40">
        {/* Main content */}
        <ProductDetail deviceType={config.deviceType} cronogramaVersion={config.cronogramaVersion} />
      </main>
      <Footer isCleanMode={isCleanMode} />

      {/* Floating action buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_04" version="0.5" />
        <Button
          isIconOnly
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
          style={{ borderRadius: '14px' }}
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

      {/* Config Badge */}
      {showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200 max-w-md">
          <p className="text-xs text-neutral-500 mb-1">Configuración v0.5:</p>
          <p className="text-xs font-mono text-neutral-700">
            Dispositivo: {deviceTypeLabels[config.deviceType].name} (iterable) | Info: V3 | Gallery: V1 | Specs: V2 | Pricing: V4
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Usa el botón ⚙️ para cambiar tipo de equipo
          </p>
        </div>
      )}

      {/* Settings Modal */}
      <DetalleSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
      {toast && (
        <Toast message={toast.message} type={toast.type} isVisible={isToastVisible} onClose={hideToast} duration={4000} position="bottom" />
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

export default function DetailPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DetailPreviewContent />
    </Suspense>
  );
}
