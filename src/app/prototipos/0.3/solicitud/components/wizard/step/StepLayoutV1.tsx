'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { StepLayoutProps } from '../../../types/wizard';

/**
 * StepLayoutV1 - Single column centrado
 *
 * C.12 V1: Una pregunta por pantalla
 * C.13 V1: Título del paso arriba, campos abajo
 */
export const StepLayoutV1: React.FC<StepLayoutProps> = ({
  step,
  children,
  showDescription = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Step header */}
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-neutral-800 mb-2"
        >
          {step.name}
        </motion.h2>

        {showDescription && step.description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-500"
          >
            {step.description}
          </motion.p>
        )}
      </div>

      {/* Step content - one question at a time */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default StepLayoutV1;
