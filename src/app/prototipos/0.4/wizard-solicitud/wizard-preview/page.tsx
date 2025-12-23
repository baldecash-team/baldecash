'use client';

/**
 * Wizard Solicitud Preview - PROMPT_18
 * Preview con Settings Modal para configurar versiones
 *
 * Keyboard Shortcuts:
 * - 1-6: Cambiar versión del componente activo
 * - Tab: Siguiente componente
 * - Shift+Tab: Componente anterior
 * - S: Abrir/cerrar settings
 * - C: Abrir/cerrar quick switcher
 * - Esc: Cerrar modal
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, ArrowLeft, Zap, Code } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import { WizardSolicitudContainer } from '../components/wizard-solicitud/WizardSolicitudContainer';
import { WizardSolicitudSettingsModal } from '../components/wizard-solicitud/WizardSolicitudSettingsModal';
import { QuickComponentSwitcher } from '../components/wizard-solicitud/QuickComponentSwitcher';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { useKeyboardShortcuts } from '../hooks';

// Types & Data
import type { WizardSolicitudConfig } from '../types/wizard-solicitud';
import { defaultWizardSolicitudConfig } from '../types/wizard-solicitud';
import { MOCK_PRODUCT } from '../data/wizardSolicitudSteps';

export default function WizardSolicitudPreviewPage() {
  const router = useRouter();
  const [config, setConfig] = useState<WizardSolicitudConfig>(defaultWizardSolicitudConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  const { activeComponent, setActiveComponent, componentLabel, toast } = useKeyboardShortcuts({
    config,
    onConfigChange: setConfig,
    onOpenSettings: () => setIsSettingsOpen(true),
    onCloseSettings: () => setIsSettingsOpen(false),
    isSettingsOpen,
    onOpenQuickSwitcher: () => setIsQuickSwitcherOpen(true),
    onCloseQuickSwitcher: () => setIsQuickSwitcherOpen(false),
    isQuickSwitcherOpen,
  });

  return (
    <div className="relative min-h-screen">
      {/* Main content - Wizard Container */}
      <div>
        <WizardSolicitudContainer
          config={config}
          selectedProduct={MOCK_PRODUCT}
          onComplete={(data) => {
            console.log('Solicitud completada:', data);
            alert('Solicitud enviada correctamente');
          }}
          onSave={(data) => {
            console.log('Guardado:', data);
          }}
        />
      </div>

      {/* Toast de shortcuts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-full shadow-lg
              ${toast.type === 'version' ? 'bg-[#4654CD] text-white' : ''}
              ${toast.type === 'navigation' ? 'bg-neutral-800 text-white' : ''}
              ${toast.type === 'info' ? 'bg-white text-neutral-800 border border-neutral-200' : ''}
            `}
          >
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating controls */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_18" version="0.4" />
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
          className="bg-amber-500 text-white shadow-lg cursor-pointer hover:bg-amber-600 transition-colors"
          onPress={() => setIsQuickSwitcherOpen(true)}
          aria-label="Cambio rápido"
        >
          <Zap className="w-5 h-5" />
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
            Header: V{config.headerVersion} | Hero: V{config.heroVersion} | CTA: V{config.ctaVersion} | Layout: V{config.wizardLayoutVersion} | Progress: V{config.progressVersion} | Nav: V{config.navigationVersion}
          </p>
        </div>
      )}

      {/* Settings Modal */}
      <WizardSolicitudSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />

      {/* Quick Component Switcher */}
      <QuickComponentSwitcher
        isOpen={isQuickSwitcherOpen}
        onClose={() => setIsQuickSwitcherOpen(false)}
        config={config}
        onConfigChange={setConfig}
        activeComponent={activeComponent}
        onActiveComponentChange={setActiveComponent}
      />
    </div>
  );
}
