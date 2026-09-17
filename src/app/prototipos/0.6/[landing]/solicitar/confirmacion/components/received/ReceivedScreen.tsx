'use client';

import React from 'react';
import { ReceivedData } from '../../types/received';
import type { ModoCierreKyc } from '../../confirmacionClient';
import { Illustration } from './illustration';
import { ReceivedMessage } from './message';
import { ProductSummary } from './summary';
import { ContactInfo } from './contact';
import { DescargarConstancia } from './DescargarConstancia';

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
   */
  modoCierreKyc?: ModoCierreKyc | null;
  /** Cómo terminó, según ws2. Ver `ReceivedMessage`. */
  cierre?: { firmada: boolean; pendiente: { pago_inicial: boolean; formulario: boolean } } | null;
  /** Para ofrecer la copia del contrato que dejó el cierre del KYC. */
  landing?: string;
  applicationCode?: string | null;
  onDescargarConstancia?: () => void;
}

export const ReceivedScreen: React.FC<ReceivedScreenProps> = ({ data, onGoToHome, overlayVariant, showGoHome = true, otpCta, modoCierreKyc, cierre, landing, applicationCode, onDescargarConstancia }) => {
  return (
    <div className="bg-gradient-to-b from-[var(--color-primary)]/5 via-[var(--surface-bg,#ffffff)] to-[var(--surface-bg,#fafafa)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <Illustration overlayVariant={overlayVariant} />
        <ReceivedMessage data={data} overlayVariant={overlayVariant} modoCierreKyc={modoCierreKyc} cierre={cierre} />
        {otpCta}
        {/* Sin el timeline de estado ("Solicitud enviada → En revisión →
            Respuesta"): el mensaje de arriba ya dice cómo terminó, y a quien
            llega desde el cierre del KYC —aprobado y firmado— le diría que
            su solicitud sigue evaluándose. */}
        <ProductSummary data={data} />
        {/* Va antes del contacto: es lo último accionable que le queda por
            hacer a la persona, no una nota al pie. */}
        {landing && (
          <DescargarConstancia
            landing={landing}
            applicationCode={applicationCode}
            onDescargar={onDescargarConstancia}
          />
        )}
        <ContactInfo onGoToHome={onGoToHome} showGoHome={showGoHome} />
      </div>
    </div>
  );
};

export default ReceivedScreen;
