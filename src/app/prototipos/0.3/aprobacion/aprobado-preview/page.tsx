'use client';

/**
 * Approval Preview Page - BaldeCash v0.3
 *
 * Vista interactiva para probar todas las variaciones de aprobacion
 */

import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import {
  ApprovalScreen,
  ApprovalSettingsModal,
} from '../components/approval';
import { mockApprovalData } from '../data/mockApprovalData';
import { ApprovalConfig, defaultApprovalConfig } from '../types/approval';
import { FloatingControls } from '@/app/prototipos/_shared/components/FloatingControls';

export default function ApprovalPreviewPage() {
  const [config, setConfig] = useState<ApprovalConfig>(defaultApprovalConfig);
  const [showSettings, setShowSettings] = useState(false);
  const [key, setKey] = useState(0);

  // Reset animation when config changes
  const handleConfigChange = (newConfig: ApprovalConfig) => {
    setConfig(newConfig);
    setKey((prev) => prev + 1);
  };

  return (
    <div className="relative">
      {/* Floating Controls */}
      <FloatingControls
        config={config}
        onSettingsClick={() => setShowSettings(true)}
        extraActions={[
          {
            icon: <Trophy className="w-5 h-5 text-neutral-600" />,
            onClick: () => setKey((prev) => prev + 1),
            tooltip: 'Repetir animación',
            variant: 'secondary',
          },
        ]}
      />

      {/* Main Screen */}
      <div key={key}>
        <ApprovalScreen data={mockApprovalData} config={config} />
      </div>

      {/* Settings Modal */}
      <ApprovalSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onConfigChange={handleConfigChange}
      />
    </div>
  );
}
