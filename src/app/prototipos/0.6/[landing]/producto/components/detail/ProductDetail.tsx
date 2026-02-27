'use client';

/**
 * ProductDetail - Wrapper component v0.6
 * Data from API only (NO mock data fallback)
 *
 * Layout: 2 columnas
 * - Izquierda: Card unificada (Gallery + Brand + Rating + Nombre + ColorSelector)
 * - Derecha: Pricing sticky + CTA + Certifications
 */

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { ShoppingCart, Check } from 'lucide-react';
import {
  DeviceType,
  CronogramaVersion,
  ProductDetail as ProductDetailType,
  PaymentPlan,
  SimilarProduct,
  ProductLimitation,
  Certification,
} from '../../types/detail';
import type { SelectedProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

// Storage key for selected product (same as ProductContext)
const STORAGE_KEY = 'baldecash-solicitar-selected-product';

import {
  ProductGallery,
  DetailTabs,
  SpecsDisplay,
  PricingCalculator,
  Cronograma,
  SimilarProducts,
  ProductLimitations,
  Certifications,
  PortsDisplay,
} from './index';

interface ProductDetailProps {
  // Data props (from API - required, no fallback to mock)
  product: ProductDetailType;
  paymentPlans: PaymentPlan[];
  similarProducts?: SimilarProduct[];
  limitations?: ProductLimitation[];
  certifications?: Certification[];
  // Config props
  deviceType?: DeviceType;
  cronogramaVersion?: CronogramaVersion;
  onAddToCart?: () => void;
  isInCart?: boolean;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  // API data props (required)
  product,
  paymentPlans,
  similarProducts = [],
  limitations = [],
  certifications = [],
  // Config props
  deviceType = 'laptop',
  cronogramaVersion = 1,
  onAddToCart,
  isInCart = false,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const landing = params.landing as string || 'home';
  const isCleanMode = searchParams.get('mode') === 'clean';

  // Color state - default to first color
  const defaultColorId = useMemo(() => {
    return product.colors && product.colors.length > 0 ? product.colors[0].id : '';
  }, [product.colors]);

  const [selectedColorId, setSelectedColorId] = useState(defaultColorId);

  // Only show ports for laptops
  const showPorts = deviceType === 'laptop' && product.ports.length > 0;

  // Helper to extract spec value
  const getSpecValue = (category: string, label: string): string | undefined => {
    const specCategory = product.specs.find((s) => s.category.toLowerCase() === category.toLowerCase());
    if (!specCategory) return undefined;
    const spec = specCategory.specs.find((s) => s.label.toLowerCase().includes(label.toLowerCase()));
    return spec?.value;
  };

  const handleSolicitar = () => {
    // Build SelectedProduct from current product
    const selectedProduct: SelectedProduct = {
      id: product.id,
      name: product.displayName,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      monthlyPayment: product.lowestQuota,
      months: 24, // Default term
      image: product.images[0]?.url || '',
      specs: {
        processor: getSpecValue('procesador', 'modelo') || getSpecValue('processor', 'model') || '',
        ram: getSpecValue('memoria', 'capacidad') || getSpecValue('ram', 'size') || '',
        storage: getSpecValue('almacenamiento', 'capacidad') || getSpecValue('storage', 'size') || '',
      },
    };

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProduct));
      // Clear cart products since this is a single product selection
      localStorage.removeItem('baldecash-solicitar-cart-products');
    } catch {
      // localStorage not available
    }

    // Navigate to solicitar flow in 0.6
    const baseSolicitarUrl = `/prototipos/0.6/${landing}/solicitar`;
    const solicitarUrl = isCleanMode ? `${baseSolicitarUrl}?mode=clean` : baseSolicitarUrl;
    router.push(solicitarUrl);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Unified Product Card (Gallery + Info) */}
          <div id="section-gallery" className="order-2 lg:order-1">
            <ProductGallery
              images={product.images}
              productName={product.displayName}
              brand={product.brand}
              rating={product.rating}
              reviewCount={product.reviewCount}
              displayName={product.displayName}
              colors={product.colors}
              selectedColorId={selectedColorId}
              onColorSelect={setSelectedColorId}
            />
          </div>

          {/* Right Column - Pricing (Sticky) */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-[168px] space-y-6">
            {/* Pricing Calculator + CTA */}
            <div id="section-pricing" className="space-y-4">
              <PricingCalculator
                paymentPlans={paymentPlans}
                defaultTerm={36}
                productPrice={product.price}
              />
              {/* CTA Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSolicitar}
                  className="flex-1 bg-[var(--color-primary)] text-white py-4 rounded-xl font-semibold text-lg hover:brightness-90 transition-all cursor-pointer shadow-lg shadow-[rgba(var(--color-primary-rgb),0.25)]"
                >
                  ¡Lo quiero! Solicitar ahora
                </button>
                {onAddToCart && (
                  <button
                    onClick={onAddToCart}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-colors cursor-pointer border ${
                      isInCart
                        ? 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20 hover:bg-[#22c55e]/20'
                        : 'text-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.1)] border-[rgba(var(--color-primary-rgb),0.2)] hover:bg-[rgba(var(--color-primary-rgb),0.2)]'
                    }`}
                  >
                    {isInCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                    <span className="hidden sm:inline">{isInCart ? 'En el carrito' : 'Al carrito'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div id="section-certifications">
              <Certifications certifications={certifications} />
            </div>
          </div>
        </div>

        {/* Tabs Section - Full Width */}
        <div id="section-tabs" className="mt-12">
          <DetailTabs product={product} />
        </div>

        {/* Specs Section - Full Width */}
        <div id="section-specs" className="mt-12">
          <SpecsDisplay specs={product.specs} />
        </div>

        {/* Ports Display - Full Width (Only for Laptops) */}
        {showPorts && (
          <div id="section-ports" className="mt-12">
            <PortsDisplay ports={product.ports} />
          </div>
        )}

        {/* Cronograma Section - Full Width */}
        <div id="section-cronograma" className="mt-12">
          <Cronograma
            paymentPlans={paymentPlans}
            term={36}
            startDate={new Date()}
            version={cronogramaVersion}
            productName={product.displayName}
            productBrand={product.brand}
            productPrice={product.price}
          />
        </div>

        {/* Similar Products - Full Width */}
        <div id="section-similar" className="mt-12">
          <SimilarProducts products={similarProducts} currentQuota={product.lowestQuota} isCleanMode={isCleanMode} />
        </div>

        {/* Limitations */}
        <div id="section-limitations" className="mt-8">
          <ProductLimitations limitations={limitations} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
