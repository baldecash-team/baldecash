'use client';

/**
 * RejectionMessageV1 - Mensaje personalizado con nombre
 *
 * G.4 [DEFINIDO]: Evita "rechazado", usa "En este momento no podemos aprobar tu solicitud"
 * G.5 V1: Personalizado con nombre del usuario
 * G.6 [DEFINIDO]: Agradecer por tiempo invertido
 */

import React from 'react';
import { motion } from 'framer-motion';

interface RejectionMessageV1Props {
  userName: string;
  productName?: string;
}

export const RejectionMessageV1: React.FC<RejectionMessageV1Props> = ({
  userName,
  productName,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center mb-6"
    >
      <h1 className="text-2xl font-semibold text-neutral-800 mb-3">
        {userName}, en este momento no podemos aprobar tu solicitud
      </h1>

      {productName && (
        <p className="text-neutral-600 mb-2">
          para el <span className="font-medium">{productName}</span>
        </p>
      )}

      <p className="text-neutral-500 text-sm">
        Gracias por tu tiempo y por confiar en nosotros.
        Valoramos tu interés y queremos ayudarte a encontrar una solución.
      </p>
    </motion.div>
  );
};

export default RejectionMessageV1;
