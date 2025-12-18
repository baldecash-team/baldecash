'use client';

/**
 * Detalle de Producto - Preview Page v0.3
 *
 * Pagina de preview con selector de versiones
 * para cada componente del detalle de producto.
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { DetailConfig, defaultDetailConfig } from './types/detail';
import {
  mockProductDetail,
  mockSimilarProducts,
  mockLimitations,
  mockCertifications,
} from './data/mockDetailData';
import ProductDetailComponent from './components/ProductDetail';
import DetalleSettingsModal from './components/DetalleSettingsModal';

export default function DetallePreviewPage() {
  const [config, setConfig] = useState<DetailConfig>(defaultDetailConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Floating Settings Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <Button
          isIconOnly
          size="lg"
          onPress={() => setIsSettingsOpen(true)}
          className="bg-[#4654CD] text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer rounded-full w-14 h-14"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      {/* Back to prototypes */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/prototipos/0.3">
          <Button
            variant="flat"
            size="sm"
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="bg-white shadow-md cursor-pointer"
          >
            Prototipos
          </Button>
        </Link>
      </div>

      {/* Current Config Display */}
      <div className="fixed top-4 right-20 z-50 bg-white rounded-lg shadow-md px-4 py-2 text-xs">
        <span className="text-neutral-500">Config: </span>
        <span className="font-mono text-neutral-700">
          G{config.galleryVersion} T{config.tabsVersion} S{config.specsDisplayVersion} L{config.limitationsVersion} P{config.similarProductsVersion} C{config.certificationsVersion}
        </span>
      </div>

      {/* Main Content */}
      <ProductDetailComponent
        product={mockProductDetail}
        similarProducts={mockSimilarProducts}
        limitations={mockLimitations}
        certifications={mockCertifications}
        config={config}
      />

      {/* Settings Modal */}
      <DetalleSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
