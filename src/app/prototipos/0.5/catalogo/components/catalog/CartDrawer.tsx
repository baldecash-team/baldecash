'use client';

/**
 * CartDrawer - Bottom sheet para mostrar el carrito en mobile
 * Diseño y animación igual que QuizLayoutV4
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ShoppingCart, Trash2, X, ArrowRight, GripHorizontal } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { CatalogProduct } from '../../types/catalog';
import { formatMoney } from '../../../utils/formatMoney';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CatalogProduct[];
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
  onContinue: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll,
  onContinue,
}) => {
  const dragControls = useDragControls();
  const totalMonthly = items.reduce((sum, item) => sum + item.quotaMonthly, 0);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            key="cart-sheet"
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 min-h-[50vh] max-h-[90vh] flex flex-col"
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <GripHorizontal className="w-8 h-1.5 text-neutral-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-[#4654CD]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    Tu Carrito
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {items.length} {items.length === 1 ? 'producto' : 'productos'}
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

            {/* Body - scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 bg-neutral-50">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-neutral-300" />
                  </div>
                  <p className="text-neutral-600 font-medium">Tu carrito está vacío</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    Agrega productos para continuar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-200"
                    >
                      <div className="w-16 h-16 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0">
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
                        <p className="text-sm font-medium text-neutral-800 line-clamp-2">
                          {item.displayName}
                        </p>
                        <p className="text-sm font-bold text-[#4654CD] mt-1">
                          S/{formatMoney(item.quotaMonthly)}/mes
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-neutral-200 bg-white p-4 space-y-3">
                {/* Total */}
                <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Total mensual</span>
                  <span className="text-xl font-bold text-[#4654CD]">
                    S/{formatMoney(totalMonthly)}/mes
                  </span>
                </div>

                {/* Warning for multiple items */}
                {items.length > 1 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      Solo puedes solicitar un producto a la vez. Elimina los demás para continuar.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="light"
                    startContent={<Trash2 className="w-4 h-4" />}
                    onPress={onClearAll}
                    className="cursor-pointer text-neutral-500 hover:text-red-500"
                  >
                    Vaciar
                  </Button>
                  <Button
                    variant="bordered"
                    onPress={onClose}
                    className="cursor-pointer border-neutral-200"
                  >
                    Cerrar
                  </Button>
                  <Button
                    className={`flex-1 font-semibold cursor-pointer ${
                      items.length === 1
                        ? 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                    onPress={onContinue}
                    endContent={<ArrowRight className="w-4 h-4" />}
                    isDisabled={items.length !== 1}
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
