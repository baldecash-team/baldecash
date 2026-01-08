'use client';

/**
 * ApprovalScreen - Pantalla principal de aprobación
 * Orquesta todos los componentes de la pantalla de éxito
 * Versión fija para v0.5
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Celebration } from './celebration';
import { ApprovalMessage } from './message';
import { ApprovedProductSummary } from './summary';
import { NextSteps } from './next-steps';
import { ShareButtons, ReferralCTA, CreateAccountCTA } from './actions';
import { ApprovalData, defaultNextSteps } from '../../types/approval';

interface ApprovalScreenProps {
  data: ApprovalData;
}

export const ApprovalScreen: React.FC<ApprovalScreenProps> = ({ data }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4654CD]/5 via-white to-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
        {/* Celebration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-8"
        >
          <Celebration duration={5000} />
        </motion.div>

        {/* Message */}
        <div className="mb-8">
          <ApprovalMessage data={data} />
        </div>

        {/* Product Summary */}
        <div className="mb-8">
          <ApprovedProductSummary data={data} />
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <NextSteps
            steps={defaultNextSteps}
            notificationChannels={data.notificationChannels}
          />
        </div>

        {/* Share Buttons */}
        <div className="mb-6">
          <ShareButtons applicationId={data.applicationId} />
        </div>

        {/* Referral CTA */}
        <div className="mb-8">
          <ReferralCTA />
        </div>

        {/* Account CTA */}
        <CreateAccountCTA />
      </div>
    </div>
  );
};

export default ApprovalScreen;
