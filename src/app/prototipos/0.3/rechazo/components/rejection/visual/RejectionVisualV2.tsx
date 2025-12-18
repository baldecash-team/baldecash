'use client';

/**
 * RejectionVisualV2 - Colores calidos acogedores
 *
 * G.1 V2: Calidos (beige, crema, acogedores)
 * G.2 V2: Camino con bifurcacion
 */

import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, ArrowUpRight } from 'lucide-react';
import { RejectionConfig } from '../../../types/rejection';

interface RejectionVisualV2Props {
  illustrationType: RejectionConfig['illustrationType'];
}

export const RejectionVisualV2: React.FC<RejectionVisualV2Props> = ({
  illustrationType,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center mb-8"
    >
      {illustrationType === 'person' ? (
        <div className="relative">
          {/* Warm colored person */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border-4 border-amber-200">
            <User className="w-14 h-14 text-amber-600" />
          </div>
          {/* Decorative elements */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-100 rounded-full"
          >
            <span className="text-xs text-amber-700">Hay opciones</span>
          </motion.div>
        </div>
      ) : illustrationType === 'path' ? (
        <div className="relative w-48 h-32 bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl p-4">
          {/* Path with multiple directions */}
          <div className="relative h-full">
            {/* Main path */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-12 bg-amber-300 rounded-full" />
            {/* Left branch */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-12 left-4 right-1/2 h-1 bg-amber-200 rounded-full origin-right"
            />
            {/* Right branch */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-12 left-1/2 right-4 h-1 bg-amber-400 rounded-full origin-left"
            />
            {/* Markers */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute top-2 left-2"
            >
              <MapPin className="w-6 h-6 text-amber-400" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="absolute top-2 right-2"
            >
              <ArrowUpRight className="w-6 h-6 text-amber-600" />
            </motion.div>
          </div>
        </div>
      ) : (
        // Warm minimal icon
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
          <MapPin className="w-10 h-10 text-amber-500" />
        </div>
      )}
    </motion.div>
  );
};

export default RejectionVisualV2;
