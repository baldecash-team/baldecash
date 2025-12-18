'use client';

/**
 * RejectionMessageV2 - Mensaje genérico sin nombre
 *
 * G.4 [DEFINIDO]: Evita "rechazado", usa "En este momento no podemos aprobar tu solicitud"
 * G.5 V2: Genérico, sin personalización
 * G.6 [DEFINIDO]: Agradecer por tiempo invertido
 */

import React from 'react';
import { motion } from 'framer-motion';

interface RejectionMessageV2Props {
  productName?: string;
}

export const RejectionMessageV2: React.FC<RejectionMessageV2Props> = ({
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
        En este momento no podemos aprobar tu solicitud
      </h1>

      {productName && (
        <p className="text-neutral-600 mb-2">
          para el <span className="font-medium">{productName}</span>
        </p>
      )}

      <p className="text-neutral-500 text-sm">
        Agradecemos tu tiempo y confianza.
        Esto no significa un &quot;no&quot; definitivo, hay otras opciones disponibles.
      </p>
    </motion.div>
  );
};

export default RejectionMessageV2;
