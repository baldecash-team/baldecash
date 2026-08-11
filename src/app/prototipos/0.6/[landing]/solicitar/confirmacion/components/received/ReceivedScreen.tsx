'use client';

import React from 'react';
import { ReceivedData } from '../../types/received';
import type { ModoCierreKyc } from '../../confirmacionClient';
import { Illustration } from './illustration';
import { ReceivedMessage } from './message';
import { ApplicationStatus } from './status';
import { ProductSummary } from './summary';
import { ContactInfo } from './contact';

interface ReceivedScreenProps {
  data: ReceivedData;
  onGoToHome?: () => void;
  overlayVariant?: string | null;
  /** Mostrar el botón "Volver al inicio" (default true). */
  showGoHome?: boolean;
  /** CTA opcional (p. ej. validar correo/OTP), renderizado bajo el encabezado. */
  otpCta?: React.ReactNode;
  /**
   * Se llega desde el cierre del KYC y no desde el submit (ver
   * `modoCierreDelKyc`). `null` es la pantalla de siempre.
   *
   * En ambos modos cae el timeline de estado: sus tres pasos son "Solicitud
   * enviada → En revisión → Respuesta", y quien cerró el KYC ya fue aprobado y
   * firmó. Dejarlo diría que su solicitud sigue evaluándose, que es justo lo
   * contrario de lo que acaba de pasar.
   */
  modoCierreKyc?: ModoCierreKyc | null;
}

export const ReceivedScreen: React.FC<ReceivedScreenProps> = ({ data, onGoToHome, overlayVariant, showGoHome = true, otpCta, modoCierreKyc }) => {
  return (
    <div className="bg-gradient-to-b from-[var(--color-primary)]/5 via-[var(--surface-bg,#ffffff)] to-[var(--surface-bg,#fafafa)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <Illustration overlayVariant={overlayVariant} />
        <ReceivedMessage data={data} overlayVariant={overlayVariant} modoCierreKyc={modoCierreKyc} />
        {otpCta}
        {!modoCierreKyc && <ApplicationStatus notificationChannels={data.notificationChannels} />}
        <ProductSummary data={data} />
        <ContactInfo onGoToHome={onGoToHome} showGoHome={showGoHome} />
      </div>
    </div>
  );
};

export default ReceivedScreen;
