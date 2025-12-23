'use client';

/**
 * ApprovalScreen - Pantalla principal de Aprobación
 * Combina todos los componentes según la configuración A/B
 */

import React from 'react';
import type { ApprovalConfig, ApprovalData, NextStep } from '../../types/approval';
import { defaultApprovalConfig } from '../../types/approval';

// Celebration components
import { CelebrationV1, CelebrationV2, CelebrationV3, CelebrationV4, CelebrationV5, CelebrationV6 } from './celebration';

// Confetti components
import { ConfettiV1, ConfettiV2, ConfettiV3, ConfettiV4, ConfettiV5, ConfettiV6 } from './confetti';

// Sound components
import { SoundConfigV1, SoundConfigV2, SoundConfigV3, SoundConfigV4, SoundConfigV5, SoundConfigV6 } from './sound';

// Summary components
import { ApprovedSummaryV1, ApprovedSummaryV2, ApprovedSummaryV3, ApprovedSummaryV4, ApprovedSummaryV5, ApprovedSummaryV6 } from './summary';

// Next Steps components
import { NextStepsV1, NextStepsV2, NextStepsV3, NextStepsV4, NextStepsV5, NextStepsV6 } from './nextsteps';

// Share components
import { ShareButtonsV1, ShareButtonsV2, ShareButtonsV3, ShareButtonsV4, ShareButtonsV5, ShareButtonsV6 } from './share';

// Referral components
import { ReferralCTAV1, ReferralCTAV2, ReferralCTAV3, ReferralCTAV4, ReferralCTAV5, ReferralCTAV6 } from './referral';

// Actions
import { CreateAccountCTA } from './actions';

interface ApprovalScreenProps {
  data: ApprovalData;
  steps: NextStep[];
  config?: ApprovalConfig;
  resultType?: 'aprobado' | 'recibido';
}

const celebrationComponents = {
  1: CelebrationV1,
  2: CelebrationV2,
  3: CelebrationV3,
  4: CelebrationV4,
  5: CelebrationV5,
  6: CelebrationV6,
};

const confettiComponents = {
  1: ConfettiV1,
  2: ConfettiV2,
  3: ConfettiV3,
  4: ConfettiV4,
  5: ConfettiV5,
  6: ConfettiV6,
};

const soundComponents = {
  1: SoundConfigV1,
  2: SoundConfigV2,
  3: SoundConfigV3,
  4: SoundConfigV4,
  5: SoundConfigV5,
  6: SoundConfigV6,
};

const summaryComponents = {
  1: ApprovedSummaryV1,
  2: ApprovedSummaryV2,
  3: ApprovedSummaryV3,
  4: ApprovedSummaryV4,
  5: ApprovedSummaryV5,
  6: ApprovedSummaryV6,
};

const nextStepsComponents = {
  1: NextStepsV1,
  2: NextStepsV2,
  3: NextStepsV3,
  4: NextStepsV4,
  5: NextStepsV5,
  6: NextStepsV6,
};

const shareComponents = {
  1: ShareButtonsV1,
  2: ShareButtonsV2,
  3: ShareButtonsV3,
  4: ShareButtonsV4,
  5: ShareButtonsV5,
  6: ShareButtonsV6,
};

const referralComponents = {
  1: ReferralCTAV1,
  2: ReferralCTAV2,
  3: ReferralCTAV3,
  4: ReferralCTAV4,
  5: ReferralCTAV5,
  6: ReferralCTAV6,
};

export const ApprovalScreen: React.FC<ApprovalScreenProps> = ({
  data,
  steps,
  config = defaultApprovalConfig,
  resultType = 'aprobado'
}) => {
  const CelebrationComponent = celebrationComponents[config.celebrationVersion];
  const ConfettiComponent = confettiComponents[config.confettiVersion];
  const SoundComponent = soundComponents[config.soundVersion];
  const SummaryComponent = summaryComponents[config.summaryVersion];
  const NextStepsComponent = nextStepsComponents[config.nextStepsVersion];
  const ShareComponent = shareComponents[config.shareVersion];
  const ReferralComponent = referralComponents[config.referralVersion];

  const notificationText = data.notificationChannels
    .map(channel => {
      switch (channel) {
        case 'whatsapp': return 'WhatsApp';
        case 'email': return 'correo electrónico';
        case 'sms': return 'SMS';
        default: return channel;
      }
    })
    .join(' y ');

  return (
    <div className="min-h-screen bg-[#4654CD]/5 relative">
      {/* Confetti Effect */}
      <ConfettiComponent />

      {/* Sound Config */}
      <SoundComponent autoPlay />

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
        {/* Celebration Header */}
        <div className="mb-8">
          <CelebrationComponent
            userName={data.userName}
            applicationId={data.applicationId}
            resultType={resultType}
          />
        </div>

        {/* Product Summary */}
        <div className="mb-8">
          <SummaryComponent data={data} />
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <NextStepsComponent steps={steps} />
        </div>

        {/* Notification Info */}
        <p className="text-sm text-neutral-600 text-center mb-8">
          Te avisaremos por {notificationText}
        </p>

        {/* Create Account CTA */}
        <div className="mb-6">
          <CreateAccountCTA variant="primary" />
        </div>

        {/* Share Buttons */}
        <div className="mb-6">
          <ShareComponent />
        </div>

        {/* Referral CTA */}
        <div className="mb-6">
          <ReferralComponent />
        </div>
      </div>
    </div>
  );
};

export default ApprovalScreen;
