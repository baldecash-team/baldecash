'use client';

/**
 * RejectionVisualV1 - Colores neutros con persona pensativa
 *
 * G.1 V1: Neutros (grises, sin color de marca prominente)
 * G.2 V1: Persona pensativa/reflexiva
 */

import React from 'react';
import { motion } from 'framer-motion';
import { User, HelpCircle } from 'lucide-react';
import { RejectionConfig } from '../../../types/rejection';

interface RejectionVisualV1Props {
  illustrationType: RejectionConfig['illustrationType'];
}

export const RejectionVisualV1: React.FC<RejectionVisualV1Props> = ({
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
          {/* Thinking person illustration */}
          <div className="w-28 h-28 rounded-full bg-neutral-200 flex items-center justify-center">
            <User className="w-14 h-14 text-neutral-400" />
          </div>
          {/* Thought bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-neutral-300 flex items-center justify-center"
          >
            <HelpCircle className="w-5 h-5 text-neutral-500" />
          </motion.div>
          {/* Small thought bubbles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute top-0 right-8 w-3 h-3 rounded-full bg-neutral-300"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-4 right-10 w-2 h-2 rounded-full bg-neutral-300"
          />
        </div>
      ) : illustrationType === 'path' ? (
        <div className="relative w-40 h-28">
          {/* Path with fork illustration */}
          <svg viewBox="0 0 160 112" className="w-full h-full">
            <motion.path
              d="M80 112 L80 60 L40 20"
              stroke="#d4d4d4"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />
            <motion.path
              d="M80 60 L120 20"
              stroke="#a3a3a3"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            {/* Markers at the ends */}
            <motion.circle
              cx="40"
              cy="20"
              r="8"
              fill="#a3a3a3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 }}
            />
            <motion.circle
              cx="120"
              cy="20"
              r="8"
              fill="#737373"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 }}
            />
          </svg>
        </div>
      ) : (
        // No illustration - just icon
        <div className="w-20 h-20 rounded-full bg-neutral-200 flex items-center justify-center">
          <HelpCircle className="w-10 h-10 text-neutral-400" />
        </div>
      )}
    </motion.div>
  );
};

export default RejectionVisualV1;
