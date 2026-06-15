'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { ReceivedData } from '../../../types/received';

interface ReceivedMessageProps {
  data: ReceivedData;
  overlayVariant?: string | null;
}

export const ReceivedMessage: React.FC<ReceivedMessageProps> = ({ data, overlayVariant }) => {
  const isCade = overlayVariant === 'cade';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center mb-6 sm:mb-8"
    >
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-strong,#1f2937)] mb-2 font-['Baloo_2',_sans-serif] leading-tight break-words">
        {isCade
          ? <>¡Gracias por ser parte del CADE, {data.userName}! <PartyPopper className="inline w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary)]" /></>
          : <>¡Hemos recibido tu solicitud, {data.userName}!</>
        }
      </h1>
      <p className="text-sm sm:text-base text-[var(--text-muted,#4b5563)] mb-4 px-2">
        Estamos revisando tu información. Te notificaremos el resultado en un máximo de{' '}
        <span className="font-semibold text-[var(--color-primary)]">{data.estimatedResponseHours} horas</span>.
      </p>
      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[var(--surface-2,#f3f4f6)] rounded-full max-w-full">
        <span className="text-xs sm:text-sm text-[var(--text-muted,#6b7280)] flex-shrink-0">N° de solicitud</span>
        <span className="text-xs sm:text-sm font-mono font-semibold text-[var(--text,#374151)] break-all">
          {data.applicationId}
        </span>
      </div>
    </motion.div>
  );
};

export default ReceivedMessage;
