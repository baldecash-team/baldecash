'use client';

/**
 * Hero Preview Page - Configurable demo for all hero versions
 *
 * Keyboard Shortcuts:
 * - 1-6: Change active component version
 * - Shift + 1-6: Change underline style
 * - Tab / Shift+Tab: Navigate between components
 * - ? or K: Open/close settings
 * - Esc: Close modal
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, Code, Keyboard, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HeroSection, HeroSettingsModal } from '../components/hero';
import { HeroConfig, defaultHeroConfig } from '../types/hero';
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

export default function HeroPreviewPage() {
  const router = useRouter();
  const [config, setConfig] = useState<HeroConfig>(defaultHeroConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  const { activeComponent, toast } = useKeyboardShortcuts({
    config,
    onConfigChange: setConfig,
    onOpenSettings: () => setIsSettingsOpen(true),
    onCloseSettings: () => setIsSettingsOpen(false),
    isSettingsOpen,
  });

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
