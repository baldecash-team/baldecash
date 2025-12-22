// RemoveButtonV4 - Swipe/X: Swipe mobile + X animada desktop
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

interface RemoveButtonProps {
  onRemove: () => void;
  isSelected: boolean;
  className?: string;
}

export const RemoveButtonV4: React.FC<RemoveButtonProps> = ({
  onRemove,
  isSelected,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!isSelected) return null;

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`absolute top-2 right-2 z-20 cursor-pointer ${className}`}
    >
      <motion.div
        animate={{
          width: isHovered ? 'auto' : 28,
          backgroundColor: isHovered ? '#ef4444' : 'rgba(0,0,0,0.7)',
        }}
        className="h-7 rounded-full flex items-center justify-center gap-1 px-2 text-white"
      >
        <AnimatePresence mode="wait">
          {isHovered ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span className="text-xs whitespace-nowrap">Quitar</span>
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <X className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
};

export default RemoveButtonV4;
