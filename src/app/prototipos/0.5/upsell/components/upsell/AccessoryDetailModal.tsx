'use client';

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from '@nextui-org/react';
import { X, Check, Plus, Tag, Sparkles, Package } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import type { Accessory } from '../../types/upsell';
import { formatMoney } from '../../../utils/formatMoney';
import { useIsMobile } from '@/app/prototipos/_shared';

interface AccessoryDetailModalProps {
  accessory: Accessory | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onToggle: () => void;
}

const categoryLabels: Record<string, string> = {
  protección: 'Protección',
  audio: 'Audio',
  almacenamiento: 'Almacenamiento',
  conectividad: 'Conectividad',
};

// Contenido compartido entre mobile y desktop
const ModalContentShared: React.FC<{
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
  onClose: () => void;
}> = ({ accessory, isSelected, onToggle, onClose }) => {
  const handleToggleAndClose = () => {
    onToggle();
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Product Preview */}
      <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
        <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-neutral-200">
          <img
            src={accessory.image}
            alt={accessory.name}
            className="w-full h-full object-contain p-1"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {accessory.isRecommended && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#4654CD] px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3" /> Popular
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-600 bg-neutral-200 px-2 py-0.5 rounded-md">
              <Tag className="w-3 h-3" /> {categoryLabels[accessory.category] || accessory.category}
            </span>
          </div>
          <h3 className="text-sm font-bold text-neutral-800 line-clamp-2">
            {accessory.name}
          </h3>
          {isSelected && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#22c55e] mt-1">
              <Check className="w-3 h-3" /> Agregado
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-600 leading-relaxed">
        {accessory.description}
      </p>

      {/* Pricing */}
      <div className="bg-[#4654CD]/5 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-500">Precio total</p>
          <p className="text-lg font-bold text-neutral-800">
            S/{formatMoney(accessory.price)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Cuota mensual</p>
          <p className="text-lg font-bold text-[#4654CD]">
            +S/{formatMoney(accessory.monthlyQuota)}<span className="text-sm font-normal text-neutral-400">/mes</span>
          </p>
        </div>
      </div>

      {/* Specs */}
      {accessory.specs && accessory.specs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Especificaciones
          </p>
          <div className="grid grid-cols-2 gap-2">
            {accessory.specs.map((spec) => (
              <div key={spec.label} className="bg-neutral-50 rounded-lg p-2.5 border border-neutral-100">
                <p className="text-[11px] text-neutral-500">{spec.label}</p>
                <p className="text-sm font-semibold text-neutral-800">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button
          size="lg"
          variant="bordered"
          onPress={onClose}
          className="flex-1 border-neutral-300 text-neutral-700 font-semibold cursor-pointer rounded-xl"
        >
          Cerrar
        </Button>
        <Button
          size="lg"
          onPress={handleToggleAndClose}
          className={`flex-1 font-semibold cursor-pointer rounded-xl ${
            isSelected
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
          }`}
          startContent={isSelected ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        >
          {isSelected ? 'Quitar' : 'Agregar'}
        </Button>
      </div>
    </div>
  );
};

// Desktop Modal (NextUI) - Consistent with CartSelectionModal / CartLimitModal
const DesktopModal: React.FC<AccessoryDetailModalProps & { accessory: Accessory }> = ({
  accessory,
  isOpen,
  onClose,
  isSelected,
  onToggle,
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
        <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">Características</h2>
          <p className="text-sm text-neutral-500">{accessory.name}</p>
        </div>
      </ModalHeader>
      <ModalBody className="p-6">
        <ModalContentShared
          accessory={accessory}
          isSelected={isSelected}
          onToggle={onToggle}
          onClose={onClose}
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
}) => {
  const dragControls = useDragControls();
  const shouldShow = isOpen && accessory;
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
            className="fixed inset-0 bg-black/50 z-[9998]"
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] flex flex-col min-h-[50vh] max-h-[70vh]"
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
                  <Package className="w-4 h-4 text-[#4654CD]" />
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
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
