'use client';

/**
 * Approval V1 Page - BaldeCash v0.3
 *
 * Version 1: Confetti exuberante + Timeline + Botones prominentes
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ApprovalScreen } from '../components/approval';
import { mockApprovalData } from '../data/mockApprovalData';
import { ApprovalConfig } from '../types/approval';

const configV1: ApprovalConfig = {
  celebrationVersion: 1,
  confettiIntensity: 'exuberant',
  soundMode: 'off',
  summaryVersion: 1,
  timeEstimateVersion: 1,
  shareVersion: 1,
  referralVersion: 1,
};

export default function ApprovalV1Page() {
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

      <ApprovalScreen data={mockApprovalData} config={configV1} />
    </div>
  );
}
