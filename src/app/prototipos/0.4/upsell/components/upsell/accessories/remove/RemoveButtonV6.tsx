// RemoveButtonV6 - X Grande Hover: X grande al hacer hover
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface RemoveButtonProps {
  onRemove: () => void;
  isSelected: boolean;
  isHovered?: boolean;
  className?: string;
}

export const RemoveButtonV6: React.FC<RemoveButtonProps> = ({
  onRemove,
  isSelected,
  isHovered = false,
  className = '',
}) => {
  if (!isSelected) return null;

  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 z-20 bg-black/50 flex items-center justify-center rounded-xl ${className}`}
        >
          <motion.button
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer shadow-lg"
          >
            <X className="w-8 h-8" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RemoveButtonV6;
