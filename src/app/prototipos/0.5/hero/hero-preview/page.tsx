'use client';

/**
 * Hero Preview v0.5
 * Basado en v0.4 con configuración fija:
 * - Navbar: V6 (Banner Promocional)
 * - HeroBanner: V2 (Lifestyle Aspiracional)
 * - SocialProof: V1 (Marquee + Testimonios)
 * - HowItWorks: V5 (Con Requisitos)
 * - CTA: V4 (WhatsApp Directo)
 * - FAQ: V2 (Acordeón con Iconos)
 * - Footer: V2 (Newsletter + Columnas)
 *
 * Sin iteraciones - diseño único optimizado
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { ArrowLeft, Code } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton, CubeGridSpinner } from '@/app/prototipos/_shared';

// Hero Section component
import { HeroSection } from '../components/hero';

// Fixed config for display
const fixedConfig = {
  navbar: 'V6 (Banner Promocional)',
  hero: 'V2 (Lifestyle)',
  social: 'V1 (Marquee)',
  how: 'V5 (Con Requisitos)',
  cta: 'V4 (WhatsApp)',
  faq: 'V2 (Acordeón Iconos)',
  footer: 'V2 (Newsletter)',
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export default function HeroPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HeroPreviewContent />
    </Suspense>
  );
}

function HeroPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';

  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Preloading: dar tiempo a la página para cargar recursos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while preloading
  if (isLoading) {
    return <LoadingFallback />;
  }

  // In clean mode, just render the hero section without controls
  if (isCleanMode) {
    return (
      <>
        <HeroSection isCleanMode={isCleanMode} />
        <FeedbackButton sectionId="hero" />
      </>
    );
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <HeroSection isCleanMode={isCleanMode} />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_01" version="0.5" />
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
          <p className="text-xs text-neutral-500 mb-2">Configuración fija v0.5:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-neutral-400">Navbar:</span>
            <span className="font-mono text-neutral-700">V6</span>
            <span className="text-neutral-400">Hero:</span>
            <span className="font-mono text-neutral-700">V2</span>
            <span className="text-neutral-400">Social:</span>
            <span className="font-mono text-neutral-700">V1</span>
            <span className="text-neutral-400">How:</span>
            <span className="font-mono text-neutral-700">V5</span>
            <span className="text-neutral-400">CTA:</span>
            <span className="font-mono text-neutral-700">V4</span>
            <span className="text-neutral-400">FAQ:</span>
            <span className="font-mono text-neutral-700">V2</span>
            <span className="text-neutral-400">Footer:</span>
            <span className="font-mono text-neutral-700">V2</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">Sin iteraciones</p>
        </div>
      )}

    </div>
  );
}
