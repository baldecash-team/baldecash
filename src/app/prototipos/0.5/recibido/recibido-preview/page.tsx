'use client';

/**
 * Recibido Preview v0.5
 * Pantalla de solicitud recibida con configuración fija
 * Botones flotantes estándar v0.5
 */

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { ArrowLeft, Code } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton, CubeGridSpinner } from '@/app/prototipos/_shared';
import { Navbar } from '@/app/prototipos/0.5/hero/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';
import { ReceivedScreen } from '../components/received';
import { mockReceivedData } from '../data/mockReceivedData';

const FIXED_CONFIG = {
  illustration: 'Documento + Reloj',
  message: 'Personalizado con nombre',
  status: 'Timeline horizontal',
  productSummary: 'Card con accesorios',
  contact: 'WhatsApp prominente',
};

function RecibidoPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const [showConfig, setShowConfig] = useState(false);

  const pageContent = (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar con logo centrado */}
      <Navbar logoOnly />

      {/* Spacer for fixed header */}
      <div className="h-[68px]" />

      <ReceivedScreen data={mockReceivedData} />
    </div>
  );

  // Clean mode: only content + feedback button
  if (isCleanMode) {
    return (
      <>
        {pageContent}
        <Footer isCleanMode={isCleanMode} />
        <FeedbackButton
          sectionId="recibido"
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
        <TokenCounter sectionId="PROMPT_RECIBIDO" version="0.5" />
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
      <CubeGridSpinner size="3rem" />
    </div>
  );
}

export default function RecibidoPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RecibidoPreviewContent />
    </Suspense>
  );
}
