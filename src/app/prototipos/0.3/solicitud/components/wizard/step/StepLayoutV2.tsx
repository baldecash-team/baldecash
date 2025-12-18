'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import type { StepLayoutProps } from '../../../types/wizard';

/**
 * StepLayoutV2 - Formulario con secciones
 *
 * C.12 V2: Varios campos agrupados lógicamente
 * C.13 V2: Secciones con títulos internos
 */
export const StepLayoutV2: React.FC<StepLayoutProps> = ({
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
      className="w-full max-w-xl mx-auto"
    >
      {/* Step header with badge */}
      <div className="flex items-start gap-4 mb-6 pb-6 border-b border-neutral-200">
        <div className="w-12 h-12 rounded-xl bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-[#4654CD]">
            {step.order}
          </span>
        </div>

        <div className="flex-1">
          <motion.h2
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-neutral-800"
          >
            {step.name}
          </motion.h2>

          {showDescription && step.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-neutral-500 mt-1"
            >
              {step.description}
            </motion.p>
          )}
        </div>
      </div>

      {/* Step content - grouped fields */}
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

export default StepLayoutV2;
