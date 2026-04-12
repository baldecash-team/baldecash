'use client';

/**
 * ReceivedMessage - Mensaje de solicitud recibida
 * Adapted from v0.5 for v0.6
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ReceivedData } from '../../../types/received';

interface ReceivedMessageProps {
  data: ReceivedData;
}

export const ReceivedMessage: React.FC<ReceivedMessageProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center mb-6 sm:mb-8"
    >
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-800 mb-2 font-['Baloo_2',_sans-serif] leading-tight break-words">
        ¡Hemos recibido tu solicitud, {data.userName}!
      </h1>
      <p className="text-sm sm:text-base text-neutral-600 mb-4 px-2">
        Estamos revisando tu información. Te notificaremos el resultado en un máximo de{' '}
        <span className="font-semibold text-[var(--color-primary)]">{data.estimatedResponseHours} horas</span>.
      </p>
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
