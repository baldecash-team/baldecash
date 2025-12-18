'use client';

/**
 * ProductDetail - Wrapper Principal de Detalle de Producto
 *
 * Combina todos los componentes segun la configuracion:
 * - Galeria
 * - Info basica + Calculadora
 * - Tabs/Acordeon/Scroll con specs
 * - Limitaciones
 * - Productos similares
 * - Certificaciones
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Shield,
  Truck,
  Check,
  Battery,
  Monitor,
} from 'lucide-react';
import {
  DetailConfig,
  ProductDetail as ProductDetailType,
  SimilarProduct,
  ProductLimitation,
  Certification,
} from '../types/detail';
import { formatCurrency } from '../data/mockDetailData';

// Gallery imports
import ProductGalleryV1 from './detail/gallery/ProductGalleryV1';
import ProductGalleryV2 from './detail/gallery/ProductGalleryV2';
import ProductGalleryV3 from './detail/gallery/ProductGalleryV3';

// Tabs imports
import DetailTabsV1 from './detail/tabs/DetailTabsV1';
import DetailTabsV2 from './detail/tabs/DetailTabsV2';
import DetailTabsV3 from './detail/tabs/DetailTabsV3';

// Specs imports
import SpecsTableV1 from './detail/specs/SpecsTableV1';
import SpecsCardsV2 from './detail/specs/SpecsCardsV2';
import SpecsListV3 from './detail/specs/SpecsListV3';

// Pricing imports
import PricingCalculator from './detail/pricing/PricingCalculator';
import PaymentSchedule from './detail/pricing/PaymentSchedule';

// Similar products imports
import SimilarProductsV1 from './detail/similar/SimilarProductsV1';
import SimilarProductsV2 from './detail/similar/SimilarProductsV2';
import SimilarProductsV3 from './detail/similar/SimilarProductsV3';

// Limitations imports
import ProductLimitationsV1 from './detail/honesty/ProductLimitationsV1';
import ProductLimitationsV2 from './detail/honesty/ProductLimitationsV2';
import ProductLimitationsV3 from './detail/honesty/ProductLimitationsV3';

// Certifications imports
import CertificationsV1 from './detail/certifications/CertificationsV1';
import CertificationsV2 from './detail/certifications/CertificationsV2';
import CertificationsV3 from './detail/certifications/CertificationsV3';

interface ProductDetailProps {
  product: ProductDetailType;
  similarProducts: SimilarProduct[];
  limitations: ProductLimitation[];
  certifications: Certification[];
  config: DetailConfig;
}

export const ProductDetailComponent: React.FC<ProductDetailProps> = ({
  product,
  similarProducts,
  limitations,
  certifications,
  config,
}) => {
  // Gallery component based on version
  const GalleryComponent = {
    1: ProductGalleryV1,
    2: ProductGalleryV2,
    3: ProductGalleryV3,
  }[config.galleryVersion];

  // Tabs component based on version
  const TabsComponent = {
    1: DetailTabsV1,
    2: DetailTabsV2,
    3: DetailTabsV3,
  }[config.tabsVersion];

  // Similar products component
  const SimilarComponent = {
    1: SimilarProductsV1,
    2: SimilarProductsV2,
    3: SimilarProductsV3,
  }[config.similarProductsVersion];

  // Limitations component
  const LimitationsComponent = {
    1: ProductLimitationsV1,
    2: ProductLimitationsV2,
    3: ProductLimitationsV3,
  }[config.limitationsVersion];

  // Certifications component
  const CertificationsComponent = {
    1: CertificationsV1,
    2: CertificationsV2,
    3: CertificationsV3,
  }[config.certificationsVersion];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header/Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 text-neutral-600 hover:text-[#4654CD] transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Volver al catalogo</span>
            </button>

            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                variant="flat"
                className="bg-neutral-100 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-neutral-600" />
              </Button>
              <Button
                isIconOnly
                variant="flat"
                className="bg-neutral-100 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-neutral-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Gallery */}
          <div>
            <GalleryComponent images={product.images} productName={product.displayName} />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.hasOS && (
                <Chip
                  size="sm"
                  radius="sm"
                  startContent={<Monitor className="w-3 h-3" />}
                  classNames={{
                    base: 'bg-[#22c55e] px-2.5 py-1 h-auto',
                    content: 'text-white text-xs font-medium',
                  }}
                >
                  Con {product.osName}
                </Chip>
              )}
              <Chip
                size="sm"
                radius="sm"
                startContent={<Battery className="w-3 h-3" />}
                classNames={{
                  base: 'bg-[#4654CD]/10 px-2.5 py-1 h-auto',
                  content: 'text-[#4654CD] text-xs font-medium',
                }}
              >
                {product.batteryLife}
              </Chip>
              <Chip
                size="sm"
                radius="sm"
                classNames={{
                  base: 'bg-neutral-100 px-2.5 py-1 h-auto',
                  content: 'text-neutral-600 text-xs font-medium',
                }}
              >
                {product.stock} disponibles
              </Chip>
            </div>

            {/* Brand & Name */}
            <div>
              <p className="text-sm text-[#4654CD] font-medium mb-1">{product.brand}</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">
                {product.displayName}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-600">
                {product.rating} ({product.reviewCount} opiniones)
              </span>
            </div>

            {/* Short description */}
            <p className="text-neutral-600">{product.shortDescription}</p>

            {/* Pricing Calculator */}
            <PricingCalculator
              basePrice={product.originalPrice || product.price}
              discount={product.discount}
              monthlyRate={0.012}
            />

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4 p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Shield className="w-4 h-4 text-[#22c55e]" />
                <span>{product.warranty}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Truck className="w-4 h-4 text-[#4654CD]" />
                <span>Envio gratis a Lima</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Check className="w-4 h-4 text-[#22c55e]" />
                <span>100% original</span>
              </div>
            </div>

            {/* Certifications (V1 compact) */}
            {config.certificationsVersion === 1 && (
              <CertificationsV1 certifications={certifications} />
            )}
          </div>
        </div>

        {/* Tabs/Content Section */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
          <TabsComponent
            product={product}
            specsVersion={config.specsDisplayVersion}
            tooltipsVersion={config.tooltipsVersion}
          />
        </div>

        {/* Limitations Section */}
        <div className="mb-8">
          <LimitationsComponent limitations={limitations} />
        </div>

        {/* Certifications (V2/V3 expanded) */}
        {config.certificationsVersion !== 1 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
            <CertificationsComponent certifications={certifications} />
          </div>
        )}

        {/* Payment Schedule */}
        <div className="mb-8">
          <PaymentSchedule
            amount={product.price - (product.discount || 0)}
            term={36}
            monthlyRate={0.012}
          />
        </div>

        {/* Similar Products */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <SimilarComponent products={similarProducts} currentProductId={product.id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailComponent;
