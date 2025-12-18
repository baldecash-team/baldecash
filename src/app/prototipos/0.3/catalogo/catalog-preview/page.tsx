'use client';

/**
 * Catalog Preview Page
 *
 * Pagina principal de preview con configurador de versiones
 * Permite probar diferentes combinaciones de componentes
 */

import React, { useState } from 'react';
import { CatalogSection, CatalogSettingsModal } from '../components/catalog';
import { CatalogConfig, defaultCatalogConfig } from '../types/catalog';
import { FloatingControls } from '@/app/prototipos/_shared/components/FloatingControls';

export default function CatalogPreviewPage() {
  const [config, setConfig] = useState<CatalogConfig>(defaultCatalogConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Floating Controls */}
      <FloatingControls
        config={config}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Catalog Section */}
      <CatalogSection config={config} />

      {/* Settings Modal */}
      <CatalogSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
