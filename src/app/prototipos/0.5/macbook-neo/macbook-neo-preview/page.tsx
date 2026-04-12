'use client';

/**
 * MacBook Neo Preview v0.5
 *
 * Configuración ITERABLE:
 * - Color por defecto (Citrus, Rubor, Índigo, Plata)
 * - Velocidad de scroll (Normal 400vh, Lento 500vh)
 *
 * Configuración FIJA:
 * - Hero, Highlights, Specs, Financing, HowItWorks, CTA Final
 */

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { ArrowLeft, Code, Settings } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton, CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';

import { MacbookNeoLanding } from '../components/macbook-neo';
import { MacbookNeoSettingsModal } from '../components/macbook-neo';
import {
  MacbookNeoConfig,
  MacbookNeoColor,
  ScrollSpeedVersion,
  defaultMacbookNeoConfig,
  colorLabels,
  scrollSpeedLabels,
} from '../types/macbook-neo';

function MacbookNeoPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';

  useScrollToTop();

  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Config state - read from URL params
  const [config, setConfig] = useState<MacbookNeoConfig>(() => {
    const colorParam = searchParams.get('color');
    const speedParam = searchParams.get('speed');

    const validColors: MacbookNeoColor[] = ['citrus', 'blush', 'indigo', 'silver'];
    const validSpeeds: ScrollSpeedVersion[] = [1, 2];

    const selectedColor = colorParam && validColors.includes(colorParam as MacbookNeoColor)
      ? (colorParam as MacbookNeoColor)
      : defaultMacbookNeoConfig.selectedColor;

    const scrollSpeed = speedParam && validSpeeds.includes(parseInt(speedParam) as ScrollSpeedVersion)
      ? (parseInt(speedParam) as ScrollSpeedVersion)
      : defaultMacbookNeoConfig.scrollSpeed;

    return { selectedColor, scrollSpeed };
  });

  // Preloading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Update URL when config changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (config.selectedColor !== defaultMacbookNeoConfig.selectedColor) {
      params.set('color', config.selectedColor);
    }
    if (config.scrollSpeed !== defaultMacbookNeoConfig.scrollSpeed) {
      params.set('speed', config.scrollSpeed.toString());
    }
    if (isCleanMode) params.set('mode', 'clean');
    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  }, [config.selectedColor, config.scrollSpeed, router, isCleanMode]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  // Clean mode: only content + feedback button
  if (isCleanMode) {
    return (
      <>
        <MacbookNeoLanding
          selectedColor={config.selectedColor}
          scrollSpeed={config.scrollSpeed}
          isCleanMode={isCleanMode}
        />
        <FeedbackButton sectionId="macbook-neo" />
      </>
    );
  }

  // Normal mode: content + floating controls
  return (
    <div className="relative">
      <MacbookNeoLanding
        selectedColor={config.selectedColor}
        scrollSpeed={config.scrollSpeed}
        isCleanMode={isCleanMode}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_MACBOOK_NEO" version="0.5" />
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
            <span className="text-neutral-400">Color:</span>
            <span className="font-mono text-neutral-700">
              {colorLabels[config.selectedColor].name}
            </span>
            <span className="text-neutral-400">Scroll:</span>
            <span className="font-mono text-neutral-700">
              {scrollSpeedLabels[config.scrollSpeed].name} ({config.scrollSpeed === 1 ? '400vh' : '500vh'})
            </span>
            <span className="text-neutral-400 col-span-2 pt-1 border-t border-neutral-200 mt-1">Secciones fijas:</span>
            <span className="text-neutral-400">Hero:</span>
            <span className="font-mono text-neutral-700">V1</span>
            <span className="text-neutral-400">Storytelling:</span>
            <span className="font-mono text-neutral-700">V1</span>
            <span className="text-neutral-400">Highlights:</span>
            <span className="font-mono text-neutral-700">V1</span>
            <span className="text-neutral-400">Specs:</span>
            <span className="font-mono text-neutral-700">V1</span>
            <span className="text-neutral-400">Financiamiento:</span>
            <span className="font-mono text-neutral-700">V1</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            {4 * 2} combinaciones posibles (4 colores × 2 velocidades)
          </p>
        </div>
      )}

      {/* Settings Modal */}
      <MacbookNeoSettingsModal
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

export default function MacbookNeoPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MacbookNeoPreviewContent />
    </Suspense>
  );
}
