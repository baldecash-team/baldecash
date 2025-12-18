'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '@nextui-org/react';
import type { StepLayoutProps } from '../../../types/wizard';

/**
 * StepLayoutV3 - Cards por sección
 *
 * C.12 V3: Un card por grupo de campos relacionados
 * C.13 V3: Visual separation clara entre grupos
 */
export const StepLayoutV3: React.FC<StepLayoutProps> = ({
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
      {/* Floating step indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#4654CD] text-white rounded-full mb-6"
      >
        <span className="text-sm font-semibold">Paso {step.order}</span>
        <span className="w-1 h-1 rounded-full bg-white/50" />
        <span className="text-sm opacity-90">{step.shortName}</span>
      </motion.div>

      {/* Step header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          {step.name}
        </h2>

        {showDescription && step.description && (
          <p className="text-neutral-500">
            {step.description}
          </p>
        )}
      </motion.div>

      {/* Content in cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border border-neutral-200 shadow-sm">
          <CardBody className="p-6 space-y-6">
            {children}
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StepLayoutV3;
