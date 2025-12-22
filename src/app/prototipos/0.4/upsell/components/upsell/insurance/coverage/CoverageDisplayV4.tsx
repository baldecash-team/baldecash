// CoverageDisplayV4 - Reveal Animado: Lista que revela uno por uno
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { CoverageItem } from '../../../../types/upsell';

interface CoverageDisplayProps {
  coverage: CoverageItem[];
  exclusions: string[];
  className?: string;
}

export const CoverageDisplayV4: React.FC<CoverageDisplayProps> = ({
  coverage,
  exclusions,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Coverage with staggered animation */}
      {coverage.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-3 p-3 bg-white border border-neutral-100 rounded-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
            className="w-8 h-8 rounded-full bg-[#03DBD0] flex items-center justify-center shrink-0"
          >
            <Check className="w-4 h-4 text-white" />
          </motion.div>
          <div>
            <p className="font-medium text-neutral-900">{item.name}</p>
            <p className="text-sm text-neutral-500">{item.description}</p>
          </div>
        </motion.div>
      ))}

      {/* Exclusions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: coverage.length * 0.1 + 0.3 }}
        className="pt-3 border-t border-neutral-100"
      >
        <p className="text-xs text-neutral-400 mb-2">No incluido:</p>
        <div className="flex flex-wrap gap-2">
          {exclusions.map((exclusion, i) => (
            <motion.span
              key={exclusion}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: coverage.length * 0.1 + 0.4 + i * 0.05 }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-500 text-xs rounded"
            >
              <X className="w-3 h-3" />
              {exclusion}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CoverageDisplayV4;
