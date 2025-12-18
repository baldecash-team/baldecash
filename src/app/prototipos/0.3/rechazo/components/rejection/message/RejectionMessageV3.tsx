'use client';

/**
 * RejectionMessageV3 - Mensaje condicional basado en contexto
 *
 * G.4 [DEFINIDO]: Evita "rechazado", usa "En este momento no podemos aprobar tu solicitud"
 * G.5 V3: Condicional - personalizado si hay nombre, genérico si no
 * G.6 [DEFINIDO]: Agradecer por tiempo invertido
 */

import React from 'react';
import { motion } from 'framer-motion';

interface RejectionMessageV3Props {
  userName?: string;
  productName?: string;
  rejectionCategory?: 'credit' | 'income' | 'documentation' | 'other';
}

export const RejectionMessageV3: React.FC<RejectionMessageV3Props> = ({
  userName,
  productName,
  rejectionCategory = 'credit',
}) => {
  const getCategoryMessage = () => {
    switch (rejectionCategory) {
      case 'credit':
        return 'Tu historial crediticio necesita fortalecerse un poco más.';
      case 'income':
        return 'El monto solicitado supera tu capacidad de pago actual.';
      case 'documentation':
        return 'Necesitamos verificar algunos documentos adicionales.';
      default:
        return 'Hay algunos aspectos que necesitamos revisar.';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center mb-6"
    >
      <h1 className="text-2xl font-semibold text-neutral-800 mb-3">
        {userName ? (
          <>{userName}, en este momento no podemos aprobar tu solicitud</>
        ) : (
          <>En este momento no podemos aprobar tu solicitud</>
        )}
      </h1>

      {productName && (
        <p className="text-neutral-600 mb-2">
          para el <span className="font-medium">{productName}</span>
        </p>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-neutral-500 text-sm mb-2"
      >
        {getCategoryMessage()}
      </motion.p>

      <p className="text-neutral-400 text-xs">
        Gracias por tu tiempo. Tenemos alternativas que pueden ayudarte.
      </p>
    </motion.div>
  );
};

export default RejectionMessageV3;
