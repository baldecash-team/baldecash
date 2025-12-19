'use client';

/**
 * FilterDrawer - Drawer de filtros para movil
 *
 * Panel lateral deslizante con todos los filtros
 * Se usa en layouts mobile-first
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { X, SlidersHorizontal, Trash2 } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  appliedCount: number;
  onClearAll: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  children,
  appliedCount,
  onClearAll,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-50 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#4654CD]" />
                <h2 className="font-semibold text-lg text-neutral-800 font-['Baloo_2']">
                  Filtros
                </h2>
                {appliedCount > 0 && (
                  <span className="bg-[#4654CD] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {appliedCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200 bg-white flex gap-3">
              {appliedCount > 0 && (
                <Button
                  variant="bordered"
                  className="flex-1 border-neutral-300 cursor-pointer"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onPress={onClearAll}
                >
                  Limpiar
                </Button>
              )}
              <Button
                className="flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer"
                onPress={onClose}
              >
                Ver {appliedCount > 0 ? 'resultados' : 'productos'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;
