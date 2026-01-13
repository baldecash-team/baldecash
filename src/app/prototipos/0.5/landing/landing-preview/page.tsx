'use client';

/**
 * Landing Preview v0.5
 * Estructura igual a Hero pero con CaptacionBanner iterable
 *
 * Configuración ITERABLE:
 * - Layout (L1-L6): Estructura visual del banner
 * - Mensaje (V1-V3): Contenido/gancho del banner
 *
 * Configuración FIJA:
 * - Navbar, SocialProof, HowItWorks, CTA, FAQ, Footer
 */

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { ArrowLeft, Code, Settings } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton, CubeGridSpinner } from '@/app/prototipos/_shared';

import { LandingSection } from '../components/landing/LandingSection';
import { LandingSettingsModal } from '../components/landing/LandingSettingsModal';
import {
  LandingConfig,
  BannerVersion,
  LayoutVersion,
  defaultLandingConfig,
  bannerVersionLabels,
  layoutVersionLabels,
} from '../types/landing';

function LandingPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';

  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Config state - read from URL params
  const [config, setConfig] = useState<LandingConfig>(() => {
    const layoutParam = searchParams.get('layout');
    const bannerParam = searchParams.get('banner');

    const validLayoutVersions: LayoutVersion[] = [1, 2, 3, 4, 5, 6];
    const validBannerVersions: BannerVersion[] = [1, 2, 3];

    const layoutVersion = layoutParam && validLayoutVersions.includes(parseInt(layoutParam) as LayoutVersion)
      ? (parseInt(layoutParam) as LayoutVersion)
      : defaultLandingConfig.layoutVersion;

    const bannerVersion = bannerParam && validBannerVersions.includes(parseInt(bannerParam) as BannerVersion)
      ? (parseInt(bannerParam) as BannerVersion)
      : defaultLandingConfig.bannerVersion;

    return { layoutVersion, bannerVersion };
  });

  // Preloading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Update URL when config changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (config.layoutVersion !== defaultLandingConfig.layoutVersion) {
      params.set('layout', config.layoutVersion.toString());
    }
    if (config.bannerVersion !== defaultLandingConfig.bannerVersion) {
      params.set('banner', config.bannerVersion.toString());
    }
    if (isCleanMode) params.set('mode', 'clean');
    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  }, [config.layoutVersion, config.bannerVersion, router, isCleanMode]);

  // Show loading while preloading
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Clean mode: only content + feedback button
  if (isCleanMode) {
    return (
      <>
        <LandingSection
          layoutVersion={config.layoutVersion}
          bannerVersion={config.bannerVersion}
          isCleanMode={isCleanMode}
        />
        <FeedbackButton sectionId="landing" />
      </>
    );
  }

  // Normal mode: content + floating controls
  return (
    <div className="relative">
      <LandingSection
        layoutVersion={config.layoutVersion}
        bannerVersion={config.bannerVersion}
        isCleanMode={isCleanMode}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_LANDING" version="0.5" />
        <Button
          isIconOnly
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
          style={{ borderRadius: '14px' }}
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
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-3 border border-neutral-200 max-w-sm">
          <p className="text-xs text-neutral-500 mb-2">Configuración v0.5:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-neutral-400">Layout:</span>
            <span className="font-mono text-neutral-700">
              L{config.layoutVersion} - {layoutVersionLabels[config.layoutVersion].name}
            </span>
            <span className="text-neutral-400">Mensaje:</span>
            <span className="font-mono text-neutral-700">
              V{config.bannerVersion} - {bannerVersionLabels[config.bannerVersion].name}
            </span>
            <span className="text-neutral-400 col-span-2 pt-1 border-t border-neutral-200 mt-1">Componentes fijos:</span>
            <span className="text-neutral-400">SocialProof:</span>
            <span className="font-mono text-neutral-700">V1</span>
            <span className="text-neutral-400">HowItWorks:</span>
            <span className="font-mono text-neutral-700">V5</span>
            <span className="text-neutral-400">CTA:</span>
            <span className="font-mono text-neutral-700">V4</span>
            <span className="text-neutral-400">FAQ:</span>
            <span className="font-mono text-neutral-700">V2</span>
            <span className="text-neutral-400">Footer:</span>
            <span className="font-mono text-neutral-700">V2</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            18 combinaciones posibles (6 layouts × 3 mensajes)
          </p>
        </div>
      )}

      {/* Settings Modal */}
      <LandingSettingsModal
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
      <CubeGridSpinner />
    </div>
  );
}

export default function LandingPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LandingPreviewContent />
    </Suspense>
  );
}
