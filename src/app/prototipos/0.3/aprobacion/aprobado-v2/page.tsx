'use client';

/**
 * Approval V2 Page - BaldeCash v0.3
 *
 * Version 2: Ilustracion + Checklist + Links sutiles
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ApprovalScreen } from '../components/approval';
import { mockApprovalData } from '../data/mockApprovalData';
import { ApprovalConfig } from '../types/approval';

const configV2: ApprovalConfig = {
  celebrationVersion: 2,
  confettiIntensity: 'subtle',
  soundMode: 'off',
  summaryVersion: 2,
  timeEstimateVersion: 2,
  shareVersion: 2,
  referralVersion: 2,
};

export default function ApprovalV2Page() {
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

      <ApprovalScreen data={mockApprovalData} config={configV2} />
    </div>
  );
}
