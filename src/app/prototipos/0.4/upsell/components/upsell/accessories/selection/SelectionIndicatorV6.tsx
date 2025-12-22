// SelectionIndicatorV6 - Expand: Card se expande con impacto
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

interface SelectionIndicatorProps {
  isSelected: boolean;
  className?: string;
}

export const SelectionIndicatorV6: React.FC<SelectionIndicatorProps> = ({
  isSelected,
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`absolute inset-0 z-10 pointer-events-none ${className}`}
        >
          {/* Border glow effect */}
          <div className="absolute inset-0 border-2 border-[#4654CD] rounded-xl" />

          {/* Top badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              className="flex items-center gap-1 px-3 py-1 bg-[#4654CD] text-white text-sm font-medium rounded-full shadow-lg"
            >
              <Sparkles className="w-3 h-3" />
              Agregado
              <Check className="w-3 h-3" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
