'use client';

/**
 * ReceivedMessage - Mensaje de solicitud recibida
 * Versión fija para v0.5
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
      className="text-center mb-8"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
        ¡Hemos recibido tu solicitud, {data.userName}!
      </h1>
      <p className="text-neutral-600 mb-4">
        Estamos revisando tu información. Te notificaremos el resultado en un máximo de{' '}
        <span className="font-semibold text-[#4654CD]">{data.estimatedResponseHours} horas</span>.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full">
        <span className="text-sm text-neutral-500">N° de solicitud</span>
        <span className="text-sm font-mono font-semibold text-neutral-700">
          {data.applicationId}
        </span>
      </div>
    </motion.div>
  );
};

export default ReceivedMessage;
