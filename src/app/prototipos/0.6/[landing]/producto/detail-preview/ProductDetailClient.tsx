'use client';

/**
 * ProductDetailClient - Client component principal para detalle de producto v0.6
 *
 * Consume data real del API via useProductDetail hook.
 * Usa LayoutContext para Navbar y Footer compartidos.
 * Recibe productId via query param ?id=XX
 */

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';

// Hero components
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';

// Hooks
import { useProductDetail } from './hooks/useProductDetail';

// Components
import { ProductGallery } from './components/ProductGallery';
import { ProductSpecs } from './components/ProductSpecs';
import { ProductPricing } from './components/ProductPricing';
import { SimilarProducts } from './components/SimilarProducts';
import { ProductDetailLayout } from './components/ProductDetailLayout';

function ProductDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Get product ID from URL
  const productId = searchParams.get('id');

  // Scroll to top on page load
  useScrollToTop();

  // Layout context (navbar, footer)
  const { navbarProps, footerData, isLoading: isLayoutLoading } = useLayout();

  // Product data
  const {
    product,
    similarProducts,
    isLoading: isProductLoading,
    isFromApi,
    dataSource,
    error,
  } = useProductDetail(productId, landing);

  // Color selection state
  const [selectedColorId, setSelectedColorId] = useState<string>('');

  // Set default color when product loads
  const defaultColorId = useMemo(() => {
    if (product?.colors && product.colors.length > 0) {
      return product.colors[0].id;
    }
    return '';
  }, [product?.colors]);

  const activeColorId = selectedColorId || defaultColorId;

  // Handle solicitar (navigate to request flow)
  const handleSolicitar = () => {
    const solicitarUrl = `/prototipos/0.6/${landing}/solicitar/`;
    router.push(solicitarUrl);
  };

  // Handle back navigation
  const handleBack = () => {
    const catalogUrl = `/prototipos/0.6/${landing}/catalogo`;
    router.push(catalogUrl);
  };

  // Loading state
  if (isLayoutLoading || isProductLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <CubeGridSpinner />
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar
          fullWidth
          landing={landing}
          promoBannerData={navbarProps?.promoBannerData}
          logoUrl={navbarProps?.logoUrl}
          customerPortalUrl={navbarProps?.customerPortalUrl}
          navbarItems={navbarProps?.navbarItems}
          megamenuItems={navbarProps?.megamenuItems}
          activeSections={['convenios', 'como-funciona', 'faq']}
        />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Producto no encontrado</h1>
          <p className="text-neutral-500 mb-6">El producto que buscas no esta disponible.</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4654CD] text-white rounded-xl font-medium hover:bg-[#3a47b3] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catalogo
          </button>
        </div>
        <Footer data={footerData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <Navbar
        fullWidth
        landing={landing}
        promoBannerData={navbarProps?.promoBannerData}
        logoUrl={navbarProps?.logoUrl}
        customerPortalUrl={navbarProps?.customerPortalUrl}
        navbarItems={navbarProps?.navbarItems}
        megamenuItems={navbarProps?.megamenuItems}
        activeSections={['convenios', 'como-funciona', 'faq']}
      />

      {/* Breadcrumb / Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-2">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#4654CD] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catalogo
        </button>

        {/* Data source badge (dev only) */}
        {error && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Product Detail */}
      <ProductDetailLayout
        gallery={
          <ProductGallery
            images={product.images}
            productName={product.displayName}
            brand={product.brand}
            brandLogo={product.brandLogo}
            colors={product.colors}
            selectedColorId={activeColorId}
            onColorSelect={setSelectedColorId}
          />
        }
        specs={
          <ProductSpecs
            specs={product.specs}
            rawSpecs={product.rawSpecs}
            deviceType={product.deviceType}
          />
        }
        pricing={
          <ProductPricing
            price={product.price}
            originalPrice={product.originalPrice}
            discount={product.discount}
            onSolicitar={handleSolicitar}
          />
        }
        similar={
          <SimilarProducts products={similarProducts} />
        }
        description={product.name !== product.displayName ? product.name : undefined}
        condition={product.condition}
        stockAvailable={product.stockQuantity}
      />

      {/* Footer */}
      <Footer data={footerData} />
    </div>
  );
}

export function ProductDetailClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <CubeGridSpinner />
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}

export default ProductDetailClient;
