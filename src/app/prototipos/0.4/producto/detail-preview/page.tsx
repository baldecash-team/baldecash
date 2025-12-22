'use client';

/**
 * Product Detail Preview Page - BaldeCash v0.4
 *
 * Configurable preview with settings modal, TokenCounter, and keyboard shortcuts
 *
 * Keyboard Shortcuts:
 * - 1-6: Change active component version
 * - Tab / Shift+Tab: Navigate between components
 * - S / K / ?: Open/close settings
 * - O: Toggle overlays
 * - Esc: Close modal
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { Settings, Eye, ArrowLeft, Code } from 'lucide-react';
import { ProductDetailConfig, defaultDetailConfig, DetailVersion } from '../types/detail';
import { ProductDetail } from '../components/detail/ProductDetail';
import { DetailSettingsModal } from '../components/detail/DetailSettingsModal';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { useDetailKeyboardShortcuts } from '../hooks';
import { ShortcutToast, ShortcutHelpBadge } from '@/app/prototipos/0.4/hero/components/hero/common/ShortcutToast';

function DetailPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  // Initialize config from URL params or defaults
  const [config, setConfig] = useState<ProductDetailConfig>(() => {
    const infoHeader = parseInt(searchParams.get('infoHeader') || '1') as DetailVersion;
    const gallery = parseInt(searchParams.get('gallery') || '1') as DetailVersion;
    const tabs = parseInt(searchParams.get('tabs') || '1') as DetailVersion;
    const specs = parseInt(searchParams.get('specs') || '1') as DetailVersion;
    const pricing = parseInt(searchParams.get('pricing') || '1') as DetailVersion;
    const cronograma = parseInt(searchParams.get('cronograma') || '1') as DetailVersion;
    const similar = parseInt(searchParams.get('similar') || '1') as DetailVersion;
    const limitations = parseInt(searchParams.get('limitations') || '1') as DetailVersion;
    const certifications = parseInt(searchParams.get('certifications') || '1') as DetailVersion;

    return {
      infoHeaderVersion: infoHeader,
      galleryVersion: gallery,
      tabsVersion: tabs,
      specsVersion: specs,
      pricingVersion: pricing,
      cronogramaVersion: cronograma,
      similarProductsVersion: similar,
      limitationsVersion: limitations,
      certificationsVersion: certifications,
    };
  });

  // Use keyboard shortcuts hook
  const { activeComponent, toast, COMPONENT_LABELS } = useDetailKeyboardShortcuts({
    config,
    onConfigChange: setConfig,
    onOpenSettings: () => setIsSettingsOpen(true),
    onCloseSettings: () => setIsSettingsOpen(false),
    isSettingsOpen,
  });

  // Update URL when config changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('infoHeader', config.infoHeaderVersion.toString());
    params.set('gallery', config.galleryVersion.toString());
    params.set('tabs', config.tabsVersion.toString());
    params.set('specs', config.specsVersion.toString());
    params.set('pricing', config.pricingVersion.toString());
    params.set('cronograma', config.cronogramaVersion.toString());
    params.set('similar', config.similarProductsVersion.toString());
    params.set('limitations', config.limitationsVersion.toString());
    params.set('certifications', config.certificationsVersion.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [config, router]);

  // Toggle overlays with O key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key.toLowerCase() === 'o' && !isSettingsOpen) {
        setShowOverlays(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen]);

  const handleConfigChange = (newConfig: ProductDetailConfig) => {
    setConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Keyboard Shortcut Toast */}
      <ShortcutToast message={toast?.message || null} type={toast?.type} />

      {/* Shortcut Help Badge */}
      {showOverlays && (
        <ShortcutHelpBadge activeComponent={COMPONENT_LABELS[activeComponent as keyof typeof COMPONENT_LABELS] || activeComponent} />
      )}

      {/* Main content */}
      <ProductDetail config={config} />

      {/* Floating action buttons */}
      {showOverlays && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
          <TokenCounter
            sectionId="PROMPT_04"
            version="0.4"
          />
          <Button
            isIconOnly
            className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
            onPress={() => setIsSettingsOpen(true)}
            aria-label="Configuración"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            isIconOnly
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => setShowConfigBadge(!showConfigBadge)}
            aria-label="Mostrar configuración"
          >
            <Code className="w-5 h-5 text-neutral-600" />
          </Button>
          <Button
            isIconOnly
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => router.push('/prototipos/0.4')}
            aria-label="Volver al índice"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Button>
        </div>
      )}

      {/* Current Config Badge */}
      {showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
          <p className="text-xs font-mono text-neutral-700">
            Info: V{config.infoHeaderVersion} | Gallery: V{config.galleryVersion} | Tabs: V{config.tabsVersion} | Specs: V{config.specsVersion} | Pricing: V{config.pricingVersion} | Crono: V{config.cronogramaVersion} | Similar: V{config.similarProductsVersion} | Limits: V{config.limitationsVersion} | Certs: V{config.certificationsVersion}
          </p>
        </div>
      )}

      {/* Toggle overlay button when hidden */}
      {!showOverlays && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <Button
            isIconOnly
            className="bg-white/80 shadow-lg border border-neutral-200 cursor-pointer hover:bg-white transition-colors"
            onPress={() => setShowOverlays(true)}
          >
            <Eye className="w-5 h-5 text-neutral-600" />
          </Button>
        </div>
      )}

      {/* Settings Modal */}
      <DetailSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={handleConfigChange}
      />

    </div>
  );
}

export default function DetailPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-500">Cargando...</div>
      </div>
    }>
      <DetailPreviewContent />
    </Suspense>
  );
}
