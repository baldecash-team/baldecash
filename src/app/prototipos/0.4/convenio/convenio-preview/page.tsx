'use client';

/**
 * Convenio Landing Preview Page - BaldeCash v0.4
 * Configurable preview for A/B testing convenio landing page versions
 */

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConvenioLanding } from '../components/ConvenioLanding';
import { TokenCounter } from '@/components/ui/TokenCounter';
import {
  ConvenioConfig,
  ConvenioVersion,
  defaultConvenioConfig,
} from '../types/convenio';
import { conveniosList, getConvenioBySlug } from '../data/mockConvenioData';

function ConvenioPreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Parse config from URL params
  const getConfigFromParams = (): ConvenioConfig => {
    const navbarVersion = parseInt(searchParams.get('navbar') || '1') as ConvenioVersion;
    const heroVersion = parseInt(searchParams.get('hero') || '1') as ConvenioVersion;
    const benefitsVersion = parseInt(searchParams.get('benefits') || '1') as ConvenioVersion;
    const testimonialsVersion = parseInt(searchParams.get('testimonials') || '1') as ConvenioVersion;
    const faqVersion = parseInt(searchParams.get('faq') || '1') as ConvenioVersion;
    const ctaVersion = parseInt(searchParams.get('cta') || '1') as ConvenioVersion;

    return {
      navbarVersion: Math.min(Math.max(navbarVersion, 1), 6) as ConvenioVersion,
      heroVersion: Math.min(Math.max(heroVersion, 1), 6) as ConvenioVersion,
      benefitsVersion: Math.min(Math.max(benefitsVersion, 1), 6) as ConvenioVersion,
      testimonialsVersion: Math.min(Math.max(testimonialsVersion, 1), 6) as ConvenioVersion,
      faqVersion: Math.min(Math.max(faqVersion, 1), 6) as ConvenioVersion,
      ctaVersion: Math.min(Math.max(ctaVersion, 1), 6) as ConvenioVersion,
    };
  };

  // Get initial convenio from URL
  const getInitialConvenio = () => {
    const convenioSlug = searchParams.get('convenio');
    if (convenioSlug) {
      const found = getConvenioBySlug(convenioSlug);
      if (found) return found;
    }
    return conveniosList[0];
  };

  const config = getConfigFromParams();
  const initialConvenio = getInitialConvenio();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const params = new URLSearchParams(searchParams.toString());

      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          // Change all versions to the pressed number
          const version = e.key;
          params.set('navbar', version);
          params.set('hero', version);
          params.set('benefits', version);
          params.set('testimonials', version);
          params.set('faq', version);
          params.set('cta', version);
          router.replace(`?${params.toString()}`, { scroll: false });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchParams, router]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#4654CD] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Cargando preview...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConvenioLanding
        initialConfig={config}
        initialConvenio={initialConvenio}
        showOverlaysDefault={true}
      />

      {/* Token Counter */}
      <div className="fixed bottom-6 left-6 z-50">
        <TokenCounter sectionId="PROMPT_17" version="0.4" />
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur">
          Presiona <kbd className="bg-white/20 px-1.5 py-0.5 rounded mx-1">1-6</kbd> para cambiar todas las versiones
        </div>
      </div>
    </>
  );
}

export default function ConvenioPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#4654CD] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-500">Cargando preview...</p>
          </div>
        </div>
      }
    >
      <ConvenioPreviewContent />
    </Suspense>
  );
}
