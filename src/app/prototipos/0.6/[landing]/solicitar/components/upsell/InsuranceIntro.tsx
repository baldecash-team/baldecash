'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

/**
 * InsuranceIntro - v0.6 con CSS variables del landing
 * Usa --color-primary en lugar de colores hardcodeados
 */
export const InsuranceIntro: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          animate={{
            boxShadow: ['0 0 0 0 rgba(var(--color-primary-rgb), 0.4)', '0 0 0 10px rgba(var(--color-primary-rgb), 0)', '0 0 0 0 rgba(var(--color-primary-rgb), 0)']
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center"
        >
          <ShieldCheck className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-800">
            Tu laptop, siempre protegida
          </h2>
          <p className="text-sm text-[var(--color-primary)]">
            Planes flexibles y opcionales
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default InsuranceIntro;
