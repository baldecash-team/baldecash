'use client';

/**
 * Rejection Preview Page - Configurable preview with settings modal
 * Section 16: Pantalla de Rechazo
 */

import React, { useState } from 'react';

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
    <div className="relative">
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
