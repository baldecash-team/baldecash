'use client';

/**
 * ExplanationV3 - Explicación conversacional sin especificidades
 *
 * G.7 V3: Conversacional, sin detalles específicos
 * G.9 V3: Sin mostrar sugerencias de mejora
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface ExplanationV3Props {
  canRetryIn?: number;
}

export const ExplanationV3: React.FC<ExplanationV3Props> = ({ canRetryIn }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-6"
    >
      <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div className="space-y-3">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-neutral-700"
            >
              Entendemos que esto no es la noticia que esperabas recibir.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-neutral-600 text-sm"
            >
              Después de revisar tu solicitud, en este momento no nos es posible
              ofrecerte el financiamiento para este producto en particular.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-neutral-600 text-sm"
            >
              Pero no te preocupes, esto no es un &quot;no&quot; definitivo.
              Tenemos algunas opciones que podrían interesarte.
            </motion.p>
            {canRetryIn && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-neutral-400 text-xs pt-2"
              >
                También podrás volver a intentarlo en {canRetryIn} días.
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExplanationV3;
