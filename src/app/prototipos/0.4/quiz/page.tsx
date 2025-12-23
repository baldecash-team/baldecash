'use client';

/**
 * Quiz Preview Page - BaldeCash v0.4
 *
 * Pagina de preview para el Quiz de Ayuda
 * con controles de configuracion A/B.
 *
 * Query params:
 * - layout: 1-6
 * - questions: 3, 5, 7
 * - style: 1-6
 * - results: 1-6
 * - focus: 1-3
 *
 * Ejemplo: /prototipos/0.4/quiz?layout=1&questions=7&style=1&results=1&focus=1
 */

import { useState, useCallback, Suspense } from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { HelpCircle, Play, ArrowLeft, Settings, Code, Layers, Keyboard, Navigation } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import { HelpQuiz, QuizSettingsModal } from './components/quiz';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { useKeyboardShortcuts } from '@/app/prototipos/_shared';

// Types
import { QuizConfig, defaultQuizConfig, versionDescriptions } from './types/quiz';

function QuizPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Config from URL params
  const [config, setConfig] = useState<QuizConfig>(() => {
    const layout = parseInt(searchParams.get('layout') || '1');
    const questions = parseInt(searchParams.get('questions') || '7');
    const style = parseInt(searchParams.get('style') || '1');
    const results = parseInt(searchParams.get('results') || '1');
    const focus = parseInt(searchParams.get('focus') || '1');

    return {
      layoutVersion: (layout >= 1 && layout <= 6 ? layout : 1) as 1 | 2 | 3 | 4 | 5 | 6,
      questionCount: ([3, 5, 7].includes(questions) ? questions : 7) as 3 | 5 | 7,
      questionStyle: (style >= 1 && style <= 6 ? style : 1) as 1 | 2 | 3 | 4 | 5 | 6,
      resultsVersion: (results >= 1 && results <= 6 ? results : 1) as 1 | 2 | 3 | 4 | 5 | 6,
      focusVersion: (focus >= 1 && focus <= 3 ? focus : 1) as 1 | 2 | 3,
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'version' | 'navigation' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'version' | 'navigation' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Update URL when config changes
  const updateConfig = useCallback((newConfig: QuizConfig) => {
    setConfig(newConfig);
    const params = new URLSearchParams();
    params.set('layout', newConfig.layoutVersion.toString());
    params.set('questions', newConfig.questionCount.toString());
    params.set('style', newConfig.questionStyle.toString());
    params.set('results', newConfig.resultsVersion.toString());
    params.set('focus', newConfig.focusVersion.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const componentLabels: Record<string, string> = {
    layout: 'Layout',
    questionStyle: 'Estilo Preguntas',
    results: 'Resultados',
    focus: 'Enfoque',
  };

  // Keyboard shortcuts
  const { currentComponent } = useKeyboardShortcuts({
    componentOrder: ['layout', 'questionStyle', 'results', 'focus'],
    onVersionChange: (componentId, version) => {
      const keyMap: Record<string, keyof QuizConfig> = {
        layout: 'layoutVersion',
        questionStyle: 'questionStyle',
        results: 'resultsVersion',
        focus: 'focusVersion',
      };
      const configKey = keyMap[componentId];
      if (configKey) {
        // focusVersion only has 1-3
        if (configKey === 'focusVersion' && version > 3) {
          showToast(`${componentLabels[componentId]} solo tiene 3 versiones`, 'info');
          return;
        }
        updateConfig({ ...config, [configKey]: version });
        showToast(`${componentLabels[componentId]}: V${version}`, 'version');
      }
    },
    onNavigate: (componentId) => {
      showToast(`Componente: ${componentLabels[componentId] || componentId}`, 'navigation');
    },
    onToggleSettings: () => setIsSettingsOpen(prev => !prev),
    getCurrentVersion: (componentId) => {
      const keyMap: Record<string, keyof QuizConfig> = {
        layout: 'layoutVersion',
        questionStyle: 'questionStyle',
        results: 'resultsVersion',
        focus: 'focusVersion',
      };
      const configKey = keyMap[componentId];
      return configKey ? config[configKey] as 1 | 2 | 3 | 4 | 5 | 6 : 1;
    },
    isModalOpen: isSettingsOpen || isQuizOpen,
  });

  return (
    <div className="min-h-screen bg-white relative">
      {/* Toast de shortcuts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium ${
              toast.type === 'version'
                ? 'bg-[#4654CD] text-white'
                : toast.type === 'navigation'
                ? 'bg-neutral-800 text-white'
                : 'bg-white text-neutral-800 border border-neutral-200'
            }`}
          >
            {toast.type === 'version' && <Layers className="w-4 h-4" />}
            {toast.type === 'navigation' && <Navigation className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcut Help Badge */}
      <div className="fixed top-20 right-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-md px-3 py-2 border border-neutral-200">
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Press ? for help</span>
        </div>
        <div className="text-xs font-medium text-[#4654CD]">
          Activo: {componentLabels[currentComponent] || currentComponent}
        </div>
      </div>

      {/* Floating Controls */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_06" version="0.4" />
        <Button
          isIconOnly
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
          onPress={() => setIsSettingsOpen(true)}
          aria-label="Configuracion"
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
          aria-label="Mostrar configuracion"
        >
          <Code className="w-5 h-5 text-neutral-600" />
        </Button>
        <Button
          isIconOnly
          className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          onPress={() => router.push('/prototipos/0.4')}
          aria-label="Volver al indice"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
      </div>

      {/* Current Config Badge */}
      {showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Configuracion actual:</p>
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
            onClick={() => updateConfig({ ...config, layoutVersion: 1 })}
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
            onClick={() => updateConfig({ ...config, layoutVersion: 2 })}
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
            onClick={() => updateConfig({ ...config, layoutVersion: 3 })}
          >
            <div className="aspect-video bg-neutral-100 rounded-lg mb-3 flex flex-col">
              <div className="h-3 bg-white border-b border-neutral-200" />
              <div className="flex-1 flex items-center justify-center p-2">
                <div className="w-2/3 h-3/4 bg-white rounded-lg shadow-md border border-neutral-200" />
              </div>
            </div>
            <h4 className="font-semibold text-neutral-800 text-sm mb-1">
              V3 - Pagina Dedicada
            </h4>
            <p className="text-xs text-neutral-500">
              Pagina completa para el quiz
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
            Probar Quiz con esta Configuracion
          </Button>
        </div>
      </main>

      {/* Settings Modal */}
      <QuizSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={updateConfig}
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

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Spinner size="lg" color="primary" />
    </div>
  );
}

export default function QuizPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <QuizPreviewContent />
    </Suspense>
  );
}
