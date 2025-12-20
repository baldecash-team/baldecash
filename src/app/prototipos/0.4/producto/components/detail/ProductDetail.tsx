'use client';

/**
 * ProductDetail - Wrapper component for all product detail sections
 *
 * Renders the appropriate version of each component based on config
 */

import React from 'react';
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

// Gallery imports - will be created by agent
// import {
//   ProductGalleryV1,
//   ProductGalleryV2,
//   ProductGalleryV3,
//   ProductGalleryV4,
//   ProductGalleryV5,
//   ProductGalleryV6,
// } from './gallery';

// Tabs imports - will be created by agent
// import {
//   DetailTabsV1,
//   DetailTabsV2,
//   DetailTabsV3,
//   DetailTabsV4,
//   DetailTabsV5,
//   DetailTabsV6,
// } from './tabs';

// Specs imports - will be created by agent
// import {
//   SpecsDisplayV1,
//   SpecsDisplayV2,
//   SpecsDisplayV3,
//   SpecsDisplayV4,
//   SpecsDisplayV5,
//   SpecsDisplayV6,
// } from './specs';

// Pricing imports - will be created by agent
// import {
//   PricingCalculatorV1,
//   PricingCalculatorV2,
//   PricingCalculatorV3,
//   PricingCalculatorV4,
//   PricingCalculatorV5,
//   PricingCalculatorV6,
// } from './pricing';

// Similar Products imports - will be created by agent
// import {
//   SimilarProductsV1,
//   SimilarProductsV2,
//   SimilarProductsV3,
//   SimilarProductsV4,
//   SimilarProductsV5,
//   SimilarProductsV6,
// } from './similar';

// Limitations imports - will be created by agent
// import {
//   ProductLimitationsV1,
//   ProductLimitationsV2,
//   ProductLimitationsV3,
//   ProductLimitationsV4,
//   ProductLimitationsV5,
//   ProductLimitationsV6,
// } from './honesty';

// Certifications imports - will be created by agent
// import {
//   CertificationsV1,
//   CertificationsV2,
//   CertificationsV3,
//   CertificationsV4,
//   CertificationsV5,
//   CertificationsV6,
// } from './certifications';

interface ProductDetailProps {
  config?: Partial<ProductDetailConfig>;
  product?: ProductDetailType;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  config = {},
  product = mockProductDetail,
}) => {
  const finalConfig: ProductDetailConfig = { ...defaultDetailConfig, ...config };

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
    // Placeholder until gallery components are created
    return (
      <div className="aspect-square bg-neutral-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 text-sm">Galería V{finalConfig.galleryVersion}</p>
          <img
            src={product.images[0]?.url}
            alt={product.displayName}
            className="max-w-full max-h-80 object-contain mt-4"
            loading="lazy"
          />
        </div>
      </div>
    );
  };

  const renderPricing = () => {
    // Placeholder until pricing components are created
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <p className="text-sm text-neutral-500 mb-2">Calculadora V{finalConfig.pricingVersion}</p>
        {product.originalQuota && (
          <p className="line-through text-neutral-400 text-lg">S/{product.originalQuota}/mes</p>
        )}
        <p className="text-4xl font-bold text-[#4654CD] font-['Baloo_2']">
          S/{product.lowestQuota}<span className="text-lg font-normal text-neutral-500">/mes</span>
        </p>
        <p className="text-sm text-neutral-500 mt-1">x 36 meses</p>
      </div>
    );
  };

  const renderSpecs = () => {
    // Placeholder until specs components are created
    return (
      <div className="bg-neutral-50 rounded-xl p-4">
        <p className="text-sm text-neutral-500 mb-3">Especificaciones V{finalConfig.specsVersion}</p>
        <div className="space-y-2">
          {product.specs.slice(0, 3).map((spec, idx) => (
            <div key={idx} className="text-sm">
              <span className="font-medium text-neutral-700">{spec.category}:</span>{' '}
              <span className="text-neutral-600">{spec.specs[0]?.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSimilarProducts = () => {
    // Placeholder until similar products components are created
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-4">
        <p className="text-sm font-medium text-neutral-700 mb-3">
          Productos similares V{finalConfig.similarProductsVersion}
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {mockSimilarProducts.slice(0, 3).map((similar) => (
            <div key={similar.id} className="flex-shrink-0 w-32 text-center">
              <img
                src={similar.thumbnail}
                alt={similar.name}
                className="w-full h-20 object-contain mb-2"
                loading="lazy"
              />
              <p className="text-xs text-neutral-600 truncate">{similar.name}</p>
              <p className={`text-sm font-bold ${similar.quotaDifference < 0 ? 'text-[#22c55e]' : 'text-amber-600'}`}>
                {similar.quotaDifference > 0 ? '+' : ''}S/{similar.quotaDifference}/mes
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLimitations = () => {
    // Placeholder until limitations components are created
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-medium text-amber-700 mb-2">
          Limitaciones V{finalConfig.limitationsVersion}
        </p>
        <ul className="text-xs text-amber-600 space-y-1">
          {mockLimitations.map((lim, idx) => (
            <li key={idx}>• {lim.description}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderCertifications = () => {
    // Placeholder until certifications components are created
    return (
      <div className="flex items-center gap-3">
        <p className="text-xs text-neutral-500">Certificaciones V{finalConfig.certificationsVersion}:</p>
        {mockCertifications.map((cert) => (
          <span key={cert.code} className="text-xs bg-neutral-100 px-2 py-1 rounded">
            {cert.name}
          </span>
        ))}
      </div>
    );
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
          <div>
            {renderGallery()}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Info Header */}
            {renderInfoHeader()}

            {/* Pricing Calculator */}
            {renderPricing()}

            {/* CTA Button */}
            <button className="w-full bg-[#4654CD] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#3a47b3] transition-colors cursor-pointer">
              ¡Lo quiero! Solicitar ahora
            </button>

            {/* Certifications */}
            {renderCertifications()}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Specs - 2 columns */}
          <div className="lg:col-span-2">
            {renderSpecs()}
          </div>

          {/* Similar Products - 1 column */}
          <div>
            {renderSimilarProducts()}
          </div>
        </div>

        {/* Limitations */}
        <div className="mt-8">
          {renderLimitations()}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
