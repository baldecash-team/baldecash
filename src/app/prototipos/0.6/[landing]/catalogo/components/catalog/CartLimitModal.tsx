'use client';

/**
 * CartLimitModal - Modal "Asistente de Compra" que aparece cuando se excede
 * el límite de S/600/mes al intentar agregar un producto al carrito.
 * Desktop: Modal centrado. Mobile: Bottom sheet.
 */

import React, { useEffect, useRef } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@nextui-org/react';
import { AlertTriangle, ShoppingCart, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { CatalogProduct, calculateQuotaWithInitial } from '../../types/catalog';
import { formatMoney } from '../../utils/formatMoney';
import { useIsMobile } from '@/app/prototipos/_shared';

const SELECTED_TERM = 24;
const SELECTED_INITIAL = 10;

interface CartLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CatalogProduct[];
  onRemoveItem: (productId: string) => void;
  attemptedProduct?: CatalogProduct | null;
  totalMonthlyQuota: number;
}

// Contenido compartido
const LimitModalContent: React.FC<{
  cartItems: CatalogProduct[];
  onRemoveItem: (productId: string) => void;
  onClose: () => void;
  attemptedProduct?: CatalogProduct | null;
  totalMonthlyQuota: number;
}> = ({ cartItems, onRemoveItem, onClose, attemptedProduct, totalMonthlyQuota }) => {
  const excess = totalMonthlyQuota - 600;
  const attemptedQuota = attemptedProduct
    ? calculateQuotaWithInitial(attemptedProduct.price, SELECTED_TERM, SELECTED_INITIAL).quota
    : 0;

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-red-600">
              El máximo permitido es <span className="font-bold">S/600/mes</span>.
              {attemptedProduct ? (
                <> Al agregar este producto, tu cuota total sería <span className="font-bold">S/{formatMoney(totalMonthlyQuota + attemptedQuota)}/mes</span>.</>
              ) : (
                <> Tu cuota actual es <span className="font-bold">S/{formatMoney(totalMonthlyQuota)}/mes</span> (exceso: S/{formatMoney(excess)}/mes).</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <p className="text-sm text-neutral-600 text-center font-medium">
        Quita algún producto del carrito para poder continuar.
      </p>

      {/* Current Cart Items */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Tu carrito ({cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'})
        </p>
        <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1">
          {cartItems.map((item, index) => {
            const { quota } = calculateQuotaWithInitial(item.price, SELECTED_TERM, SELECTED_INITIAL);
            return (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100"
              >
                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
                  <img
                    src={item.thumbnail}
                    alt={item.displayName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500 uppercase">{item.brand}</p>
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {item.displayName}
                  </p>
                  <p className="text-sm font-bold text-[#4654CD]">
                    S/{formatMoney(quota)}/mes
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                  title="Quitar del carrito"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attempted product (what they tried to add) */}
      {attemptedProduct && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Producto que intentas agregar
          </p>
          <div className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
            <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
              <img
                src={attemptedProduct.thumbnail}
                alt={attemptedProduct.displayName}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 uppercase">{attemptedProduct.brand}</p>
              <p className="text-sm font-medium text-neutral-800 truncate">
                {attemptedProduct.displayName}
              </p>
              <p className="text-sm font-bold text-red-600">
                +S/{formatMoney(attemptedQuota)}/mes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Total Summary */}
      <div className="bg-neutral-100 rounded-xl p-3 flex items-center justify-between">
        <span className="text-sm text-neutral-600">Cuota total actual</span>
        <span className={`text-base font-bold ${totalMonthlyQuota > 600 ? 'text-red-600' : 'text-[#4654CD]'}`}>
          S/{formatMoney(totalMonthlyQuota)}/mes
        </span>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="w-full bg-[#4654CD] text-white font-bold cursor-pointer hover:bg-[#3a47b3] rounded-xl"
        onPress={onClose}
      >
        Entendido
      </Button>
    </div>
  );
};

// Desktop Modal
const DesktopModal: React.FC<CartLimitModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  attemptedProduct,
  totalMonthlyQuota,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="md"
    backdrop="blur"
    placement="center"
    classNames={{
      wrapper: 'z-[100]',
      backdrop: 'bg-black/50 backdrop-blur-sm z-[99]',
      base: 'bg-white rounded-2xl shadow-2xl border border-neutral-200',
      header: 'border-b border-neutral-100 pb-4',
      body: 'p-0',
      closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
    }}
  >
    <ModalContent>
      <ModalHeader className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">Asistente de Compra</h2>
          <p className="text-sm text-red-500 font-medium">Límite de cuota excedido</p>
        </div>
      </ModalHeader>
      <ModalBody className="p-6">
        <LimitModalContent
          cartItems={cartItems}
          onRemoveItem={onRemoveItem}
          onClose={onClose}
          attemptedProduct={attemptedProduct}
          totalMonthlyQuota={totalMonthlyQuota}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

// Mobile Bottom Sheet
const MobileBottomSheet: React.FC<CartLimitModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  attemptedProduct,
  totalMonthlyQuota,
}) => {
  const dragControls = useDragControls();
  const scrollYRef = useRef<number>(0);
  const didLockRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
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
          <motion.div
            key="limit-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{ touchAction: 'none' }}
          />

          <motion.div
            key="limit-sheet"
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] flex flex-col max-h-[calc(100vh-6rem)]"
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
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">Asistente de Compra</h2>
                  <p className="text-xs text-red-500 font-medium">Límite de cuota excedido</p>
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

            {/* Body */}
            <div
              className="flex-1 overflow-y-auto p-4"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <LimitModalContent
                cartItems={cartItems}
                onRemoveItem={onRemoveItem}
                onClose={onClose}
                attemptedProduct={attemptedProduct}
                totalMonthlyQuota={totalMonthlyQuota}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const CartLimitModal: React.FC<CartLimitModalProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileBottomSheet {...props} />;
  }

  return <DesktopModal {...props} />;
};

export default CartLimitModal;
