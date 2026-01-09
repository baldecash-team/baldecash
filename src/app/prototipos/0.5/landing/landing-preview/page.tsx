'use client';

/**
 * Landing Preview v0.5
 * Configuración fija - sin selector de diseño
 * Botones flotantes estándar v0.5
 */

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { ArrowLeft, Code, Loader2 } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton } from '@/app/prototipos/_shared';
import { LandingPage } from '../components/landing';
import { defaultCampaign } from '../data/mockLandingData';

function LandingPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const [showConfig, setShowConfig] = useState(false);

  // Clean mode: only content + feedback button
  if (isCleanMode) {
    return (
      <>
        <LandingPage campaign={defaultCampaign} isCleanMode={isCleanMode} />
        <FeedbackButton
          sectionId="landing"
          config={{}}
        />
      </>
    );
  }

  // Normal mode: content + floating controls
  return (
    <div className="relative">
      <LandingPage campaign={defaultCampaign} isCleanMode={isCleanMode} />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_LANDING" version="0.5" />
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

      {/* Config Panel */}
      {showConfig && (
        <div className="fixed bottom-20 right-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-3 border border-neutral-200 max-w-sm">
          <p className="text-xs text-neutral-500 mb-2">Configuración actual:</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-400">Diseño:</span>
              <span className="font-mono text-neutral-700">Fijo (V1)</span>
            </div>
          </div>
        </div>
      )}
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
