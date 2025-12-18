'use client';

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { WizardContainer } from './components/wizard/WizardContainer';
import { WizardSettingsModal } from './components/wizard/WizardSettingsModal';
import type { WizardConfig } from './types/wizard';

const defaultConfig: WizardConfig = {
  layoutVersion: 2,
  progressVersion: 1,
  navigationVersion: 2,
  stepLayoutVersion: 2,
  motivationVersion: 1,
  celebrationVersion: 2,
  allowFreeNavigation: false,
  autoSave: true,
  showTimeEstimate: true,
};

export default function SolicitudPage() {
  const [config, setConfig] = useState<WizardConfig>(defaultConfig);
  const [showSettings, setShowSettings] = useState(false);

  const handleComplete = (data: Record<string, unknown>) => {
    console.log('Solicitud completada:', data);
    alert('¡Solicitud enviada exitosamente!');
  };

  const handleSave = (data: Record<string, unknown>) => {
    console.log('Progreso guardado:', data);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Dev toolbar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Link href="/prototipos/0.3/solicitud/wizard-preview">
          <Button
            variant="bordered"
            size="sm"
            startContent={<ExternalLink className="w-4 h-4" />}
            className="bg-white cursor-pointer"
          >
            Preview
          </Button>
        </Link>
        <Button
          variant="bordered"
          size="sm"
          isIconOnly
          onPress={() => setShowSettings(true)}
          className="bg-white cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Back link */}
      <Link
        href="/prototipos/0.3"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-sm text-neutral-500 hover:text-[#4654CD] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a prototipos
      </Link>

      {/* Wizard */}
      <WizardContainer
        config={config}
        onComplete={handleComplete}
        onSave={handleSave}
      />

      {/* Settings Modal */}
      <WizardSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
