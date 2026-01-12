'use client';

/**
 * Rechazado Preview v0.5
 * Pantalla de rechazo con configuración fija
 * Botones flotantes estándar v0.5
 */

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { ArrowLeft, Code, Loader2 } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton } from '@/app/prototipos/_shared';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';
import { RejectionScreen } from '../components/rejection';
import { mockRejectionData } from '../data/mockRejectionData';

// Logo URL de BaldeCash
const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

const FIXED_CONFIG = {
  visual: 'Marca suavizada',
  illustration: 'Persona reflexiva',
  message: 'Nombre prominente',
  explanationDetail: 'Accionable',
  explanationFraming: '100% positivo',
  alternativesLayout: 'Lista elegante',
  productAlternatives: 'Cards completas',
  calculator: 'Ejemplos fijos',
  emailCapture: 'Campo prominente',
  retryTimeline: 'Fecha específica',
};

function RechazadoPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const [showConfig, setShowConfig] = useState(false);

  const pageContent = (
    <div className="min-h-screen bg-neutral-50">
      {/* Header con fondo primario - fixed con sombra */}
      <div className="bg-[#4654CD] py-5 fixed top-0 left-0 right-0 z-50 shadow-lg shadow-[#4654CD]/20">
        <div className="flex justify-center">
          <img
            src={BALDECASH_LOGO}
            alt="BaldeCash"
            className="h-12 object-contain brightness-0 invert"
          />
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[68px]" />

      <RejectionScreen data={mockRejectionData} />
    </div>
  );

  // Clean mode: only content + feedback button
  if (isCleanMode) {
    return (
      <>
        {pageContent}
        <Footer isCleanMode={isCleanMode} />
        <FeedbackButton
          sectionId="rechazo"
          config={FIXED_CONFIG as unknown as Record<string, unknown>}
          className="bottom-24 lg:bottom-6"
        />
      </>
    );
  }

  // Normal mode: content + floating controls
  return (
    <div className="relative">
      {pageContent}
      <Footer isCleanMode={isCleanMode} />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-2 lg:bottom-6">
        <TokenCounter sectionId="PROMPT_RECHAZO" version="0.5" />
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

      {/* Config Badge */}
      {showConfig && (
        <div className="fixed bottom-24 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-3 border border-neutral-200 max-w-sm lg:bottom-6">
          <p className="text-xs text-neutral-500 mb-2">Configuración fija v0.5:</p>
          <div className="space-y-1 text-xs">
            {Object.entries(FIXED_CONFIG).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-neutral-400 capitalize">{key}:</span>
                <span className="font-mono text-neutral-700">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-400 mt-2">Sin iteraciones</p>
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

export default function RechazadoPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RechazadoPreviewContent />
    </Suspense>
  );
}
