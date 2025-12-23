'use client';

/**
 * Aprobación Preview Page - Configurable demo for approval screen
 * PROMPT_15: Pantalla de Aprobación / Éxito
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, Code, ArrowLeft, Layers, Keyboard, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ApprovalScreen, ApprovalSettingsModal } from '../components/approval';
import { ApprovalConfig, defaultApprovalConfig } from '../types/approval';
import { mockApprovalData, defaultNextSteps } from '../data/mockApprovalData';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { useKeyboardShortcuts } from '@/app/prototipos/_shared';

export default function AprobadoPreviewPage() {
  const router = useRouter();
  const [config, setConfig] = useState<ApprovalConfig>(defaultApprovalConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'version' | 'navigation' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'version' | 'navigation' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const componentLabels: Record<string, string> = {
    celebration: 'Celebración',
    confetti: 'Confetti',
    sound: 'Sonido',
    summary: 'Resumen',
    nextSteps: 'Pasos Siguientes',
    share: 'Compartir',
    referral: 'Referidos',
  };

  // Keyboard shortcuts
  const { currentComponent } = useKeyboardShortcuts({
    componentOrder: ['celebration', 'confetti', 'sound', 'summary', 'nextSteps', 'share', 'referral'],
    onVersionChange: (componentId, version) => {
      const keyMap: Record<string, keyof ApprovalConfig> = {
        celebration: 'celebrationVersion',
        confetti: 'confettiVersion',
        sound: 'soundVersion',
        summary: 'summaryVersion',
        nextSteps: 'nextStepsVersion',
        share: 'shareVersion',
        referral: 'referralVersion',
      };
      const configKey = keyMap[componentId];
      if (configKey) {
        setConfig(prev => ({ ...prev, [configKey]: version }));
        showToast(`${componentLabels[componentId]}: V${version}`, 'version');
      }
    },
    onNavigate: (componentId) => {
      showToast(`Componente: ${componentLabels[componentId] || componentId}`, 'navigation');
    },
    onToggleSettings: () => setIsSettingsOpen(prev => !prev),
    getCurrentVersion: (componentId) => {
      const keyMap: Record<string, keyof ApprovalConfig> = {
        celebration: 'celebrationVersion',
        confetti: 'confettiVersion',
        sound: 'soundVersion',
        summary: 'summaryVersion',
        nextSteps: 'nextStepsVersion',
        share: 'shareVersion',
        referral: 'referralVersion',
      };
      const configKey = keyMap[componentId];
      return configKey ? config[configKey] : 1;
    },
    isModalOpen: isSettingsOpen,
  });

  return (
    <div className="relative min-h-screen">
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
                : 'bg-neutral-800 text-white'
            }`}
          >
            {toast.type === 'version' ? <Layers className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
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

      {/* Approval Screen */}
      <ApprovalScreen
        data={mockApprovalData}
        steps={defaultNextSteps}
        config={config}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_15" version="0.4" />
        <Button
          isIconOnly
          radius="md"
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
          onPress={() => setIsSettingsOpen(true)}
          aria-label="Abrir configuración"
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

      {/* Settings Modal */}
      <ApprovalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />

      {/* Current Config Badge */}
      {showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
          <p className="text-xs font-mono text-neutral-700">
            Celebration: V{config.celebrationVersion} | Confetti: V{config.confettiVersion} | Sound: V{config.soundVersion}
          </p>
          <p className="text-xs font-mono text-neutral-700">
            Summary: V{config.summaryVersion} | Steps: V{config.nextStepsVersion} | Share: V{config.shareVersion} | Referral: V{config.referralVersion}
          </p>
        </div>
      )}
    </div>
  );
}
