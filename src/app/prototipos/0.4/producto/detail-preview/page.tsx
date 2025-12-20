'use client';

/**
 * Product Detail Preview Page - BaldeCash v0.4
 *
 * Configurable preview with settings modal and TokenCounter
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { Settings, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ProductDetailConfig, defaultDetailConfig, DetailVersion } from '../types/detail';
import { ProductDetail } from '../components/detail/ProductDetail';
import { DetailSettingsModal } from '../components/detail/DetailSettingsModal';
import { TokenCounter } from '@/components/ui/TokenCounter';

export default function DetailPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case 'o':
          setShowOverlays(prev => !prev);
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setIsSettingsOpen(true);
          }
          break;
        case 'escape':
          setIsSettingsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleConfigChange = (newConfig: ProductDetailConfig) => {
    setConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
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
      {showOverlays && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-wrap justify-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-neutral-200">
          <span className="text-xs bg-[#4654CD]/10 text-[#4654CD] px-2 py-1 rounded">
            Info: V{config.infoHeaderVersion}
          </span>
          <span className="text-xs bg-[#4654CD]/10 text-[#4654CD] px-2 py-1 rounded">
            Gallery: V{config.galleryVersion}
          </span>
          <span className="text-xs bg-[#4654CD]/10 text-[#4654CD] px-2 py-1 rounded">
            Tabs: V{config.tabsVersion}
          </span>
          <span className="text-xs bg-[#4654CD]/10 text-[#4654CD] px-2 py-1 rounded">
            Specs: V{config.specsVersion}
          </span>
          <span className="text-xs bg-[#4654CD]/10 text-[#4654CD] px-2 py-1 rounded">
            Pricing: V{config.pricingVersion}
          </span>
          <span className="text-xs bg-[#4654CD]/10 text-[#4654CD] px-2 py-1 rounded">
            Similar: V{config.similarProductsVersion}
          </span>
          <span className="text-xs bg-[#4654CD]/10 text-[#4654CD] px-2 py-1 rounded">
            Limits: V{config.limitationsVersion}
          </span>
          <span className="text-xs bg-[#4654CD]/10 text-[#4654CD] px-2 py-1 rounded">
            Certs: V{config.certificationsVersion}
          </span>
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
      {showOverlays && (
        <div className="fixed bottom-6 left-6 z-50 text-xs text-neutral-400 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow border border-neutral-200">
          <p><kbd className="bg-neutral-100 px-1 rounded">S</kbd> Settings</p>
          <p><kbd className="bg-neutral-100 px-1 rounded">O</kbd> Toggle overlays</p>
          <p><kbd className="bg-neutral-100 px-1 rounded">Esc</kbd> Close modal</p>
        </div>
      )}
    </div>
  );
}
