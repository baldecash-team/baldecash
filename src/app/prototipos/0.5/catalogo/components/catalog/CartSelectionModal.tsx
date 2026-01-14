'use client';

/**
 * CartSelectionModal - Modal que aparece al hacer click en "Lo quiero"
 * Ofrece dos opciones: Solicitar equipo o Añadir al carrito
 *
 * Desktop (≥ lg): Modal centrado con NextUI
 * Mobile (< lg): Bottom sheet con Framer Motion (igual que Quiz)
 */

import React, { useEffect, useRef } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@nextui-org/react';
import { ShoppingCart, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { CatalogProduct, calculateQuotaWithInitial } from '../../types/catalog';
import { formatMoney } from '../../../utils/formatMoney';

import { useIsMobile } from '@/app/prototipos/_shared';

// Configuración fija igual que ProductCard
const SELECTED_TERM = 24;
const SELECTED_INITIAL = 10;

interface CartSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CatalogProduct | null;
  onRequestEquipment: () => void;
  onAddToCart: () => void;
}

// Contenido compartido entre mobile y desktop
const ModalContentShared: React.FC<{
  product: CatalogProduct;
  onRequestEquipment: () => void;
  onAddToCart: () => void;
  onClose: () => void;
}> = ({ product, onRequestEquipment, onAddToCart, onClose }) => {
  // Calcular cuota igual que ProductCard
  const { quota } = calculateQuotaWithInitial(product.price, SELECTED_TERM, SELECTED_INITIAL);

  return (
  <div className="space-y-4">
    {/* Product Preview */}
    <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-neutral-200">
        <img
          src={product.thumbnail}
          alt={product.displayName}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#4654CD] font-medium uppercase tracking-wide">
          {product.brand}
        </p>
        <h3 className="text-sm lg:text-base font-semibold text-neutral-800 line-clamp-2">
          {product.displayName}
        </h3>
        <p className="text-base lg:text-lg font-bold text-[#4654CD] mt-0.5">
          S/{formatMoney(quota)}/mes
        </p>
      </div>
    </div>

    {/* Options */}
    <div className="space-y-3">
      {/* Option 1: Request Equipment */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          onRequestEquipment();
          onClose();
        }}
        className="w-full p-4 bg-[#4654CD] text-white rounded-xl flex items-center gap-4 cursor-pointer hover:bg-[#3a47b3] transition-colors"
      >
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <ArrowRight className="w-6 h-6" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-base">Solicitar equipo</p>
          <p className="text-sm text-white/80">
            Iniciar proceso de solicitud ahora
          </p>
        </div>
      </motion.button>

      {/* Option 2: Add to Cart */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          onAddToCart();
          onClose();
        }}
        className="w-full p-4 bg-white border-2 border-neutral-200 text-neutral-800 rounded-xl flex items-center gap-4 cursor-pointer hover:border-[#4654CD] hover:bg-[#4654CD]/5 transition-all"
      >
        <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <ShoppingCart className="w-6 h-6 text-neutral-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-base">Añadir al carrito</p>
          <p className="text-sm text-neutral-500">
            Guardar y seguir explorando
          </p>
        </div>
      </motion.button>
    </div>
  </div>
);
};

// Desktop Modal (NextUI)
const DesktopModal: React.FC<CartSelectionModalProps & { product: CatalogProduct }> = ({
  isOpen,
  onClose,
  product,
  onRequestEquipment,
  onAddToCart,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="md"
    backdrop="blur"
    placement="center"
    classNames={{
      backdrop: 'bg-black/50 backdrop-blur-sm',
      base: 'bg-white rounded-2xl shadow-2xl border border-neutral-200',
      header: 'border-b border-neutral-100 pb-4',
      body: 'p-0',
      closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
    }}
  >
    <ModalContent>
      <ModalHeader className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">¿Qué deseas hacer?</h2>
          <p className="text-sm text-neutral-500">Elige una opción</p>
        </div>
      </ModalHeader>
      <ModalBody className="p-6">
        <ModalContentShared
          product={product}
          onRequestEquipment={onRequestEquipment}
          onAddToCart={onAddToCart}
          onClose={onClose}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

// Mobile Bottom Sheet (Framer Motion)
const MobileBottomSheet: React.FC<CartSelectionModalProps & { product: CatalogProduct }> = ({
  isOpen,
  onClose,
  product,
  onRequestEquipment,
  onAddToCart,
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
            key="selection-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/50 z-40"
            style={{ touchAction: 'none' }}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="selection-sheet"
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 flex flex-col min-h-[50vh] max-h-[calc(100vh-12rem)]"
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
                    ¿Qué deseas hacer?
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Elige una opción
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
              className="flex-1 overflow-y-auto p-4"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <ModalContentShared
                product={product}
                onRequestEquipment={onRequestEquipment}
                onAddToCart={onAddToCart}
                onClose={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const CartSelectionModal: React.FC<CartSelectionModalProps> = (props) => {
  const isMobile = useIsMobile();

  if (!props.product) return null;

  // Render mobile bottom sheet or desktop modal based on screen size
  if (isMobile) {
    return <MobileBottomSheet {...props} product={props.product} />;
  }

  return <DesktopModal {...props} product={props.product} />;
};

export default CartSelectionModal;
