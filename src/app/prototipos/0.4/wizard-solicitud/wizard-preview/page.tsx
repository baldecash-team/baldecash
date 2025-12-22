'use client';

/**
 * Wizard Solicitud Preview - PROMPT_18
 * Preview con Settings Modal para configurar versiones
 *
 * Keyboard Shortcuts:
 * - 1-6: Cambiar version del componente activo
 * - Tab: Siguiente componente
 * - Shift+Tab: Componente anterior
 * - S: Abrir/cerrar settings
 * - C: Abrir/cerrar quick switcher
 * - Esc: Cerrar modal
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, ArrowLeft, Eye, EyeOff, Keyboard, Zap } from 'lucide-react';
import Link from 'next/link';
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
  const [config, setConfig] = useState<WizardSolicitudConfig>(defaultWizardSolicitudConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);

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
      {/* Icono volver - fixed top left */}
      {showOverlays && (
        <Link
          href="/prototipos/0.4"
          className="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-full text-neutral-500 hover:text-[#4654CD] hover:border-[#4654CD]/30 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      )}

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
      {showOverlays && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
          <TokenCounter sectionId="PROMPT_18" version="0.4" />

          <Button
            isIconOnly
            size="lg"
            className="bg-amber-500 text-white shadow-lg hover:bg-amber-600"
            onPress={() => setIsQuickSwitcherOpen(true)}
            title="Cambio Rapido (C)"
          >
            <Zap className="w-5 h-5" />
          </Button>

          <Button
            isIconOnly
            size="lg"
            className="bg-[#4654CD] text-white shadow-lg hover:bg-[#3A47B8]"
            onPress={() => setIsSettingsOpen(true)}
            title="Settings (S)"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <Button
            isIconOnly
            size="lg"
            variant="bordered"
            className="bg-white border-neutral-300 shadow-lg"
            onPress={() => setShowOverlays((prev) => !prev)}
          >
            {showOverlays ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>
        </div>
      )}

      {/* Active component badge */}
      {showOverlays && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <div className="flex items-center gap-2 mb-1">
            <Keyboard className="w-3.5 h-3.5 text-neutral-400" />
            <p className="text-xs text-neutral-500">Componente activo:</p>
          </div>
          <p className="text-sm font-medium text-[#4654CD]">{componentLabel}</p>
          <p className="text-[10px] text-neutral-400 mt-1">Tab/Shift+Tab navegar • 1-6 versión</p>
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
