// SelectionIndicatorV4 - Bounce + Glow: Animación de confirmación
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface SelectionIndicatorProps {
  isSelected: boolean;
  className?: string;
}

export const SelectionIndicatorV4: React.FC<SelectionIndicatorProps> = ({
  isSelected,
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={`absolute top-2 right-2 z-10 ${className}`}
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(70, 84, 205, 0.4)',
                '0 0 0 8px rgba(70, 84, 205, 0)',
              ],
            }}
            transition={{ duration: 0.6 }}
            className="w-8 h-8 rounded-full bg-[#4654CD] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Check className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SelectionIndicatorV4;
