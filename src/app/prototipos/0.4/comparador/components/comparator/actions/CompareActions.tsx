'use client';

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { Scale, Trash2, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompareActionsProps, ComparisonProduct } from '../../../types/comparator';

/**
 * CompareActions - Floating action bar for comparison
 * Shows selected products count and actions
 */
export const CompareActions: React.FC<CompareActionsProps> = ({
  products,
  onCompare,
  onClear,
  maxProducts,
  disabled = false,
}) => {
  const canCompare = products.length >= 2;

  if (products.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 px-4 py-3 flex items-center gap-4">
          {/* Selected count */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                {products.length} de {maxProducts}
              </p>
              <p className="text-xs text-neutral-500">
                equipos seleccionados
              </p>
            </div>
          </div>

          {/* Selected product thumbnails */}
          <div className="flex -space-x-2">
            {products.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className="w-10 h-10 rounded-lg bg-white border-2 border-white shadow-sm overflow-hidden"
                style={{ zIndex: 4 - index }}
              >
                <img
                  src={product.thumbnail}
                  alt={product.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
            <Button
              variant="light"
              size="sm"
              isIconOnly
              onPress={onClear}
              className="cursor-pointer text-neutral-500 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              isDisabled={!canCompare || disabled}
              onPress={onCompare}
              className={`${
                canCompare && !disabled
                  ? 'bg-[#4654CD] text-white cursor-pointer'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
              endContent={<ArrowRight className="w-4 h-4" />}
            >
              Comparar
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Compact floating button version (for mobile)
 */
export const CompareActionsFAB: React.FC<CompareActionsProps> = ({
  products,
  onCompare,
  onClear,
  maxProducts,
  disabled = false,
}) => {
  const canCompare = products.length >= 2;

  if (products.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-20 right-6 z-50"
    >
      <Button
        size="lg"
        isDisabled={!canCompare || disabled}
        onPress={onCompare}
        className={`rounded-full shadow-lg transition-shadow ${
          canCompare && !disabled
            ? 'bg-[#4654CD] text-white cursor-pointer hover:shadow-xl'
            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
        }`}
      >
        <Scale className="w-5 h-5 mr-2" />
        Comparar ({products.length})
      </Button>
    </motion.div>
  );
};

/**
 * Mini comparison tray showing selected products
 */
export const ComparisonTray: React.FC<{
  products: ComparisonProduct[];
  onRemove: (id: string) => void;
  onCompare: () => void;
  maxProducts: number;
}> = ({ products, onRemove, onCompare, maxProducts }) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-t border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-neutral-800">
          Comparar equipos ({products.length}/{maxProducts})
        </h4>
        <Button
          size="sm"
          isDisabled={products.length < 2}
          onPress={onCompare}
          className={`${
            products.length >= 2
              ? 'bg-[#4654CD] text-white cursor-pointer'
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
          }`}
        >
          Comparar ahora
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-24 relative bg-neutral-50 rounded-lg p-2"
          >
            <button
              onClick={() => onRemove(product.id)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neutral-200 hover:bg-red-100 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3 h-3 text-neutral-500 hover:text-red-500" />
            </button>
            <img
              src={product.thumbnail}
              alt={product.displayName}
              className="w-full h-16 object-contain mb-1"
            />
            <p className="text-xs text-neutral-600 line-clamp-1">
              {product.brand}
            </p>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: maxProducts - products.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-neutral-200 rounded-lg flex items-center justify-center"
          >
            <span className="text-xs text-neutral-400">+ Añadir</span>
          </div>
        ))}
      </div>
    </div>
  );
};
