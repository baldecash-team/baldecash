'use client';

/**
 * Quiz Preview v0.5
 * Página standalone para el Quiz de Ayuda
 *
 * Configuración fija:
 * - Layout: V4 (mobile) / V5 (desktop)
 * - Questions: V1 (chips/pills)
 * - Results: V1 (producto destacado)
 * - Focus: V1 (solo por uso)
 * - 7 preguntas
 *
 * El quiz se muestra abierto por defecto en esta página.
 */

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, Code, HelpCircle, Play, RotateCcw } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton, useIsMobile, useScrollToTop } from '@/app/prototipos/_shared';

// Quiz components
import { HelpQuiz } from '../components/quiz';

// Fixed config for v0.5
const getQuizConfig = (isMobile: boolean) => ({
  layoutVersion: (isMobile ? 4 : 5) as 4 | 5,
  questionCount: 7 as const,
  questionStyle: 1 as const,
  resultsVersion: 1 as const,
  focusVersion: 1 as const,
});

const fixedConfigDisplay = {
  layout: 'V4 (Mobile) / V5 (Desktop)',
  questions: '7 preguntas',
  questionStyle: 'V1 (Chips)',
  results: 'V1 (Producto destacado)',
  focus: 'V1 (Por uso)',
};

export default function QuizPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Spinner size="lg" color="primary" />
        </div>
      }
    >
      <QuizPreviewContent />
    </Suspense>
  );
}

function QuizPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const isMobile = useIsMobile();

  // Scroll to top on page load
  useScrollToTop();

  const [isQuizOpen, setIsQuizOpen] = useState(true); // Abierto por defecto
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  const quizConfig = getQuizConfig(isMobile);

  // URLs
  const getWizardUrl = () => {
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/';
    return isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
  };

  const getCatalogUrl = () => {
    const baseUrl = '/prototipos/0.5/catalogo/catalog-preview';
    return isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
  };

  // Clean mode: solo quiz + feedback button
  if (isCleanMode) {
    return (
      <div className="min-h-screen bg-white">
        {/* Quiz abierto por defecto */}
        <HelpQuiz
          config={quizConfig}
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          context="hero"
          isCleanMode={isCleanMode}
          onComplete={(results, answers) => {
            console.log('Quiz completed:', { results, answers });
          }}
        />

        {/* Botón para reabrir quiz si se cierra */}
        {!isQuizOpen && (
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#4654CD]/10 mb-4">
                <HelpCircle className="w-10 h-10 text-[#4654CD]" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-800 mb-2">
                Quiz de Ayuda
              </h1>
              <p className="text-neutral-500 max-w-md">
                Encuentra la laptop perfecta para ti en menos de 2 minutos
              </p>
            </div>
            <Button
              className="bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
              size="lg"
              startContent={<Play className="w-5 h-5" />}
              onPress={() => setIsQuizOpen(true)}
            >
              Iniciar Quiz
            </Button>
          </div>
        )}

        <FeedbackButton sectionId="quiz" />
      </div>
    );
  }

  // Dev mode: quiz + controles
  return (
    <div className="min-h-screen bg-white relative">
      {/* Quiz */}
      <HelpQuiz
        config={quizConfig}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        context="hero"
        isCleanMode={isCleanMode}
        onComplete={(results, answers) => {
          console.log('Quiz completed:', { results, answers });
        }}
      />

      {/* Landing cuando quiz está cerrado */}
      {!isQuizOpen && (
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#4654CD]/10 mb-4">
              <HelpCircle className="w-10 h-10 text-[#4654CD]" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">
              Quiz de Ayuda v0.5
            </h1>
            <p className="text-neutral-500 max-w-md mx-auto">
              Configuración fija optimizada para la mejor experiencia
            </p>
          </div>

          {/* Config Summary */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8">
            <h2 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-[#4654CD]" />
              Configuración Fija v0.5
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-xs text-neutral-500 mb-1">Layout</p>
                <p className="font-medium text-neutral-800">{fixedConfigDisplay.layout}</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-xs text-neutral-500 mb-1">Preguntas</p>
                <p className="font-medium text-neutral-800">{fixedConfigDisplay.questions}</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-xs text-neutral-500 mb-1">Estilo Preguntas</p>
                <p className="font-medium text-neutral-800">{fixedConfigDisplay.questionStyle}</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-xs text-neutral-500 mb-1">Resultados</p>
                <p className="font-medium text-neutral-800">{fixedConfigDisplay.results}</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-xs text-neutral-500 mb-1">Enfoque</p>
                <p className="font-medium text-neutral-800">{fixedConfigDisplay.focus}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              className="bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
              size="lg"
              startContent={<Play className="w-5 h-5" />}
              onPress={() => setIsQuizOpen(true)}
            >
              Iniciar Quiz
            </Button>
            <Button
              variant="bordered"
              size="lg"
              startContent={<RotateCcw className="w-5 h-5" />}
              onPress={() => setIsQuizOpen(true)}
              className="cursor-pointer border-neutral-300"
            >
              Reiniciar
            </Button>
          </div>

          {/* Note */}
          <p className="text-center text-sm text-neutral-400 mt-8">
            En v0.5 no hay iteraciones - la configuración está optimizada y fija.
          </p>
        </main>
      )}

      {/* Floating Controls */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_06" version="0.5" />
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
            <span className="text-neutral-400">Layout:</span>
            <span className="font-mono text-neutral-700">V4/V5</span>
            <span className="text-neutral-400">Preguntas:</span>
            <span className="font-mono text-neutral-700">7</span>
            <span className="text-neutral-400">Estilo:</span>
            <span className="font-mono text-neutral-700">V1</span>
            <span className="text-neutral-400">Resultados:</span>
            <span className="font-mono text-neutral-700">V1</span>
            <span className="text-neutral-400">Enfoque:</span>
            <span className="font-mono text-neutral-700">V1</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">Sin iteraciones</p>
        </div>
      )}
    </div>
  );
}
