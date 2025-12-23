'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Spinner } from '@nextui-org/react';
import { Settings, Code, ArrowLeft } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { VersionNav, useKeyboardShortcuts } from '@/app/prototipos/_shared';

import { RejectionScreen, RejectionSettingsModal } from '../components/rejection';
import { RejectionConfig, defaultRejectionConfig } from '../types/rejection';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Spinner size="lg" color="primary" />
    </div>
  );
}

function RechazadoPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inicializar config desde URL params o defaults
  const [config, setConfig] = useState<RejectionConfig>(() => {
    const initial = { ...defaultRejectionConfig };

    // Leer parámetros de URL si existen
    const visual = searchParams.get('visual');
    const illustration = searchParams.get('illustration');
    const branding = searchParams.get('branding');
    const message = searchParams.get('message');
    const explanationDetail = searchParams.get('explanationDetail');
    const explanationFraming = searchParams.get('explanationFraming');
    const alternativesLayout = searchParams.get('alternativesLayout');
    const productAlternatives = searchParams.get('productAlternatives');
    const calculator = searchParams.get('calculator');
    const emailCapture = searchParams.get('emailCapture');
    const retryTimeline = searchParams.get('retryTimeline');
    const advisorCTA = searchParams.get('advisorCTA');
    const advisorMessage = searchParams.get('advisorMessage');

    if (visual) initial.visualVersion = parseInt(visual) as 1 | 2 | 3 | 4 | 5 | 6;
    if (illustration) initial.illustrationVersion = parseInt(illustration) as 1 | 2 | 3 | 4 | 5 | 6;
    if (branding) initial.brandingVersion = parseInt(branding) as 1 | 2 | 3 | 4 | 5 | 6;
    if (message) initial.messageVersion = parseInt(message) as 1 | 2 | 3 | 4 | 5 | 6;
    if (explanationDetail) initial.explanationDetailVersion = parseInt(explanationDetail) as 1 | 2 | 3 | 4 | 5 | 6;
    if (explanationFraming) initial.explanationFramingVersion = parseInt(explanationFraming) as 1 | 2 | 3 | 4 | 5 | 6;
    if (alternativesLayout) initial.alternativesLayoutVersion = parseInt(alternativesLayout) as 1 | 2 | 3 | 4 | 5 | 6;
    if (productAlternatives) initial.productAlternativesVersion = parseInt(productAlternatives) as 1 | 2 | 3 | 4 | 5 | 6;
    if (calculator) initial.calculatorVersion = parseInt(calculator) as 1 | 2 | 3 | 4 | 5 | 6;
    if (emailCapture) initial.emailCaptureVersion = parseInt(emailCapture) as 1 | 2 | 3 | 4 | 5 | 6;
    if (retryTimeline) initial.retryTimelineVersion = parseInt(retryTimeline) as 1 | 2 | 3 | 4 | 5 | 6;
    if (advisorCTA) initial.advisorCTAVersion = parseInt(advisorCTA) as 1 | 2 | 3 | 4 | 5 | 6;
    if (advisorMessage) initial.advisorMessageVersion = parseInt(advisorMessage) as 1 | 2 | 3 | 4 | 5 | 6;

    return initial;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    componentOrder: ['visual', 'illustration', 'branding', 'message', 'explanationDetail', 'explanationFraming', 'alternativesLayout', 'productAlternatives', 'calculator', 'emailCapture', 'retryTimeline', 'advisorCTA', 'advisorMessage'],
    onVersionChange: (componentId, version) => {
      const key = `${componentId}Version` as keyof RejectionConfig;
      setConfig(prev => ({ ...prev, [key]: version }));
    },
    onToggleSettings: () => setIsSettingsOpen(prev => !prev),
    getCurrentVersion: (componentId) => {
      const key = `${componentId}Version` as keyof RejectionConfig;
      return config[key] || 1;
    },
    isModalOpen: isSettingsOpen,
  });

  const handleConfigChange = (newConfig: RejectionConfig) => {
    setConfig(newConfig);

    // Actualizar URL params
    const params = new URLSearchParams();
    params.set('visual', newConfig.visualVersion.toString());
    params.set('illustration', newConfig.illustrationVersion.toString());
    params.set('branding', newConfig.brandingVersion.toString());
    params.set('message', newConfig.messageVersion.toString());
    params.set('explanationDetail', newConfig.explanationDetailVersion.toString());
    params.set('explanationFraming', newConfig.explanationFramingVersion.toString());
    params.set('alternativesLayout', newConfig.alternativesLayoutVersion.toString());
    params.set('productAlternatives', newConfig.productAlternativesVersion.toString());
    params.set('calculator', newConfig.calculatorVersion.toString());
    params.set('emailCapture', newConfig.emailCaptureVersion.toString());
    params.set('retryTimeline', newConfig.retryTimelineVersion.toString());
    params.set('advisorCTA', newConfig.advisorCTAVersion.toString());
    params.set('advisorMessage', newConfig.advisorMessageVersion.toString());

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen relative">
      {/* Version Nav */}
      <VersionNav currentVersion="0.4" showSections={true} />

      {/* Main Content */}
      <RejectionScreen config={config} />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_16" version="0.4" />
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
          onPress={() => router.push('/prototipos/0.4')}
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
      </div>

      {/* Config Badge */}
      {showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
          <p className="text-xs font-mono text-neutral-700">
            visual: V{config.visualVersion} | illustration: V{config.illustrationVersion} | branding: V{config.brandingVersion}
            <br />
            message: V{config.messageVersion} | explanationDetail: V{config.explanationDetailVersion} | explanationFraming: V{config.explanationFramingVersion}
            <br />
            alternativesLayout: V{config.alternativesLayoutVersion} | productAlternatives: V{config.productAlternativesVersion} | calculator: V{config.calculatorVersion}
            <br />
            emailCapture: V{config.emailCaptureVersion} | retryTimeline: V{config.retryTimelineVersion} | advisorCTA: V{config.advisorCTAVersion} | advisorMessage: V{config.advisorMessageVersion}
          </p>
        </div>
      )}

      {/* Settings Modal */}
      <RejectionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={handleConfigChange}
      />
    </div>
  );
}

export default function RechazadoPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RechazadoPreviewContent />
    </Suspense>
  );
}
