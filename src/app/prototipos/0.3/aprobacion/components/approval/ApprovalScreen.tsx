'use client';

/**
 * ApprovalScreen - Pantalla principal de aprobacion
 *
 * Orquesta todos los componentes de la pantalla de exito
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CelebrationV1 } from './celebration/CelebrationV1';
import { CelebrationV2 } from './celebration/CelebrationV2';
import { CelebrationV3 } from './celebration/CelebrationV3';
import { ApprovalMessageV1 } from './message/ApprovalMessageV1';
import { ApprovalMessageV2 } from './message/ApprovalMessageV2';
import { ApprovedProductSummary } from './summary/ApprovedProductSummary';
import { NextStepsV1 } from './next-steps/NextStepsV1';
import { NextStepsV2 } from './next-steps/NextStepsV2';
import { NextStepsV3 } from './next-steps/NextStepsV3';
import { ShareButtons } from './actions/ShareButtons';
import { ReferralCTA } from './actions/ReferralCTA';
import { CreateAccountCTA } from './actions/CreateAccountCTA';
import {
  ApprovalConfig,
  ApprovalData,
  defaultNextSteps,
} from '../../types/approval';

interface ApprovalScreenProps {
  data: ApprovalData;
  config: ApprovalConfig;
}

export const ApprovalScreen: React.FC<ApprovalScreenProps> = ({
  data,
  config,
}) => {
  // Select celebration component
  const CelebrationComponent = {
    1: CelebrationV1,
    2: CelebrationV2,
    3: CelebrationV3,
  }[config.celebrationVersion];

  // Select message component (always celebratory per F.4)
  const MessageComponent =
    config.celebrationVersion === 1 ? ApprovalMessageV2 : ApprovalMessageV1;

  // Select next steps component
  const NextStepsComponent = {
    1: NextStepsV1,
    2: NextStepsV2,
    3: NextStepsV3,
  }[config.celebrationVersion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4654CD]/5 via-white to-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
        {/* Celebration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-8"
        >
          <CelebrationComponent
            duration={config.confettiIntensity === 'exuberant' ? 5000 : 2000}
          />
        </motion.div>

        {/* Message */}
        <div className="mb-8">
          <MessageComponent data={data} />
        </div>

        {/* Product Summary */}
        <div className="mb-8">
          <ApprovedProductSummary data={data} version={config.summaryVersion} />
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <NextStepsComponent
            steps={defaultNextSteps}
            timeEstimateVersion={config.timeEstimateVersion}
            notificationChannels={data.notificationChannels}
          />
        </div>

        {/* Share Buttons */}
        <div className="mb-6">
          <ShareButtons
            version={config.shareVersion}
            applicationId={data.applicationId}
          />
        </div>

        {/* Referral CTA */}
        <div className="mb-8">
          <ReferralCTA version={config.referralVersion} />
        </div>

        {/* Account CTA */}
        <CreateAccountCTA />
      </div>
    </div>
  );
};

export default ApprovalScreen;
