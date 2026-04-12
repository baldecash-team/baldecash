'use client';

/**
 * ReceivedScreen - Pantalla principal de solicitud recibida
 * Orquesta todos los componentes
 * Adapted from v0.5 for v0.6
 */

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
}

export const ReceivedScreen: React.FC<ReceivedScreenProps> = ({ data, onGoToHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-primary)]/5 via-white to-neutral-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Illustration */}
        <Illustration />

        {/* Message */}
        <ReceivedMessage data={data} />

        {/* Application Status */}
        <ApplicationStatus notificationChannels={data.notificationChannels} />

        {/* Product Summary */}
        <ProductSummary data={data} />

        {/* Contact Info */}
        <ContactInfo onGoToHome={onGoToHome} />
      </div>
    </div>
  );
};

export default ReceivedScreen;
