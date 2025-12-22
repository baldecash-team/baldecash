'use client';

/**
 * Quiz Preview Page - BaldeCash v0.4
 *
 * Página de preview para el Quiz de Ayuda
 * con controles de configuración A/B.
 *
 * Versiones preferidas consolidadas de 0.3:
 * - B.98: Layout V1 (modal full screen mobile)
 * - B.99: 7 preguntas
 * - B.100: Question Style V1 (chips/pills)
 * - B.101: Results V1 (categoría + cards catálogo)
 * - B.102: Focus V1 (solo por uso)
 */

import { useState } from 'react';
import { Button } from '@nextui-org/react';
import { HelpCircle, Play, ArrowLeft, Settings, Code } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Components
import { HelpQuiz, QuizSettingsModal } from './components/quiz';
import { TokenCounter } from '@/components/ui/TokenCounter';

// Types
import { QuizConfig, defaultQuizConfig, versionDescriptions } from './types/quiz';

export default function QuizPreviewPage() {
  const router = useRouter();
  const [config, setConfig] = useState<QuizConfig>(defaultQuizConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Floating Controls */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_06" version="0.4" />
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
          onPress={() => setIsQuizOpen(true)}
          aria-label="Iniciar quiz"
        >
          <Play className="w-5 h-5 text-neutral-600" />
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

      {/* Current Config Badge */}
      {showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
          <p className="text-xs font-mono text-neutral-700">
            Layout: V{config.layoutVersion} | Preguntas: {config.questionCount} | Estilo: V{config.questionStyle} | Resultados: V{config.resultsVersion} | Enfoque: V{config.focusVersion}
          </p>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#4654CD]/10 mb-4">
            <HelpCircle className="w-8 h-8 text-[#4654CD]" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">
            Quiz de Ayuda v0.4
          </h1>
          <p className="text-neutral-500">
            6 versiones por componente para A/B testing
          </p>
        </div>

        {/* Current config summary */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-800">
                Configuración Actual
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

        {/* Layout preview cards */}
        <h3 className="font-semibold text-neutral-800 mb-4">
          Preview de Layouts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Layout V1 */}
          <div
            className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
              config.layoutVersion === 1
                ? 'border-[#4654CD] shadow-lg'
                : 'border-neutral-200 hover:border-[#4654CD]/50'
            }`}
            onClick={() => setConfig({ ...config, layoutVersion: 1 })}
          >
            <div className="aspect-video bg-neutral-100 rounded-lg mb-3 flex items-center justify-center">
              <div className="w-3/4 h-3/4 bg-white rounded-lg shadow-md border border-neutral-200" />
            </div>
            <h4 className="font-semibold text-neutral-800 text-sm mb-1">
              V1 - Modal Full Screen Mobile
            </h4>
            <p className="text-xs text-neutral-500">
              PREFERIDO - Modal centrado, full screen en mobile
            </p>
          </div>

          {/* Layout V2 */}
          <div
            className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
              config.layoutVersion === 2
                ? 'border-[#4654CD] shadow-lg'
                : 'border-neutral-200 hover:border-[#4654CD]/50'
            }`}
            onClick={() => setConfig({ ...config, layoutVersion: 2 })}
          >
            <div className="aspect-video bg-neutral-100 rounded-lg mb-3 flex items-center justify-end pr-2">
              <div className="w-1/3 h-full bg-white rounded-lg shadow-md border border-neutral-200" />
            </div>
            <h4 className="font-semibold text-neutral-800 text-sm mb-1">
              V2 - Widget Lateral
            </h4>
            <p className="text-xs text-neutral-500">
              Panel lateral siempre accesible
            </p>
          </div>

          {/* Layout V3 */}
          <div
            className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
              config.layoutVersion === 3
                ? 'border-[#4654CD] shadow-lg'
                : 'border-neutral-200 hover:border-[#4654CD]/50'
            }`}
            onClick={() => setConfig({ ...config, layoutVersion: 3 })}
          >
            <div className="aspect-video bg-neutral-100 rounded-lg mb-3 flex flex-col">
              <div className="h-3 bg-white border-b border-neutral-200" />
              <div className="flex-1 flex items-center justify-center p-2">
                <div className="w-2/3 h-3/4 bg-white rounded-lg shadow-md border border-neutral-200" />
              </div>
            </div>
            <h4 className="font-semibold text-neutral-800 text-sm mb-1">
              V3 - Página Dedicada
            </h4>
            <p className="text-xs text-neutral-500">
              Página completa para el quiz
            </p>
          </div>
        </div>

        {/* CTA to start quiz */}
        <div className="text-center">
          <Button
            className="bg-[#4654CD] text-white font-semibold cursor-pointer"
            size="lg"
            startContent={<Play className="w-5 h-5" />}
            onPress={() => setIsQuizOpen(true)}
          >
            Probar Quiz con esta Configuración
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
