'use client';

/**
 * RejectionVisualV3 - Colores de marca suavizados, minimalista
 *
 * G.1 V3: Mantener colores de marca pero suavizados
 * G.2 V3: Sin ilustracion, solo iconografia
 * G.3 V1: Minimalista
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Info, XCircle } from 'lucide-react';

interface RejectionVisualV3Props {
  brandingLevel?: 'minimal' | 'full' | 'logo_only';
}

export const RejectionVisualV3: React.FC<RejectionVisualV3Props> = ({
  brandingLevel = 'minimal',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center mb-8"
    >
      <div className="relative">
        {/* Main icon with brand color softened */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-[#4654CD]/10 flex items-center justify-center"
        >
          <AlertCircle className="w-12 h-12 text-[#4654CD]/60" />
        </motion.div>

        {/* Subtle animated ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: 2,
            repeatDelay: 0.5,
          }}
          className="absolute inset-0 rounded-full border-2 border-[#4654CD]/20"
        />

        {/* Small info badge */}
        {brandingLevel !== 'minimal' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center"
          >
            <Info className="w-4 h-4 text-[#4654CD]" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RejectionVisualV3;
