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

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { ArrowLeft, Code, Settings } from 'lucide-react';
import { ProductDetail } from '../components/detail/ProductDetail';
import { DetalleSettingsModal } from '../components/detail';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton, CubeGridSpinner } from '@/app/prototipos/_shared';

// Hero components (Navbar & Footer)
import { Navbar } from '@/app/prototipos/0.5/hero/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';
import {
  DetalleConfig,
  DeviceType,
  defaultDetalleConfig,
  deviceTypeLabels,
} from '../types/detail';

function DetailPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    const validDevices: DeviceType[] = ['laptop', 'tablet', 'celular'];
    const deviceType = deviceParam && validDevices.includes(deviceParam as DeviceType)
      ? (deviceParam as DeviceType)
      : defaultDetalleConfig.deviceType;

    return { deviceType };
  });

  // Update URL when config changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (config.deviceType !== defaultDetalleConfig.deviceType) {
      params.set('device', config.deviceType);
    }
    if (isCleanMode) params.set('mode', 'clean');
    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  }, [config.deviceType, router, isCleanMode]);

  // Fixed config for display (components)
  const componentConfig = {
    infoHeader: 'V3',
    gallery: 'V1',
    tabs: 'V1',
    specs: 'V2',
    pricing: 'V4',
    cronograma: 'V2',
    similar: 'V2',
    limitations: 'V6',
    certifications: 'V1',
    deviceType: config.deviceType,
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
        <main className="pt-24">
          <ProductDetail deviceType={config.deviceType} />
        </main>
        <Footer isCleanMode={isCleanMode} />
        <FeedbackButton
          sectionId="detalle"
          config={componentConfig as unknown as Record<string, unknown>}
          className="bottom-20 md:bottom-6"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar isCleanMode={isCleanMode} />
      <main className="pt-24">
        {/* Main content */}
        <ProductDetail deviceType={config.deviceType} />
      </main>
      <Footer isCleanMode={isCleanMode} />

      {/* Floating action buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_04" version="0.5" />
        <Button
          isIconOnly
          radius="md"
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
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
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner size="3rem" />
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
