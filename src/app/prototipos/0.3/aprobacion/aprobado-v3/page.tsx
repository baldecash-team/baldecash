'use client';

/**
 * Approval V3 Page - BaldeCash v0.3
 *
 * Version 3: Checkmark gigante + Cards + Sin compartir/referidos
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ApprovalScreen } from '../components/approval';
import { mockApprovalData } from '../data/mockApprovalData';
import { ApprovalConfig } from '../types/approval';

const configV3: ApprovalConfig = {
  celebrationVersion: 3,
  confettiIntensity: 'none',
  soundMode: 'off',
  summaryVersion: 3,
  timeEstimateVersion: 3,
  shareVersion: 3,
  referralVersion: 3,
};

export default function ApprovalV3Page() {
  return (
    <div className="relative">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/prototipos/0.3/aprobacion/aprobado-preview">
          <Button
            variant="bordered"
            className="bg-white shadow-lg cursor-pointer"
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Volver
          </Button>
        </Link>
      </div>

      <ApprovalScreen data={mockApprovalData} config={configV3} />
    </div>
  );
}
