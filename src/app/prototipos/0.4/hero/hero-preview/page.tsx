'use client';

/**
 * Hero Preview Page - Configurable demo for all hero versions
 *
 * Query Parameters:
 * - navbar=1-6: Navbar version
 * - hero=1-6: Hero banner version
 * - social=1-6: Social proof version
 * - how=1-6: How it works version
 * - cta=1-6: CTA version
 * - faq=1-6: FAQ version
 * - footer=1-6: Footer version
 * - underline=1-6: Underline style
 * - mode=clean: Hide all configuration controls
 *
 * Keyboard Shortcuts (when not in clean mode):
 * - 1-6: Change active component version
 * - Shift + 1-6: Change underline style
 * - Tab / Shift+Tab: Navigate between components
 * - ? or K: Open/close settings
 * - Esc: Close modal
 */

import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, Code, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeroSection, HeroSettingsModal } from '../components/hero';
import { HeroConfig, defaultHeroConfig, HeroVersion, UnderlineStyle } from '../types/hero';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { useKeyboardShortcuts } from '../hooks';
import { ShortcutToast, ShortcutHelpBadge } from '../components/hero/common/ShortcutToast';

const COMPONENT_LABELS: Record<string, string> = {
  navbar: 'Navbar',
  heroBanner: 'Hero Banner',
  socialProof: 'Social Proof',
  howItWorks: 'Cómo Funciona',
  cta: 'CTA',
  faq: 'FAQ',
  footer: 'Footer',
};

const parseVersion = (value: string | null): HeroVersion | null => {
  if (!value) return null;
  const num = parseInt(value, 10);
  if (num >= 1 && num <= 6) return num as HeroVersion;
  return null;
};

function HeroPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse query params
  const isCleanMode = searchParams.get('mode') === 'clean';

  const getInitialConfig = (): HeroConfig => {
    return {
      navbarVersion: parseVersion(searchParams.get('navbar')) || defaultHeroConfig.navbarVersion,
      heroBannerVersion: parseVersion(searchParams.get('hero')) || defaultHeroConfig.heroBannerVersion,
      socialProofVersion: parseVersion(searchParams.get('social')) || defaultHeroConfig.socialProofVersion,
      howItWorksVersion: parseVersion(searchParams.get('how')) || defaultHeroConfig.howItWorksVersion,
      ctaVersion: parseVersion(searchParams.get('cta')) || defaultHeroConfig.ctaVersion,
      faqVersion: parseVersion(searchParams.get('faq')) || defaultHeroConfig.faqVersion,
      footerVersion: parseVersion(searchParams.get('footer')) || defaultHeroConfig.footerVersion,
      underlineStyle: (parseVersion(searchParams.get('underline')) as UnderlineStyle) || defaultHeroConfig.underlineStyle,
    };
  };

  const [config, setConfig] = useState<HeroConfig>(getInitialConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  // Update config when URL params change (initial load)
  useEffect(() => {
    setConfig(getInitialConfig());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when config changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Only include params that differ from defaults
    if (config.navbarVersion !== defaultHeroConfig.navbarVersion) {
      params.set('navbar', config.navbarVersion.toString());
    }
    if (config.heroBannerVersion !== defaultHeroConfig.heroBannerVersion) {
      params.set('hero', config.heroBannerVersion.toString());
    }
    if (config.socialProofVersion !== defaultHeroConfig.socialProofVersion) {
      params.set('social', config.socialProofVersion.toString());
    }
    if (config.howItWorksVersion !== defaultHeroConfig.howItWorksVersion) {
      params.set('how', config.howItWorksVersion.toString());
    }
    if (config.ctaVersion !== defaultHeroConfig.ctaVersion) {
      params.set('cta', config.ctaVersion.toString());
    }
    if (config.faqVersion !== defaultHeroConfig.faqVersion) {
      params.set('faq', config.faqVersion.toString());
    }
    if (config.footerVersion !== defaultHeroConfig.footerVersion) {
      params.set('footer', config.footerVersion.toString());
    }
    if (config.underlineStyle !== defaultHeroConfig.underlineStyle) {
      params.set('underline', config.underlineStyle.toString());
    }

    // Preserve clean mode if set
    if (isCleanMode) {
      params.set('mode', 'clean');
    }

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  }, [config, router, isCleanMode]);

  const { activeComponent, toast } = useKeyboardShortcuts({
    config,
    onConfigChange: setConfig,
    onOpenSettings: () => !isCleanMode && setIsSettingsOpen(true),
    onCloseSettings: () => setIsSettingsOpen(false),
    isSettingsOpen,
  });

  // In clean mode, just render the hero section without controls
  if (isCleanMode) {
    return <HeroSection config={config} />;
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <HeroSection config={config} />

      {/* Keyboard Shortcut Toast */}
      <ShortcutToast message={toast?.message || null} type={toast?.type} />

      {/* Shortcut Help Badge */}
      <ShortcutHelpBadge activeComponent={COMPONENT_LABELS[activeComponent] || activeComponent} />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_01" version="0.4" />
        <Button
          isIconOnly
          radius="md"
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
          onPress={() => setIsSettingsOpen(true)}
          aria-label="Abrir configuración (presiona ?)"
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
          onPress={() => router.push('/prototipos/0.4')}
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
      </div>

      {/* Settings Modal */}
      <HeroSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />

      {/* Current Config Badge */}
      {showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
          <p className="text-xs font-mono text-neutral-700">
            Banner: V{config.heroBannerVersion} | Social: V{config.socialProofVersion} | Nav: V{config.navbarVersion} | CTA: V{config.ctaVersion} | Footer: V{config.footerVersion}
          </p>
        </div>
      )}
    </div>
  );
}

export default function HeroPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HeroPreviewContent />
    </Suspense>
  );
}
