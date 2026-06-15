'use client';

import React from 'react';
import { ReceivedData } from '../../types/received';
import { Illustration } from './illustration';
import { ReceivedMessage } from './message';
import { ApplicationStatus } from './status';
import { ProductSummary } from './summary';
import { ContactInfo } from './contact';

interface ReceivedScreenProps {
  data: ReceivedData;
  onGoToHome?: () => void;
  overlayVariant?: string | null;
}

export const ReceivedScreen: React.FC<ReceivedScreenProps> = ({ data, onGoToHome, overlayVariant }) => {
  return (
    <div className="bg-gradient-to-b from-[var(--color-primary)]/5 via-[var(--surface-bg,#ffffff)] to-[var(--surface-bg,#fafafa)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <Illustration overlayVariant={overlayVariant} />
        <ReceivedMessage data={data} overlayVariant={overlayVariant} />
        <ApplicationStatus notificationChannels={data.notificationChannels} />
        <ProductSummary data={data} />
        <ContactInfo onGoToHome={onGoToHome} />
      </div>
    </div>
  );
};

export default ReceivedScreen;
