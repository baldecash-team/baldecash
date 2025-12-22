// SelectionIndicatorV2 - Badge Flotante: "Agregado" flotante sobre card
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface SelectionIndicatorProps {
  isSelected: boolean;
  className?: string;
}

export const SelectionIndicatorV2: React.FC<SelectionIndicatorProps> = ({
  isSelected,
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`absolute top-2 left-2 z-10 ${className}`}
        >
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#4654CD] text-white text-xs font-medium rounded-full shadow-lg">
            <Check className="w-3 h-3" />
            Agregado
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
