'use client';

/**
 * Hero Preview Page
 *
 * Pagina principal de preview con configurador de versiones
 * Permite probar diferentes combinaciones de componentes
 */

import React, { useState } from 'react';
import { HeroSection, HeroSettingsModal } from '../components/hero';
import { HeroConfig, defaultHeroConfig } from '../types/hero';
import { FloatingControls } from '@/app/prototipos/_shared/components/FloatingControls';

export default function HeroPreviewPage() {
  const [config, setConfig] = useState<HeroConfig>(defaultHeroConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Floating Controls */}
      <FloatingControls
        config={config}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

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
