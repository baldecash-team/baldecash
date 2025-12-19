'use client';

/**
 * ComparatorLayoutV3 - Panel Lateral Sticky
 *
 * Comparador como panel lateral que no oculta el contenido
 * Permite seguir navegando mientras se compara
 * Ideal para: comparacion continua, power users
 */

import React from 'react';
import { Button, Switch, Chip } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  GitCompareArrows,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ComparatorLayoutProps } from '../../../types/comparator';

interface ComparatorLayoutV3Props extends ComparatorLayoutProps {
  showOnlyDifferences: boolean;
  onToggleDifferences: (value: boolean) => void;
  highlightWinners: boolean;
  onToggleHighlight: (value: boolean) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const ComparatorLayoutV3: React.FC<ComparatorLayoutV3Props> = ({
  config,
  products,
  onRemoveProduct,
  onClearAll,
  isOpen = true,
  onClose,
  children,
  showOnlyDifferences,
  onToggleDifferences,
  highlightWinners,
  onToggleHighlight,
  isExpanded = false,
  onToggleExpand,
}) => {
  const panelWidth = isExpanded ? 'w-[600px]' : 'w-[400px]';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 h-full ${panelWidth} max-w-full bg-white shadow-xl z-50 flex flex-col border-l border-neutral-200`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <GitCompareArrows className="w-4 h-4 text-[#4654CD]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-neutral-800">
                    Comparador
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {products.length}/{config.maxProducts} productos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onToggleExpand && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={onToggleExpand}
                    className="hidden md:flex cursor-pointer"
                  >
                    {isExpanded ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
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
            </div>

            {/* Controls */}
            <div className="p-3 border-b border-neutral-100 bg-neutral-50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    size="sm"
                    isSelected={showOnlyDifferences}
                    onValueChange={onToggleDifferences}
                    classNames={{
                      wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                      thumb: 'bg-white shadow-md',
                    }}
                  />
                  <span className="text-xs text-neutral-600">
                    Solo diferencias
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    size="sm"
                    isSelected={highlightWinners}
                    onValueChange={onToggleHighlight}
                    classNames={{
                      wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                      thumb: 'bg-white shadow-md',
                    }}
                  />
                  <span className="text-xs text-neutral-600">
                    Resaltar
                  </span>
                </label>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {products.length > 0 ? (
                children
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <GitCompareArrows className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-2">
                    Comparador vacio
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Selecciona productos desde el catalogo para compararlos
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {products.length > 0 && (
              <div className="p-3 border-t border-neutral-200 bg-white">
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  startContent={<Trash2 className="w-3 h-3" />}
                  onPress={onClearAll}
                  className="w-full cursor-pointer"
                >
                  Limpiar comparador
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ComparatorLayoutV3;
