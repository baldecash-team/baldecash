'use client';

/**
 * ProductDetail - Wrapper component v0.5
 * Supports multiple device types: laptop, tablet, celular
 *
 * Config: InfoHeader V3, Gallery V1, Tabs V1, Specs V2,
 * Pricing V4, Cronograma V2, Similar V2, Limitations V6, Certifications V1
 */

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DeviceType } from '../../types/detail';
import {
  getProductByDeviceType,
  getSimilarProductsByDeviceType,
  getLimitationsByDeviceType,
  getCertificationsByDeviceType,
} from '../../data/mockDetailData';

import {
  ProductInfoHeader,
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
  deviceType?: DeviceType;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  deviceType = 'laptop',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';

  // Get data based on device type
  const product = getProductByDeviceType(deviceType);
  const similarProducts = getSimilarProductsByDeviceType(deviceType);
  const limitations = getLimitationsByDeviceType(deviceType);
  const certifications = getCertificationsByDeviceType(deviceType);

  // Color state - default to first color
  const defaultColorId = useMemo(() => {
    return product.colors && product.colors.length > 0 ? product.colors[0].id : '';
  }, [product.colors]);

  const [selectedColorId, setSelectedColorId] = useState(defaultColorId);

  // Only show ports for laptops
  const showPorts = deviceType === 'laptop' && product.ports.length > 0;

  // Get category label for breadcrumb
  const categoryLabels: Record<string, string> = {
    laptops: 'Laptops',
    tablets: 'Tablets',
    celulares: 'Celulares',
  };

  const handleSolicitar = () => {
    const baseWizardUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview';
    const wizardUrl = isCleanMode ? `${baseWizardUrl}?mode=clean` : baseWizardUrl;
    router.push(wizardUrl);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-neutral-500 mb-4">
          <span className="hover:text-[#4654CD] cursor-pointer">Inicio</span>
          <span className="mx-2">/</span>
          <span className="hover:text-[#4654CD] cursor-pointer">
            {categoryLabels[product.category] || product.category}
          </span>
          <span className="mx-2">/</span>
          <span className="text-neutral-700">{product.displayName}</span>
        </nav>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Gallery */}
          <div id="section-gallery">
            <ProductGallery images={product.images} productName={product.displayName} />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Info Header */}
            <div id="section-info">
              <ProductInfoHeader
                product={product}
                selectedColorId={selectedColorId}
                onColorSelect={setSelectedColorId}
              />
            </div>

            {/* Pricing Calculator + CTA */}
            <div id="section-pricing" className="space-y-4">
              <PricingCalculator
                monthlyQuota={product.lowestQuota}
                originalQuota={product.originalQuota}
                defaultTerm={36}
              />
              {/* CTA Button */}
              <button
                onClick={handleSolicitar}
                className="w-full bg-[#4654CD] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#3a47b3] transition-colors cursor-pointer shadow-lg shadow-[#4654CD]/25"
              >
                ¡Lo quiero! Solicitar ahora
              </button>
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
            monthlyQuota={product.lowestQuota}
            term={36}
            startDate={new Date()}
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
