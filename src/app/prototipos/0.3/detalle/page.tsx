'use client';

/**
 * Detalle de Producto - Preview Page v0.3
 *
 * Pagina de preview con selector de versiones
 * para cada componente del detalle de producto.
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
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
import { FloatingControls } from '@/app/prototipos/_shared/components/FloatingControls';

export default function DetallePreviewPage() {
  const [config, setConfig] = useState<DetailConfig>(defaultDetailConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Back to prototypes */}
      <div className="fixed top-4 left-4 z-[60]">
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

      {/* Main Content */}
      <ProductDetailComponent
        product={mockProductDetail}
        similarProducts={mockSimilarProducts}
        limitations={mockLimitations}
        certifications={mockCertifications}
        config={config}
      />

      {/* Floating Controls */}
      <FloatingControls
        config={config}
        onSettingsClick={() => setIsSettingsOpen(true)}
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
