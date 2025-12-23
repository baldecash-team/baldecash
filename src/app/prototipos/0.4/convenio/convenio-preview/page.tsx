'use client';

/**
 * Convenio Landing Preview Page - BaldeCash v0.4
 * Configurable preview for A/B testing convenio landing page versions
 *
 * Keyboard Shortcuts:
 * - Tab / Shift+Tab: Navegar entre componentes
 * - 1-6: Cambiar versión del componente activo
 * - ? o K: Abrir/cerrar configuración
 * - Esc: Cerrar modal
 */

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { Settings, ArrowLeft, Code, Building2, Check } from 'lucide-react';

// Components
import { ConvenioLanding, ConvenioSettingsModal, ShortcutToast, ShortcutHelpBadge } from '../components';
import { TokenCounter } from '@/components/ui/TokenCounter';

// Hooks
import { useConvenioKeyboardShortcuts } from '../hooks';

// Types & Data
import {
  ConvenioConfig,
  ConvenioVersion,
  ConvenioData,
  defaultConvenioConfig,
} from '../types/convenio';
import { conveniosList, getConvenioBySlug, defaultConvenio } from '../data/mockConvenioData';

function ConvenioPreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedConvenio, setSelectedConvenio] = useState(defaultConvenio);

  // Clean mode - disables shortcuts and dev UI
  const isCleanMode = searchParams.get('mode') === 'clean';

  // Parse config from URL params
  const getConfigFromParams = (): ConvenioConfig => {
    const navbarVersion = parseInt(searchParams.get('navbar') || '1') as ConvenioVersion;
    const heroVersion = parseInt(searchParams.get('hero') || '1') as ConvenioVersion;
    const benefitsVersion = parseInt(searchParams.get('benefits') || '1') as ConvenioVersion;
    const testimonialsVersion = parseInt(searchParams.get('testimonials') || '1') as ConvenioVersion;
    const faqVersion = parseInt(searchParams.get('faq') || '1') as ConvenioVersion;
    const ctaVersion = parseInt(searchParams.get('cta') || '1') as ConvenioVersion;
    const footerVersion = parseInt(searchParams.get('footer') || '1') as ConvenioVersion;

    return {
      navbarVersion: Math.min(Math.max(navbarVersion, 1), 6) as ConvenioVersion,
      heroVersion: Math.min(Math.max(heroVersion, 1), 6) as ConvenioVersion,
      benefitsVersion: Math.min(Math.max(benefitsVersion, 1), 6) as ConvenioVersion,
      testimonialsVersion: Math.min(Math.max(testimonialsVersion, 1), 6) as ConvenioVersion,
      faqVersion: Math.min(Math.max(faqVersion, 1), 6) as ConvenioVersion,
      ctaVersion: Math.min(Math.max(ctaVersion, 1), 6) as ConvenioVersion,
      footerVersion: Math.min(Math.max(footerVersion, 1), 6) as ConvenioVersion,
    };
  };

  const [config, setConfig] = useState<ConvenioConfig>(getConfigFromParams);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  // Sync config with URL params (preserve mode param)
  const updateConfigAndUrl = (newConfig: ConvenioConfig) => {
    setConfig(newConfig);
    const params = new URLSearchParams();
    params.set('navbar', String(newConfig.navbarVersion));
    params.set('hero', String(newConfig.heroVersion));
    params.set('benefits', String(newConfig.benefitsVersion));
    params.set('testimonials', String(newConfig.testimonialsVersion));
    params.set('faq', String(newConfig.faqVersion));
    params.set('cta', String(newConfig.ctaVersion));
    params.set('footer', String(newConfig.footerVersion));
    // Preserve clean mode and convenio
    if (isCleanMode) params.set('mode', 'clean');
    const currentConvenio = searchParams.get('convenio');
    if (currentConvenio) params.set('convenio', currentConvenio);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Get initial convenio from URL
  useEffect(() => {
    const convenioSlug = searchParams.get('convenio');
    if (convenioSlug) {
      const found = getConvenioBySlug(convenioSlug);
      if (found) setSelectedConvenio(found);
    }
    setIsClient(true);
  }, [searchParams]);

  // Update convenio and URL (preserve mode param)
  const updateConvenioAndUrl = (newConvenio: ConvenioData) => {
    setSelectedConvenio(newConvenio);
    const params = new URLSearchParams();
    // Preserve all config params
    params.set('navbar', String(config.navbarVersion));
    params.set('hero', String(config.heroVersion));
    params.set('benefits', String(config.benefitsVersion));
    params.set('testimonials', String(config.testimonialsVersion));
    params.set('faq', String(config.faqVersion));
    params.set('cta', String(config.ctaVersion));
    params.set('footer', String(config.footerVersion));
    params.set('convenio', newConvenio.slug);
    if (isCleanMode) params.set('mode', 'clean');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Keyboard shortcuts hook (disabled in clean mode)
  const { activeComponent, toast } = useConvenioKeyboardShortcuts({
    config,
    onConfigChange: updateConfigAndUrl,
    onOpenSettings: () => setIsSettingsOpen(true),
    onCloseSettings: () => setIsSettingsOpen(false),
    isSettingsOpen,
    enabled: !isCleanMode,
  });

  // Component labels for display
  const componentLabels: Record<string, string> = {
    navbar: 'Navbar',
    hero: 'Hero',
    benefits: 'Beneficios',
    testimonials: 'Testimonios',
    footer: 'Footer',
    faq: 'FAQ',
    cta: 'CTA',
  };

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
    <div className="relative">
      {/* Keyboard shortcut toast - hidden in clean mode */}
      {!isCleanMode && <ShortcutToast message={toast?.message || null} type={toast?.type} />}

      {/* Active component badge - hidden in clean mode */}
      {!isCleanMode && <ShortcutHelpBadge activeComponent={componentLabels[activeComponent] || activeComponent} />}

      {/* Main content */}
      <ConvenioLanding
        initialConfig={config}
        initialConvenio={selectedConvenio}
        showOverlaysDefault={false}
        controlled={true}
      />

      {/* Floating Convenio Selector - Always visible */}
      <div className="fixed bottom-6 left-6 z-[100]">
        <Popover placement="top-start">
          <PopoverTrigger>
            <Button
              size="sm"
              className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors gap-2 px-3"
              startContent={<Building2 className="w-4 h-4 text-[#4654CD]" />}
            >
              <span className="text-sm font-medium text-neutral-700">{selectedConvenio.nombreCorto}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 max-h-64 overflow-y-auto">
            <div className="flex flex-col gap-1 min-w-[180px]">
              <p className="text-xs text-neutral-500 px-2 py-1 font-medium">Cambiar convenio</p>
              {conveniosList.map((conv) => (
                <button
                  key={conv.slug}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    selectedConvenio.slug === conv.slug
                      ? 'bg-[#4654CD]/10 text-[#4654CD]'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                  onClick={() => updateConvenioAndUrl(conv)}
                >
                  <img
                    src={conv.logo}
                    alt={conv.nombre}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <span className="text-sm font-medium flex-1">{conv.nombreCorto}</span>
                  {selectedConvenio.slug === conv.slug && (
                    <Check className="w-4 h-4 text-[#4654CD]" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Floating controls - hidden in clean mode */}
      {!isCleanMode && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
          <TokenCounter sectionId="PROMPT_17" version="0.4" />
          <Button
            isIconOnly
            className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
            onPress={() => setIsSettingsOpen(true)}
            aria-label="Configuración"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            isIconOnly
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => setShowConfigBadge(!showConfigBadge)}
            aria-label="Mostrar configuración"
          >
            <Code className="w-5 h-5 text-neutral-600" />
          </Button>
          <Button
            isIconOnly
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => router.push('/prototipos/0.4')}
            aria-label="Volver al índice"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Button>
        </div>
      )}

      {/* Current Config Badge - hidden in clean mode */}
      {!isCleanMode && showConfigBadge && (
        <div className="fixed bottom-20 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
          <p className="text-xs font-mono text-neutral-700">
            Navbar: V{config.navbarVersion} | Hero: V{config.heroVersion} | Benefits: V{config.benefitsVersion} | Testimonials: V{config.testimonialsVersion} | FAQ: V{config.faqVersion} | CTA: V{config.ctaVersion} | Footer: V{config.footerVersion}
          </p>
        </div>
      )}

      {/* Settings Modal - hidden in clean mode */}
      {!isCleanMode && (
        <ConvenioSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={config}
          onConfigChange={updateConfigAndUrl}
          convenio={selectedConvenio}
          onConvenioChange={updateConvenioAndUrl}
          conveniosList={conveniosList}
        />
      )}
    </div>
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
