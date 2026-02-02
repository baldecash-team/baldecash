'use client';

/**
 * CartBar - Barra flotante que muestra los productos en el carrito
 * Similar a la barra del comparador pero con diseño distintivo
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { ShoppingCart, Trash2, ArrowRight, X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CatalogProduct, calculateQuotaWithInitial } from '../../types/catalog';
import { formatMoney } from '../../utils/formatMoney';

// Configuración fija igual que ProductCard
const SELECTED_TERM = 24;
const SELECTED_INITIAL = 10;

interface CartBarProps {
  items: CatalogProduct[];
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
  onContinue: () => void;
}

export const CartBar: React.FC<CartBarProps> = ({
  items,
  onRemoveItem,
  onClearAll,
  onContinue,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* Desktop Bar Only - Mobile uses CartDrawer */}
      <div className="hidden lg:block fixed left-1/2 -translate-x-1/2 bottom-6 z-[91]">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden"
        >
          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-neutral-200 overflow-hidden"
              >
                <div className="p-4 max-h-[300px] overflow-y-auto">
                  <div className="space-y-3">
                    {items.map((item) => {
                      const { quota } = calculateQuotaWithInitial(item.price, SELECTED_TERM, SELECTED_INITIAL);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl"
                        >
                          <div className="w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
                            <img
                              src={item.thumbnail}
                              alt={item.displayName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-neutral-500 uppercase">
                              {item.brand}
                            </p>
                            <p className="text-sm font-medium text-neutral-800 truncate">
                              {item.displayName}
                            </p>
                            <p className="text-sm font-bold text-[#4654CD]">
                              S/{formatMoney(quota)}/mes
                            </p>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Bar */}
          <div className="px-4 py-3 flex items-center gap-4">
            {/* Cart Icon & Count */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-[#4654CD]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">
                  {items.length} {items.length === 1 ? 'producto' : 'productos'}
                </p>
                <p className="text-xs text-neutral-500">en tu carrito</p>
              </div>
            </div>

            {/* Product Thumbnails */}
            <div className="flex -space-x-2">
              {items.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  className="w-10 h-10 rounded-lg bg-white border-2 border-white shadow-sm overflow-hidden"
                  style={{ zIndex: 4 - index }}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.displayName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
              {items.length > 4 && (
                <div className="w-10 h-10 rounded-lg bg-neutral-100 border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-xs font-medium text-neutral-600">
                    +{items.length - 4}
                  </span>
                </div>
              )}
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
              <Button
                variant="light"
                size="sm"
                isIconOnly
                onPress={onClearAll}
                className="cursor-pointer text-neutral-500 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                className="px-6 bg-[#4654CD] text-white !font-bold cursor-pointer hover:bg-[#3a47b3] rounded-xl"
                onPress={onContinue}
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                Continuar
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CartBar;
