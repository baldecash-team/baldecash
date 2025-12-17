'use client';

/**
 * Hero Preview Page
 *
 * Pagina principal de preview con configurador de versiones
 * Permite probar diferentes combinaciones de componentes
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, Eye, Code } from 'lucide-react';
import { HeroSection, HeroSettingsModal } from '../components/hero';
import { HeroConfig, defaultHeroConfig } from '../types/hero';

export default function HeroPreviewPage() {
  const [config, setConfig] = useState<HeroConfig>(defaultHeroConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="relative">
      {/* Floating Controls */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <Button
          isIconOnly
          className="bg-white shadow-lg border border-neutral-200"
          size="lg"
          onPress={() => setShowConfig(!showConfig)}
        >
          <Code className="w-5 h-5 text-neutral-600" />
        </Button>
        <Button
          isIconOnly
          className="bg-[#4654CD] text-white shadow-lg"
          size="lg"
          onPress={() => setIsSettingsOpen(true)}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="fixed bottom-20 right-6 z-50 bg-white rounded-lg shadow-xl border border-neutral-200 p-4 w-72">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Configuracion Actual
          </h4>
          <pre className="text-xs bg-neutral-50 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection config={config} />

      {/* Settings Modal */}
      <HeroSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
