'use client';

/**
 * SearchDrawer - Bottom sheet para búsqueda en mobile
 * Diseño y animación igual que CartDrawer
 */

import React, { useRef, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { Search, X, GripHorizontal, Trash2 } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export const SearchDrawer: React.FC<SearchDrawerProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
  onClear,
}) => {
  const dragControls = useDragControls();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // URL is updated automatically via useEffect, just close
    onClose();
  };

  const handleClearAndClose = () => {
    onClear();
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            key="search-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 flex flex-col max-h-[calc(100vh-9rem)]"
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <GripHorizontal className="w-8 h-1.5 text-neutral-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <Search className="w-4 h-4 text-[#4654CD]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    Buscar equipos
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Encuentra tu equipo ideal
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSubmit} className="px-4 pb-4">
              <div className="flex items-center w-full bg-neutral-100 rounded-xl border-2 border-transparent focus-within:border-[#4654CD] focus-within:bg-white transition-colors">
                <Search className="w-5 h-5 text-neutral-400 ml-4 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Buscar por marca, modelo..."
                  className="flex-1 bg-transparent px-3 py-4 text-base text-neutral-800 placeholder-neutral-400 outline-none"
                />
                {value && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="p-2 mr-2 rounded-lg hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>

            {/* Footer with action buttons */}
            <div className="border-t border-neutral-200 bg-white p-4 flex gap-2">
              {value && (
                <Button
                  variant="light"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onPress={handleClearAndClose}
                  className="cursor-pointer text-neutral-500"
                >
                  Limpiar
                </Button>
              )}
              <Button
                className="flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer"
                onPress={onClose}
                startContent={<Search className="w-4 h-4" />}
              >
                {value ? 'Ver resultados' : 'Cerrar'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchDrawer;
