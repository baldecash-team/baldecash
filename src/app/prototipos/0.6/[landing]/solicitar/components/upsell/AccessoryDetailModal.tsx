'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
} from '@nextui-org/react';
import { X, Check, Plus, Package, Users } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import type { Accessory } from '../../types/upsell';
import { formatMoneyNoDecimals } from '../../utils/formatMoney';
import { useIsMobile } from '@/app/prototipos/_shared';

interface AccessoryDetailModalProps {
  accessory: Accessory | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onToggle: () => void;
  badgeText?: string | null;
}

/**
 * Parse description into bullet points.
 * Splits on newlines, \r\n, or sentence-ending periods followed by uppercase.
 * Returns up to 6 meaningful lines.
 */
function parseDescriptionBullets(description: string): string[] {
  const lines = description
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 10);
  // If we got multiple lines, use them
  if (lines.length >= 2) return lines.slice(0, 6);
  // Otherwise try splitting on sentences
  const sentences = description
    .split(/\.(?=\s+[A-Z])/)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter((s) => s.length > 10);
  return sentences.slice(0, 6);
}

// Contenido compartido entre mobile y desktop
const ModalContentShared: React.FC<{
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
  onClose: () => void;
  badgeText?: string | null;
  hideHeader?: boolean;
}> = ({ accessory, isSelected, onToggle, onClose, badgeText, hideHeader }) => {
  const handleToggleAndClose = () => {
    onToggle();
    onClose();
  };

  const bullets = parseDescriptionBullets(accessory.description);
  const hasBullets = bullets.length >= 2;
  const term = accessory.term || 24;

  return (
    <>
      {/* Header compacto con icono - estilo referencia (hidden on mobile, which has its own header) */}
      {!hideHeader && (
        <div className="bg-[var(--color-primary)] rounded-t-2xl px-5 py-4 flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">
              {accessory.name}
            </h2>
            <p className="text-xs text-white/70 truncate">
              {accessory.brand?.name || accessory.category?.name || ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Contenido */}
      <div className="p-5 space-y-4">
        {/* Imagen del producto */}
        <div className="flex justify-center py-2">
          <img
            src={accessory.thumbnailUrl || accessory.image}
            alt={accessory.name}
            className="max-h-28 max-w-full object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Descripción o bullets */}
        {hasBullets ? (
          <div className="grid grid-cols-1 gap-y-2">
            {bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--color-secondary)] flex-shrink-0 mt-0.5" />
                <span className="text-xs text-neutral-600">{bullet}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-600 leading-relaxed">
            {accessory.description}
          </p>
        )}

        {/* Specs si existen */}
        {accessory.specs && accessory.specs.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {accessory.specs.map((spec) => (
              <div key={spec.label} className="bg-neutral-50 rounded-lg p-2.5">
                <p className="text-xs text-neutral-500 mb-0.5">{spec.label}</p>
                <p className="text-sm font-semibold text-neutral-800">{spec.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Precio - estilo referencia */}
        <div className="bg-[rgba(var(--color-primary-rgb),0.06)] rounded-xl px-4 py-3 flex items-baseline justify-between">
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-[var(--color-primary)]">
              S/ {formatMoneyNoDecimals(Math.floor(accessory.monthlyQuota))}
            </span>
            <span className="text-sm text-neutral-500 ml-1 font-normal">/mes</span>
          </div>
          <span className="text-xs text-neutral-400 font-normal">
            S/ {formatMoneyNoDecimals(Math.floor(accessory.price))} · {term} cuotas
          </span>
        </div>

        {/* Botón de acción - full width */}
        <Button
          onPress={handleToggleAndClose}
          className={`w-full font-medium cursor-pointer h-11 text-base ${
            isSelected
              ? 'bg-[var(--color-secondary)] text-white hover:brightness-90'
              : 'bg-[var(--color-primary)] text-white hover:brightness-90'
          }`}
          startContent={
            isSelected ? (
              <X className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )
          }
        >
          {isSelected ? 'Quitar accesorio' : 'Agregar accesorio'}
        </Button>

        {/* Social proof */}
        {badgeText && (
          <p className="text-xs text-neutral-400 text-center flex items-center justify-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {badgeText}
          </p>
        )}
      </div>
    </>
  );
};

// Desktop Modal (NextUI)
const DesktopModal: React.FC<AccessoryDetailModalProps & { accessory: Accessory }> = ({
  accessory,
  isOpen,
  onClose,
  isSelected,
  onToggle,
  badgeText,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="md"
    scrollBehavior="inside"
    classNames={{
      wrapper: 'z-[100]',
      backdrop: 'bg-black/60 backdrop-blur-sm z-[99]',
      base: 'bg-white rounded-2xl',
      body: 'p-0',
      closeButton: 'hidden',
    }}
  >
    <ModalContent>
      <ModalBody>
        <ModalContentShared
          accessory={accessory}
          isSelected={isSelected}
          onToggle={onToggle}
          onClose={onClose}
          badgeText={badgeText}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

// Mobile Bottom Sheet (Framer Motion)
const MobileBottomSheet: React.FC<AccessoryDetailModalProps> = ({
  accessory,
  isOpen,
  onClose,
  isSelected,
  onToggle,
  badgeText,
}) => {
  const dragControls = useDragControls();
  const shouldShow = isOpen && accessory;

  // Block body scroll while open — cleanup pattern ensures unlock always runs
  // on unmount OR when isOpen flips to false (same fix as LocationModal/CartDrawer).
  // The old if/else + return cleanup was double-unlocking when two modals overlapped.
  const scrollYRef = useRef<number>(0);
  const didLockRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    if (document.body.style.position !== 'fixed') {
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      didLockRef.current = true;
    }

    return () => {
      if (!didLockRef.current) return;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollYRef.current);
      didLockRef.current = false;
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence mode="wait">
      {shouldShow && (
        <>
          {/* Backdrop */}
          <motion.div
            key="accessory-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/50 z-[10000]"
            style={{ touchAction: 'none' }}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="accessory-sheet"
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[10001] flex flex-col min-h-[50vh] max-h-[70vh]"
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
                <div className="w-9 h-9 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center">
                  <Package className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    Características
                  </h2>
                  <p className="text-xs text-neutral-500 truncate max-w-[180px]">
                    {accessory.name}
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
              className="flex-1 overflow-y-auto"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <ModalContentShared
                accessory={accessory}
                isSelected={isSelected}
                onToggle={onToggle}
                onClose={onClose}
                badgeText={badgeText}
                hideHeader
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

/**
 * AccessoryDetailModal - Modal con características técnicas del accesorio
 * Desktop: Modal centrado con NextUI
 * Mobile: Bottom sheet con Framer Motion (animación bottom-to-top)
 */
export const AccessoryDetailModal: React.FC<AccessoryDetailModalProps> = (props) => {
  const isMobile = useIsMobile();

  // Mobile: siempre montar para que AnimatePresence pueda ejecutar exit animation
  if (isMobile) {
    return <MobileBottomSheet {...props} />;
  }

  // Desktop: NextUI Modal maneja su propia animación
  if (!props.accessory) return null;
  return <DesktopModal {...props} accessory={props.accessory} />;
};

export default AccessoryDetailModal;
