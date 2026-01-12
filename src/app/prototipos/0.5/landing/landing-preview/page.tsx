'use client';

/**
 * Landing Preview v0.5
 * Selector de versiones: Original, Countdown, Regalo, Flash Sale
 * Configurador tipo Catálogo con modal de settings
 */

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { ArrowLeft, Code, Loader2, Settings } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton } from '@/app/prototipos/_shared';
import { LandingPage } from '../components/landing';
import { PromoLandingV1, PromoLandingV2, PromoLandingV3 } from '../components/landing/promo';
import {
  LandingSettingsModal,
  LANDING_VERSIONS,
  type LandingVersion,
} from '../components/landing/LandingSettingsModal';
import {
  defaultCampaign,
  promoProductCountdown,
  promoProductGift,
  promoGift,
  promoProductFlash,
  getPromoEndDate,
  regions,
  instituciones,
} from '../data/mockLandingData';

function LandingPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';

  // Read version from URL params
  const versionParam = searchParams.get('version') as LandingVersion | null;
  const initialVersion: LandingVersion =
    versionParam && ['original', 'countdown', 'gift', 'flash'].includes(versionParam)
      ? versionParam
      : 'original';

  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<LandingVersion>(initialVersion);
  const [isLoading, setIsLoading] = useState(true);

  // Preloading: dar tiempo a la página para cargar recursos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Get current version data
  const currentVersionData = LANDING_VERSIONS.find((v) => v.id === currentVersion)!;

  // Update URL when version changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentVersion !== 'original') {
      params.set('version', currentVersion);
    } else {
      params.delete('version');
    }

    // Preserve mode param
    if (isCleanMode) {
      params.set('mode', 'clean');
    }

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  }, [currentVersion, isCleanMode, router, searchParams]);

  // Render landing based on version
  const renderLanding = () => {
    const commonProps = {
      regions,
      instituciones,
      colorPrimario: defaultCampaign.colorPrimario,
    };

    switch (currentVersion) {
      case 'countdown':
        return (
          <PromoLandingV1
            product={promoProductCountdown}
            endDate={getPromoEndDate()}
            {...commonProps}
          />
        );
      case 'gift':
        return (
          <PromoLandingV2
            product={promoProductGift}
            gift={promoGift}
            {...commonProps}
          />
        );
      case 'flash':
        return (
          <PromoLandingV3
            product={promoProductFlash}
            {...commonProps}
          />
        );
      default:
        return <LandingPage campaign={defaultCampaign} isCleanMode={isCleanMode} />;
    }
  };

  // Show loading while preloading
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Clean mode: only content + feedback button
  if (isCleanMode) {
    return (
      <>
        {renderLanding()}
        <FeedbackButton
          sectionId="landing"
          config={{ version: currentVersion }}
        />
      </>
    );
  }

  // Normal mode: content + floating controls
  return (
    <div className="relative">
      {renderLanding()}

      {/* Floating Action Buttons - Right */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_LANDING" version="0.5" />
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

      {/* Config Badge - Left (like Catalog) */}
      {showConfigBadge && (
        <div className="fixed bottom-20 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200 max-w-md">
          <p className="text-xs text-neutral-500 mb-1">Configuración v0.5:</p>
          <p className="text-xs font-mono text-neutral-700">
            Versión: {currentVersionData.label} | {currentVersionData.description}
          </p>
        </div>
      )}

      {/* Settings Modal */}
      <LandingSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentVersion={currentVersion}
        onVersionChange={setCurrentVersion}
      />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#4654CD]" />
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
