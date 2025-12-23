// RemoveButtonV3 - Click Card: Click en card para deseleccionar (solo texto indicativo)
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RemoveButtonProps {
  onRemove: () => void;
  isSelected: boolean;
  className?: string;
}

export const RemoveButtonV3: React.FC<RemoveButtonProps> = ({
  isSelected,
  className = '',
}) => {
  // Este version solo muestra un indicador, el click se maneja en el card
  return (
    <AnimatePresence>
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute bottom-2 left-2 right-2 z-10 ${className}`}
        >
          <p className="text-xs text-neutral-500 text-center">
            Toca para quitar
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RemoveButtonV3;
