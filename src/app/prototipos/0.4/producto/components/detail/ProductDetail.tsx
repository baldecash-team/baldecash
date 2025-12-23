'use client';

/**
 * ProductDetail - Wrapper component for all product detail sections
 *
 * Renders the appropriate version of each component based on config
 */

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductDetailConfig, defaultDetailConfig, ProductDetail as ProductDetailType } from '../../types/detail';
import { mockProductDetail, mockSimilarProducts, mockLimitations, mockCertifications } from '../../data/mockDetailData';

// Info Header imports
import {
  ProductInfoHeaderV1,
  ProductInfoHeaderV2,
  ProductInfoHeaderV3,
  ProductInfoHeaderV4,
  ProductInfoHeaderV5,
  ProductInfoHeaderV6,
} from './info';

// Gallery imports
import {
  ProductGalleryV1,
  ProductGalleryV2,
  ProductGalleryV3,
  ProductGalleryV4,
  ProductGalleryV5,
  ProductGalleryV6,
} from './gallery';

// Tabs imports
import {
  DetailTabsV1,
  DetailTabsV2,
  DetailTabsV3,
  DetailTabsV4,
  DetailTabsV5,
  DetailTabsV6,
} from './tabs';

// Specs imports
import {
  SpecsDisplayV1,
  SpecsDisplayV2,
  SpecsDisplayV3,
  SpecsDisplayV4,
  SpecsDisplayV5,
  SpecsDisplayV6,
} from './specs';

// Pricing imports
import {
  PricingCalculatorV1,
  PricingCalculatorV2,
  PricingCalculatorV3,
  PricingCalculatorV4,
  PricingCalculatorV5,
  PricingCalculatorV6,
} from './pricing';

// Similar Products imports
import {
  SimilarProductsV1,
  SimilarProductsV2,
  SimilarProductsV3,
  SimilarProductsV4,
  SimilarProductsV5,
  SimilarProductsV6,
} from './similar';

// Limitations imports
import {
  ProductLimitationsV1,
  ProductLimitationsV2,
  ProductLimitationsV3,
  ProductLimitationsV4,
  ProductLimitationsV5,
  ProductLimitationsV6,
} from './honesty';

// Certifications imports
import {
  CertificationsV1,
  CertificationsV2,
  CertificationsV3,
  CertificationsV4,
  CertificationsV5,
  CertificationsV6,
} from './certifications';

// Cronograma imports
import {
  CronogramaV1,
  CronogramaV2,
  CronogramaV3,
  CronogramaV4,
  CronogramaV5,
  CronogramaV6,
} from './cronograma';

// Ports imports
import { PortsDisplayV1 } from './ports';

interface ProductDetailProps {
  config?: Partial<ProductDetailConfig>;
  product?: ProductDetailType;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  config = {},
  product = mockProductDetail,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const finalConfig: ProductDetailConfig = { ...defaultDetailConfig, ...config };

  const handleSolicitar = () => {
    // Navigate to wizard with optimized params: Input V4, Options V2, Upload V3, Progress V1, Navigation V1
    const baseWizardUrl = '/prototipos/0.4/wizard-solicitud/wizard-preview?input=4&options=2&upload=3&progress=1&navigation=1';
    const wizardUrl = isCleanMode ? `${baseWizardUrl}&mode=clean` : baseWizardUrl;
    router.push(wizardUrl);
  };

  const renderInfoHeader = () => {
    const infoHeaderComponents = {
      1: ProductInfoHeaderV1,
      2: ProductInfoHeaderV2,
      3: ProductInfoHeaderV3,
      4: ProductInfoHeaderV4,
      5: ProductInfoHeaderV5,
      6: ProductInfoHeaderV6,
    };
    const InfoHeaderComponent = infoHeaderComponents[finalConfig.infoHeaderVersion];
    return <InfoHeaderComponent product={product} />;
  };

  const renderGallery = () => {
    const galleryComponents = {
      1: ProductGalleryV1,
      2: ProductGalleryV2,
      3: ProductGalleryV3,
      4: ProductGalleryV4,
      5: ProductGalleryV5,
      6: ProductGalleryV6,
    };
    const GalleryComponent = galleryComponents[finalConfig.galleryVersion];
    return <GalleryComponent images={product.images} productName={product.displayName} />;
  };

  const renderTabs = () => {
    const tabsComponents = {
      1: DetailTabsV1,
      2: DetailTabsV2,
      3: DetailTabsV3,
      4: DetailTabsV4,
      5: DetailTabsV5,
      6: DetailTabsV6,
    };
    const TabsComponent = tabsComponents[finalConfig.tabsVersion];
    return <TabsComponent product={product} />;
  };

