'use client';

/**
 * Rejection Preview Page - Configurable preview with settings modal
 * Section 16: Pantalla de Rechazo
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import {
  RejectionScreen,
  RejectionSettingsModal,
} from '../components/rejection';
import {
  RejectionConfig,
  defaultRejectionConfig,
} from '../types/rejection';
import {
  mockRejectionData,
  alternativeProducts,
} from '../data/mockRejectionData';
import { FloatingControls } from '@/app/prototipos/_shared/components/FloatingControls';

export default function RechazadoPreviewPage() {
  const [config, setConfig] = useState<RejectionConfig>(defaultRejectionConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Back to prototypes */}
      <div className="fixed top-4 left-4 z-[60]">
        <Link href="/prototipos/0.3">
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

      {/* Main Screen */}
      <RejectionScreen
        config={config}
        data={mockRejectionData}
        alternativeProducts={alternativeProducts}
        onGoHome={() => window.history.back()}
        onGoBack={() => window.history.back()}
      />

      {/* Settings Modal */}
      <RejectionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
