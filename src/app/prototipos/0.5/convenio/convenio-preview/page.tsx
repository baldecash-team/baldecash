'use client';

/**
 * Convenio Preview v0.5
 * Configuración fija con selector de convenio
 * Botones flotantes estándar v0.5
 */

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { ArrowLeft, Code, RefreshCw } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton, CubeGridSpinner } from '@/app/prototipos/_shared';
import { ConvenioLanding } from '../components/convenio/ConvenioLanding';
import { convenios, getConvenioBySlug, defaultConvenio } from '../data/mockConvenioData';

const FIXED_CONFIG = {
  navbar: 'V3 - Banner de descuento',
  hero: 'V2 - Imagen de campus',
  benefits: 'V1 - Cards Grid',
  testimonials: 'V1 - Cards Grid 3 columnas',
  faq: 'V2 - Acordeón con iconos',
  cta: 'V6 - WhatsApp directo',
  footer: 'V2 - Minimalista centrado',
};

function ConvenioPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Preloading: dar tiempo a la página para cargar recursos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Get convenio from URL or use default
  const convenioSlug = searchParams.get('convenio');
  const initialConvenio = convenioSlug ? getConvenioBySlug(convenioSlug) : defaultConvenio;
  const [selectedConvenio, setSelectedConvenio] = useState(initialConvenio || defaultConvenio);

  const handleConvenioChange = (slug: string) => {
    const newConvenio = getConvenioBySlug(slug);
    if (newConvenio) {
      setSelectedConvenio(newConvenio);
      const params = new URLSearchParams(searchParams.toString());
      params.set('convenio', slug);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  // Show loading while preloading
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Render content with floating controls
  return (
    <div className="relative">
      <ConvenioLanding convenio={selectedConvenio} isCleanMode={isCleanMode} />

      {/* Floating Convenio Switcher - Bottom Left (always visible) */}
      <div className="fixed bottom-6 left-6 z-[100]">
        <Popover placement="top-start" offset={10}>
          <PopoverTrigger>
            <Button
              className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors gap-2 px-3"
              radius="lg"
            >
              <img
                src={selectedConvenio.logo}
                alt={selectedConvenio.nombreCorto}
                className="h-6 w-6 object-contain"
              />
              <span className="text-sm font-medium text-neutral-700 hidden sm:inline">
                {selectedConvenio.nombreCorto}
              </span>
              <RefreshCw className="w-4 h-4 text-neutral-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-3 bg-white shadow-xl border border-neutral-100">
            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-500 px-1">Cambiar convenio</p>
              <div className="grid grid-cols-3 gap-2">
                {convenios.map((conv) => (
                  <button
                    key={conv.slug}
                    onClick={() => handleConvenioChange(conv.slug)}
                    className={`
                      w-14 h-14 rounded-xl border-2 flex items-center justify-center p-2
                      transition-all cursor-pointer hover:scale-105
                      ${selectedConvenio.slug === conv.slug
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }
                    `}
                  >
                    <img
                      src={conv.logo}
                      alt={conv.nombreCorto}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Floating Action Buttons - hidden in clean mode */}
      {!isCleanMode && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
          <TokenCounter sectionId="PROMPT_CONVENIO" version="0.5" />
          <Button
            isIconOnly
            radius="md"
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => setShowConfig(!showConfig)}
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
      )}

      {/* Config Panel - hidden in clean mode */}
      {!isCleanMode && showConfig && (
        <div className="fixed bottom-20 right-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-3 border border-neutral-200 max-w-sm">
          <p className="text-xs text-neutral-500 mb-2">Configuración fija v0.5:</p>
          <div className="space-y-1 text-xs">
            {Object.entries(FIXED_CONFIG).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4">
                <span className="text-neutral-400 capitalize">{key}:</span>
                <span className="font-mono text-neutral-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Button - only in clean mode */}
      {isCleanMode && (
        <FeedbackButton sectionId="convenio" />
      )}
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

export default function ConvenioPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConvenioPreviewContent />
    </Suspense>
  );
}
