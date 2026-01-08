'use client';

/**
 * ReceivedScreen - Pantalla principal de solicitud recibida
 * Orquesta todos los componentes
 * Versión fija para v0.5
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
}

export const ReceivedScreen: React.FC<ReceivedScreenProps> = ({ data }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4654CD]/5 via-white to-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
        {/* Illustration */}
        <Illustration />

        {/* Message */}
        <ReceivedMessage data={data} />

        {/* Application Status */}
        <ApplicationStatus notificationChannels={data.notificationChannels} />

        {/* Product Summary */}
        <ProductSummary data={data} />

        {/* Contact Info */}
        <ContactInfo />
      </div>
    </div>
  );
};

export default ReceivedScreen;
