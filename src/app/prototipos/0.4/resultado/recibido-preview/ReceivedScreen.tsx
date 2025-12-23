'use client';

/**
 * ReceivedScreen - Pantalla de Solicitud Recibida
 * Same as ApprovalScreen but with messaging that request will be evaluated in 24h
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Eye, Clock } from 'lucide-react';
import type { ApprovalConfig, ApprovalData, NextStep } from '../types/approval';
import { defaultApprovalConfig } from '../types/approval';

// Celebration components - we'll create custom versions with "Recibida" text
import { CelebrationV1, CelebrationV2, CelebrationV3, CelebrationV4, CelebrationV5, CelebrationV6 } from '../components/approval/celebration';

// Other components reused from approval
import { ConfettiV1, ConfettiV2, ConfettiV3, ConfettiV4, ConfettiV5, ConfettiV6 } from '../components/approval/confetti';
import { SoundConfigV1, SoundConfigV2, SoundConfigV3, SoundConfigV4, SoundConfigV5, SoundConfigV6 } from '../components/approval/sound';
import { ApprovedSummaryV1, ApprovedSummaryV2, ApprovedSummaryV3, ApprovedSummaryV4, ApprovedSummaryV5, ApprovedSummaryV6 } from '../components/approval/summary';
import { NextStepsV1, NextStepsV2, NextStepsV3, NextStepsV4, NextStepsV5, NextStepsV6 } from '../components/approval/nextsteps';
import { ShareButtonsV1, ShareButtonsV2, ShareButtonsV3, ShareButtonsV4, ShareButtonsV5, ShareButtonsV6 } from '../components/approval/share';
import { ReferralCTAV1, ReferralCTAV2, ReferralCTAV3, ReferralCTAV4, ReferralCTAV5, ReferralCTAV6 } from '../components/approval/referral';
import { CreateAccountCTA } from '../components/approval/actions';

interface ReceivedScreenProps {
  data: ApprovalData;
  steps: NextStep[];
  config?: ApprovalConfig;
  onViewProduct?: () => void;
}

// Custom Celebration wrapper that changes the text
const ReceivedCelebrationWrapper: React.FC<{
  CelebrationComponent: React.ComponentType<{ userName: string; applicationId: string }>;
  userName: string;
  applicationId: string;
}> = ({ CelebrationComponent, userName, applicationId }) => {
  // We'll render the original celebration but override the text via CSS/overlay
  // For simplicity, we'll create a custom celebration inline
  return (
    <div className="text-center">
      {/* This wraps the original celebration but we override the message */}
      <CelebrationComponent userName={userName} applicationId={applicationId} />
      {/* Override text - hidden for now, using different approach */}
    </div>
  );
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

// Custom celebration for "Recibida" - reuses structure but different text
import { motion } from 'framer-motion';
import { FileText, PartyPopper, CheckCircle } from 'lucide-react';

const ReceivedCelebration: React.FC<{ userName: string; applicationId: string }> = ({ userName, applicationId }) => {
  return (
    <div className="text-center">
      {/* Icono animado */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="relative w-28 h-28 mx-auto mb-6"
      >
        <div className="absolute inset-0 bg-[#4654CD] rounded-full animate-ping opacity-25" />
        <div className="relative w-full h-full bg-[#4654CD] rounded-full flex items-center justify-center shadow-lg shadow-[#4654CD]/30">
          <FileText className="w-16 h-16 text-white" />
        </div>

        {/* Clock icon indicating processing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-2 -right-2"
        >
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      </motion.div>

      {/* Mensaje principal - CHANGED TEXT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2">
          ¡Gracias {userName}!
        </h1>
        <p className="text-xl text-[#4654CD] font-semibold mb-2">
          Tu solicitud ha sido recibida
        </p>
        <p className="text-neutral-500 text-sm mb-4">
          Solicitud #{applicationId}
        </p>
        {/* Additional message about evaluation */}
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          Será evaluada en las próximas 24 horas
        </div>
      </motion.div>
    </div>
  );
};

export const ReceivedScreen: React.FC<ReceivedScreenProps> = ({
  data,
  steps,
  config = defaultApprovalConfig,
  onViewProduct,
}) => {
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
      {/* Confetti Effect - subtle for received */}
      <ConfettiComponent />

      {/* Sound Config */}
      <SoundComponent autoPlay />

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
        {/* Custom Celebration Header for "Recibida" */}
        <div className="mb-8">
          <ReceivedCelebration
            userName={data.userName}
            applicationId={data.applicationId}
          />
        </div>

        {/* Product Summary */}
        <div className="mb-8">
          <SummaryComponent data={data} />
          {/* View Product Button */}
          {onViewProduct && (
            <div className="mt-4">
              <Button
                className="w-full bg-[#4654CD]/10 text-[#4654CD] font-semibold cursor-pointer hover:bg-[#4654CD]/20 transition-colors"
                radius="lg"
                size="lg"
                startContent={<Eye className="w-5 h-5" />}
                onPress={onViewProduct}
              >
                Ver detalle del producto
              </Button>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <NextStepsComponent steps={steps} />
        </div>

        {/* Notification Info - Modified for pending evaluation */}
        <p className="text-sm text-neutral-600 text-center mb-8">
          Te notificaremos el resultado por {notificationText}
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

export default ReceivedScreen;
