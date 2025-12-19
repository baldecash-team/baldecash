'use client';

/**
 * Quiz Preview Page - BaldeCash v0.3
 *
 * Pagina de preview para el Quiz de Ayuda
 * con controles de configuracion A/B.
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { HelpCircle, Play, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Components
import { HelpQuiz, QuizSettingsModal } from './components/quiz';
import { FloatingControls } from '@/app/prototipos/_shared/components/FloatingControls';

// Types
import { QuizConfig, defaultQuizConfig, versionDescriptions } from './types/quiz';

export default function QuizPreviewPage() {
  const [config, setConfig] = useState<QuizConfig>(defaultQuizConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Back to prototypes */}
      <div className="fixed top-4 left-4 z-[60]">
        <Link href="/prototipos/0.3">
          <Button
            variant="flat"
            size="sm"
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="bg-white shadow-md cursor-pointer"
          >
            Prototipos
          </Button>
        </Link>
      </div>

      {/* Floating Controls */}
      <FloatingControls
        config={config}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-neutral-800">
            Quiz de Ayuda
          </h1>
          <Button
            className="bg-[#4654CD] text-white cursor-pointer"
            startContent={<Play className="w-4 h-4" />}
            onPress={() => setIsQuizOpen(true)}
          >
            Iniciar Quiz
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Current config summary */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-800">
                Configuracion Actual
              </h2>
              <p className="text-sm text-neutral-500">
                Ajusta las versiones para probar diferentes combinaciones
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Layout */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-500 mb-1">B.98 - Layout</p>
              <p className="font-medium text-neutral-800">
                V{config.layoutVersion}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {versionDescriptions.layout[config.layoutVersion]}
              </p>
            </div>

            {/* Question Count */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-500 mb-1">B.99 - Preguntas</p>
              <p className="font-medium text-neutral-800">
                {config.questionCount} preguntas
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {versionDescriptions.questionCount[config.questionCount]}
              </p>
            </div>

            {/* Question Style */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-500 mb-1">
                B.100 - Estilo Preguntas
              </p>
              <p className="font-medium text-neutral-800">
                V{config.questionStyle}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {versionDescriptions.questionStyle[config.questionStyle]}
              </p>
            </div>

            {/* Results */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-500 mb-1">
                B.101 - Resultados
              </p>
              <p className="font-medium text-neutral-800">
                V{config.resultsVersion}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {versionDescriptions.results[config.resultsVersion]}
              </p>
            </div>

            {/* Focus */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-500 mb-1">B.102 - Enfoque</p>
              <p className="font-medium text-neutral-800">
                V{config.focusVersion}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {versionDescriptions.focus[config.focusVersion]}
              </p>
            </div>
          </div>
        </div>

        {/* Preview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Layout V1 */}
          <div
            className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
              config.layoutVersion === 1
                ? 'border-[#4654CD] shadow-lg'
                : 'border-neutral-200 hover:border-[#4654CD]/50'
            }`}
            onClick={() => setConfig({ ...config, layoutVersion: 1 })}
          >
            <div className="aspect-video bg-neutral-100 rounded-lg mb-4 flex items-center justify-center">
              <div className="w-3/4 h-3/4 bg-white rounded-lg shadow-md border border-neutral-200" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-1">
              V1 - Modal Overlay
            </h3>
            <p className="text-sm text-neutral-500">
              Foco total en el quiz con modal centrado
            </p>
          </div>

          {/* Layout V2 */}
          <div
            className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
              config.layoutVersion === 2
                ? 'border-[#4654CD] shadow-lg'
                : 'border-neutral-200 hover:border-[#4654CD]/50'
            }`}
            onClick={() => setConfig({ ...config, layoutVersion: 2 })}
          >
            <div className="aspect-video bg-neutral-100 rounded-lg mb-4 flex items-center justify-end pr-2">
              <div className="w-1/3 h-full bg-white rounded-lg shadow-md border border-neutral-200" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-1">
              V2 - Widget Lateral
            </h3>
            <p className="text-sm text-neutral-500">
              Panel lateral siempre accesible
            </p>
          </div>

          {/* Layout V3 */}
          <div
            className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
              config.layoutVersion === 3
                ? 'border-[#4654CD] shadow-lg'
                : 'border-neutral-200 hover:border-[#4654CD]/50'
            }`}
            onClick={() => setConfig({ ...config, layoutVersion: 3 })}
          >
            <div className="aspect-video bg-neutral-100 rounded-lg mb-4 flex flex-col">
              <div className="h-4 bg-white border-b border-neutral-200" />
              <div className="flex-1 flex items-center justify-center">
                <div className="w-2/3 h-3/4 bg-white rounded-lg shadow-md border border-neutral-200" />
              </div>
            </div>
            <h3 className="font-semibold text-neutral-800 mb-1">
              V3 - Pagina Dedicada
            </h3>
            <p className="text-sm text-neutral-500">
              Pagina completa para el quiz
            </p>
          </div>
        </div>

        {/* CTA to start quiz */}
        <div className="mt-8 text-center">
          <Button
            className="bg-[#4654CD] text-white font-semibold cursor-pointer"
            size="lg"
            startContent={<Play className="w-5 h-5" />}
            onPress={() => setIsQuizOpen(true)}
          >
            Probar Quiz con esta Configuracion
          </Button>
        </div>
      </main>

      {/* Settings Modal */}
      <QuizSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />

      {/* Quiz */}
      <HelpQuiz
        config={config}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={(results) => {
          console.log('Quiz completed with results:', results);
        }}
      />
    </div>
  );
}
