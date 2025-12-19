'use client';

/**
 * Catalog Preview Page - v0.4
 *
 * Pagina principal de preview con configurador de versiones
 * Permite probar diferentes combinaciones de componentes
 * 10 layouts x 10 brand filters x 3 cards = 300 combinaciones
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CatalogSection, CatalogSettingsModal } from '../components/catalog';
import { CatalogConfig, defaultCatalogConfig } from '../types/catalog';
import { FloatingControls } from '@/app/prototipos/_shared/components/FloatingControls';

export default function CatalogPreviewPage() {
  const [config, setConfig] = useState<CatalogConfig>(defaultCatalogConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Back to prototypes */}
      <div className="fixed top-4 left-4 z-[60]">
        <Link href="/prototipos/0.4">
          <Button
            variant="flat"
            size="sm"
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="bg-white shadow-md cursor-pointer"
          >
            Prototipos
          </Button>
        </Link>
      </div>

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