  const renderSpecs = () => {
    const specsComponents = {
      1: SpecsDisplayV1,
      2: SpecsDisplayV2,
      3: SpecsDisplayV3,
      4: SpecsDisplayV4,
      5: SpecsDisplayV5,
      6: SpecsDisplayV6,
    };
    const SpecsComponent = specsComponents[finalConfig.specsVersion];
    return <SpecsComponent specs={product.specs} />;
  };

  const renderPricing = () => {
    const pricingComponents = {
      1: PricingCalculatorV1,
      2: PricingCalculatorV2,
      3: PricingCalculatorV3,
      4: PricingCalculatorV4,
      5: PricingCalculatorV5,
      6: PricingCalculatorV6,
    };
    const PricingComponent = pricingComponents[finalConfig.pricingVersion];
    return (
      <PricingComponent
        monthlyQuota={product.lowestQuota}
        originalQuota={product.originalQuota}
        defaultTerm={36}
      />
    );
  };

  const renderSimilarProducts = () => {
    const similarComponents = {
      1: SimilarProductsV1,
      2: SimilarProductsV2,
      3: SimilarProductsV3,
      4: SimilarProductsV4,
      5: SimilarProductsV5,
      6: SimilarProductsV6,
    };
    const SimilarComponent = similarComponents[finalConfig.similarProductsVersion];
    return <SimilarComponent products={mockSimilarProducts} currentQuota={product.lowestQuota} />;
  };

  const renderLimitations = () => {
    const limitationsComponents = {
      1: ProductLimitationsV1,
      2: ProductLimitationsV2,
      3: ProductLimitationsV3,
      4: ProductLimitationsV4,
      5: ProductLimitationsV5,
      6: ProductLimitationsV6,
    };
    const LimitationsComponent = limitationsComponents[finalConfig.limitationsVersion];
    return <LimitationsComponent limitations={mockLimitations} />;
  };

  const renderCertifications = () => {
    const certificationsComponents = {
      1: CertificationsV1,
      2: CertificationsV2,
      3: CertificationsV3,
      4: CertificationsV4,
      5: CertificationsV5,
      6: CertificationsV6,
    };
    const CertificationsComponent = certificationsComponents[finalConfig.certificationsVersion];
    return <CertificationsComponent certifications={mockCertifications} />;
  };

  const renderCronograma = () => {
    const cronogramaComponents = {
      1: CronogramaV1,
      2: CronogramaV2,
      3: CronogramaV3,
      4: CronogramaV4,
      5: CronogramaV5,
      6: CronogramaV6,
    };
    const CronogramaComponent = cronogramaComponents[finalConfig.cronogramaVersion];
    return (
      <CronogramaComponent
        monthlyQuota={product.lowestQuota}
        term={36}
        startDate={new Date()}
      />
    );
  };

  const renderPorts = () => {
    return <PortsDisplayV1 ports={product.ports} />;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-neutral-500 mb-4">
          <span className="hover:text-[#4654CD] cursor-pointer">Inicio</span>
          <span className="mx-2">/</span>
          <span className="hover:text-[#4654CD] cursor-pointer">Laptops</span>
          <span className="mx-2">/</span>
          <span className="text-neutral-700">{product.displayName}</span>
        </nav>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Gallery */}
          <div id="section-gallery">
            {renderGallery()}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Info Header */}
            <div id="section-info">
              {renderInfoHeader()}
            </div>

            {/* Pricing Calculator + CTA */}
            <div id="section-pricing" className="space-y-4">
              {renderPricing()}
              {/* CTA Button - Same width as calculator */}
              <button
                onClick={handleSolicitar}
                className="w-full bg-[#4654CD] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#3a47b3] transition-colors cursor-pointer shadow-lg shadow-[#4654CD]/25"
              >
                ¡Lo quiero! Solicitar ahora
              </button>
            </div>

            {/* Certifications */}
            <div id="section-certifications">
              {renderCertifications()}
            </div>
          </div>
        </div>

        {/* Tabs Section - Full Width */}
        <div id="section-tabs" className="mt-12">
          {renderTabs()}
        </div>

        {/* Specs Section - Full Width */}
        <div id="section-specs" className="mt-12">
          {renderSpecs()}
        </div>

        {/* Ports Display - Full Width */}
        <div id="section-ports" className="mt-12">
          {renderPorts()}
        </div>

        {/* Cronograma Section - Full Width */}
        <div id="section-cronograma" className="mt-12">
          {renderCronograma()}
        </div>

        {/* Similar Products - Full Width */}
        <div id="section-similar" className="mt-12">
          {renderSimilarProducts()}
        </div>

        {/* Limitations */}
        <div id="section-limitations" className="mt-8">
          {renderLimitations()}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
