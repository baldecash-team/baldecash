'use client';

/**
 * Aprobación Preview Page - Configurable demo for approval screen
 * PROMPT_15: Pantalla de Aprobación / Éxito
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, Code, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ApprovalScreen, ApprovalSettingsModal } from '../components/approval';
import { ApprovalConfig, defaultApprovalConfig } from '../types/approval';
import { mockApprovalData, defaultNextSteps } from '../data/mockApprovalData';
import { TokenCounter } from '@/components/ui/TokenCounter';

export default function AprobadoPreviewPage() {
  const router = useRouter();
  const [config, setConfig] = useState<ApprovalConfig>(defaultApprovalConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  return (
    <div className="relative min-h-screen">
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
