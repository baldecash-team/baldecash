'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { ReceivedData } from '../../../types/received';
import type { ModoCierreKyc } from '../../../confirmacionClient';

interface ReceivedMessageProps {
  data: ReceivedData;
  overlayVariant?: string | null;
  /**
   * Se llega desde el cierre del KYC, no desde el submit (ver
   * `modoCierreDelKyc`). Quien cerró el KYC ya fue aprobado y firmó: no hay nada
   * en revisión ni un plazo de respuesta que prometer.
   *
   * Lo que cambia entre los dos modos es de quién es el siguiente paso —del
   * cliente, que ya tiene su fecha de pago, o de un asesor que lo va a
   * contactar—.
   */
  modoCierreKyc?: ModoCierreKyc | null;
}

export const ReceivedMessage: React.FC<ReceivedMessageProps> = ({ data, overlayVariant, modoCierreKyc }) => {
  const isCade = overlayVariant === 'cade';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center mb-6 sm:mb-8"
    >
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-800 mb-2 font-['Baloo_2',_sans-serif] leading-tight break-words">
        {modoCierreKyc === 'completado'
          ? <>¡Felicitaciones por finalizar todo el proceso, {data.userName}! <PartyPopper className="inline w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary)]" /></>
          : modoCierreKyc === 'contactaremos'
            ? <>¡Solicitud enviada, {data.userName}!</>
            : isCade
              ? <>¡Gracias por ser parte del CADE, {data.userName}! <PartyPopper className="inline w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary)]" /></>
              : <>¡Hemos recibido tu solicitud, {data.userName}!</>
        }
      </h1>
      {modoCierreKyc === 'completado' ? (
        <p className="text-sm sm:text-base text-neutral-600 mb-4 px-2">
          Tu contrato quedó <span className="font-semibold text-[var(--color-primary)]">firmado</span>. Te enviamos por
          WhatsApp y correo los siguientes pasos.
        </p>
      ) : modoCierreKyc === 'contactaremos' ? (
        <p className="text-sm sm:text-base text-neutral-600 mb-4 px-2">
          Completaste todos los pasos y tu contrato quedó{' '}
          <span className="font-semibold text-[var(--color-primary)]">firmado</span>. Nos pondremos en contacto contigo
          para coordinar lo que sigue.
        </p>
      ) : (
        <p className="text-sm sm:text-base text-neutral-600 mb-4 px-2">
          Estamos revisando tu información. Te notificaremos el resultado en un máximo de{' '}
          <span className="font-semibold text-[var(--color-primary)]">{data.estimatedResponseHours} horas</span>.
        </p>
      )}
      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-neutral-100 rounded-full max-w-full">
        <span className="text-xs sm:text-sm text-neutral-500 flex-shrink-0">N° de solicitud</span>
        <span className="text-xs sm:text-sm font-mono font-semibold text-neutral-700 break-all">
          {data.applicationId}
        </span>
      </div>
    </motion.div>
  );
};

export default ReceivedMessage;
