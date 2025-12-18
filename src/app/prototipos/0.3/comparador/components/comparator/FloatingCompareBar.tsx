'use client';

/**
 * FloatingCompareBar - Barra flotante de comparacion
 *
 * Muestra productos seleccionados en barra inferior
 * Acceso rapido al comparador desde cualquier pagina
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitCompareArrows, Trash2 } from 'lucide-react';
import { ComparisonProduct } from '../../types/comparator';

interface FloatingCompareBarProps {
  products: ComparisonProduct[];
  maxProducts: number;
  onRemoveProduct: (productId: string) => void;
  onCompare: () => void;
  onClearAll: () => void;
}

export const FloatingCompareBar: React.FC<FloatingCompareBarProps> = ({
  products,
  maxProducts,
  onRemoveProduct,
  onCompare,
  onClearAll,
}) => {
  if (products.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Product Thumbnails */}
            <div className="flex items-center gap-3 overflow-x-auto">
              <div className="flex items-center gap-2 flex-shrink-0">
                <GitCompareArrows className="w-5 h-5 text-[#4654CD]" />
                <span className="text-sm font-medium text-neutral-700 hidden sm:inline">
                  Comparar
                </span>
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: 'bg-[#4654CD]/10 px-2 py-0.5 h-auto',
                    content: 'text-[#4654CD] text-xs font-medium',
                  }}
                >
                  {products.length}/{maxProducts}
                </Chip>
              </div>

              {/* Product Cards */}
              <div className="flex items-center gap-2">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative flex-shrink-0"
                  >
                    <div className="w-14 h-14 rounded-lg border border-neutral-200 bg-neutral-50 p-1 flex items-center justify-center">
                      <img
                        src={product.thumbnail}
                        alt={product.displayName}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neutral-200 hover:bg-[#ef4444] text-neutral-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label={`Quitar ${product.displayName}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: maxProducts - products.length }).map(
                  (_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="w-14 h-14 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50/50 flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-xs text-neutral-400">+</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="light"
                isIconOnly
                onPress={onClearAll}
                className="cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-neutral-500" />
              </Button>
              <Button
                size="sm"
                className="bg-[#4654CD] text-white cursor-pointer"
                onPress={onCompare}
                isDisabled={products.length < 2}
                startContent={<GitCompareArrows className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Comparar ahora</span>
                <span className="sm:hidden">Comparar</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCompareBar;
