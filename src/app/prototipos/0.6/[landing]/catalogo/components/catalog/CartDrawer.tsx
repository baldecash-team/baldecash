'use client';

/**
 * CartDrawer - Bottom sheet para mostrar el carrito en mobile
 * Diseño y animación igual que QuizLayoutV4
 */

import React, { useEffect, useRef } from 'react';
import { Button } from '@nextui-org/react';
import { ShoppingCart, Trash2, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { CatalogProduct, calculateQuotaWithInitial } from '../../types/catalog';
import { formatMoney } from '../../utils/formatMoney';

// Configuración fija igual que ProductCard
const SELECTED_TERM = 24;
const SELECTED_INITIAL = 10;

interface CartConfig {
  title?: string;
  empty_title?: string;
  empty_description?: string;
  clear_button?: string;
  close_button?: string;
  continue_button?: string;
  multiple_items_alert?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CatalogProduct[];
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
  onContinue: () => void;
  config?: CartConfig;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll,
  onContinue,
  config,
}) => {
  const dragControls = useDragControls();

  // Block body scroll when drawer is open (iOS Safari fix)
  // Note: In catalog page, scroll lock is managed centrally - this is a fallback for standalone usage
  const scrollYRef = useRef<number>(0);
  const didLockRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Only lock if not already locked by parent
      if (document.body.style.position !== 'fixed') {
        scrollYRef.current = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollYRef.current}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';
        didLockRef.current = true;
      }
    } else {
      // Only unlock if we were the one who locked
      if (didLockRef.current) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollYRef.current);
        didLockRef.current = false;
      }
    }
  }, [isOpen]);

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
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{ touchAction: 'none' }}
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] min-h-[50vh] max-h-[calc(100vh-12rem)] flex flex-col"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-[#4654CD]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    {config?.title || 'Tu Carrito'}
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
            <div
              className="flex-1 overflow-y-auto p-4 bg-neutral-50"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-neutral-300" />
                  </div>
                  <p className="text-neutral-600 font-medium">{config?.empty_title || 'Tu carrito está vacío'}</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    {config?.empty_description || 'Agrega productos para continuar'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Alert for multiple items */}
                  {items.length > 1 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-700">
                        {config?.multiple_items_alert || 'Solo puedes solicitar un producto a la vez. Por favor, selecciona solo uno.'}
                      </p>
                    </div>
                  )}
                  {items.map((item) => {
                    const { quota } = calculateQuotaWithInitial(item.price, SELECTED_TERM, SELECTED_INITIAL);
                    return (
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
                            S/{formatMoney(quota)}/mes
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-neutral-200 bg-white p-4">
                {/* Actions */}
                <div className="flex gap-2 items-center justify-center">
                  <Button
                    size="lg"
                    variant="light"
                    startContent={<Trash2 className="w-5 h-5" />}
                    onPress={onClearAll}
                    className="px-6 font-bold cursor-pointer text-neutral-500 hover:text-red-500 rounded-xl"
                  >
                    {config?.clear_button || 'Vaciar'}
                  </Button>
                  <Button
                    size="lg"
                    variant="bordered"
                    onPress={onClose}
                    className="px-6 font-bold cursor-pointer border-neutral-300 rounded-xl"
                  >
                    {config?.close_button || 'Cerrar'}
                  </Button>
                  <Button
                    size="lg"
                    className={`px-8 !font-bold cursor-pointer rounded-xl ${
                      items.length === 1
                        ? 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                    onPress={onContinue}
                    endContent={<ArrowRight className="w-5 h-5" />}
                    isDisabled={items.length !== 1}
                  >
                    {config?.continue_button || 'Continuar'}
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
