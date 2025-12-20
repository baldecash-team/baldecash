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
import { Settings, Eye, EyeOff, ArrowLeft, Code, Keyboard, X } from 'lucide-react';
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
  const [showBadges, setShowBadges] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(true);

  // Initialize config from URL params or defaults
  const [config, setConfig] = useState<ProductDetailConfig>(() => {
    const infoHeader = parseInt(searchParams.get('infoHeader') || '1') as DetailVersion;
    const gallery = parseInt(searchParams.get('gallery') || '1') as DetailVersion;
    const tabs = parseInt(searchParams.get('tabs') || '1') as DetailVersion;
    const specs = parseInt(searchParams.get('specs') || '1') as DetailVersion;
    const pricing = parseInt(searchParams.get('pricing') || '1') as DetailVersion;
    const similar = parseInt(searchParams.get('similar') || '1') as DetailVersion;
    const limitations = parseInt(searchParams.get('limitations') || '1') as DetailVersion;
    const certifications = parseInt(searchParams.get('certifications') || '1') as DetailVersion;

    return {
      infoHeaderVersion: infoHeader,
      galleryVersion: gallery,
      tabsVersion: tabs,
      specsVersion: specs,
      pricingVersion: pricing,
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

      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          isIconOnly
          className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          onPress={() => router.push('/prototipos/0.4')}
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
      </div>

      {/* Version badges overlay */}
      {showOverlays && showBadges && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-wrap justify-center items-center gap-2 bg-white/95 backdrop-blur-sm pl-4 pr-2 py-2 rounded-lg shadow-lg border border-neutral-200 max-w-[90vw]">
          <span className={`text-xs px-2 py-1 rounded transition-all ${activeComponent === 'gallery' ? 'bg-[#4654CD] text-white ring-2 ring-[#4654CD]/50' : 'bg-[#4654CD]/10 text-[#4654CD]'}`}>
            Gallery: V{config.galleryVersion}
          </span>
          <span className={`text-xs px-2 py-1 rounded transition-all ${activeComponent === 'infoHeader' ? 'bg-[#4654CD] text-white ring-2 ring-[#4654CD]/50' : 'bg-[#4654CD]/10 text-[#4654CD]'}`}>
            Info: V{config.infoHeaderVersion}
          </span>
          <span className={`text-xs px-2 py-1 rounded transition-all ${activeComponent === 'pricing' ? 'bg-[#4654CD] text-white ring-2 ring-[#4654CD]/50' : 'bg-[#4654CD]/10 text-[#4654CD]'}`}>
            Pricing: V{config.pricingVersion}
          </span>
          <span className={`text-xs px-2 py-1 rounded transition-all ${activeComponent === 'certifications' ? 'bg-[#4654CD] text-white ring-2 ring-[#4654CD]/50' : 'bg-[#4654CD]/10 text-[#4654CD]'}`}>
            Certs: V{config.certificationsVersion}
          </span>
          <span className={`text-xs px-2 py-1 rounded transition-all ${activeComponent === 'tabs' ? 'bg-[#4654CD] text-white ring-2 ring-[#4654CD]/50' : 'bg-[#4654CD]/10 text-[#4654CD]'}`}>
            Tabs: V{config.tabsVersion}
          </span>
          <span className={`text-xs px-2 py-1 rounded transition-all ${activeComponent === 'specs' ? 'bg-[#4654CD] text-white ring-2 ring-[#4654CD]/50' : 'bg-[#4654CD]/10 text-[#4654CD]'}`}>
            Specs: V{config.specsVersion}
          </span>
          <span className={`text-xs px-2 py-1 rounded transition-all ${activeComponent === 'similarProducts' ? 'bg-[#4654CD] text-white ring-2 ring-[#4654CD]/50' : 'bg-[#4654CD]/10 text-[#4654CD]'}`}>
            Similar: V{config.similarProductsVersion}
          </span>
          <span className={`text-xs px-2 py-1 rounded transition-all ${activeComponent === 'limitations' ? 'bg-[#4654CD] text-white ring-2 ring-[#4654CD]/50' : 'bg-[#4654CD]/10 text-[#4654CD]'}`}>
            Limits: V{config.limitationsVersion}
          </span>
          <button
            onClick={() => setShowBadges(false)}
            className="ml-2 p-1 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
            aria-label="Cerrar badges"
          >
            <X className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
          </button>
        </div>
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
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => {
              const configString = JSON.stringify(config, null, 2);
              navigator.clipboard.writeText(configString);
            }}
            aria-label="Copiar configuracion"
          >
            <Code className="w-5 h-5 text-neutral-600" />
          </Button>
          <Button
            isIconOnly
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => setShowOverlays(!showOverlays)}
          >
            {showOverlays ? <EyeOff className="w-5 h-5 text-neutral-600" /> : <Eye className="w-5 h-5 text-neutral-600" />}
          </Button>
          <Button
            isIconOnly
            className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
            onPress={() => setIsSettingsOpen(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
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

      {/* Keyboard shortcuts help */}
      {showOverlays && showShortcuts && (
        <div className="fixed bottom-6 left-6 z-50 text-xs text-neutral-500 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-neutral-200">
          <div className="flex items-center justify-between gap-4 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" />
              <span className="font-medium">Atajos</span>
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="p-0.5 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
              aria-label="Cerrar atajos"
            >
              <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-600" />
            </button>
          </div>
          <p><kbd className="bg-neutral-100 px-1 rounded text-neutral-700">Tab</kbd> Siguiente</p>
          <p><kbd className="bg-neutral-100 px-1 rounded text-neutral-700">1-6</kbd> Version</p>
          <p><kbd className="bg-neutral-100 px-1 rounded text-neutral-700">S</kbd> Settings</p>
          <p><kbd className="bg-neutral-100 px-1 rounded text-neutral-700">O</kbd> Overlays</p>
        </div>
      )}
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
