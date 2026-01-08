'use client';

/**
 * RejectionMessage - Mensaje de rechazo personalizado
 * Versión fija para v0.5 - Estilo V1 (Nombre prominente)
 */

import React from 'react';
import { motion } from 'framer-motion';

interface RejectionMessageProps {
  userName?: string;
}

export const RejectionMessage: React.FC<RejectionMessageProps> = ({ userName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-center mb-6"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">
        {userName ? (
          <>
            <span className="text-[#4654CD]">{userName}</span>, en este momento no podemos aprobar tu solicitud
          </>
        ) : (
          'En este momento no podemos aprobar tu solicitud'
        )}
      </h1>
      <p className="text-neutral-600">
        Gracias por tu interés en BaldeCash. Aunque no pudimos aprobar esta solicitud, hay otras opciones que podrían funcionarte.
      </p>
    </motion.div>
  );
};

export default RejectionMessage;
