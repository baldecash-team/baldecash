'use client';

import React, { useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  Chip,
} from '@nextui-org/react';
import { X, Check, Plus, Tag, Sparkles, Package } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import type { Accessory } from '../../types/upsell';
import { formatMoney } from '../../utils/formatMoney';
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
    <>
      {/* Header con imagen */}
      <div className="relative">
        {/* Imagen de fondo */}
        <div className="bg-neutral-50 p-8 flex items-center justify-center min-h-[180px] rounded-t-2xl">
          <img
            src={accessory.image}
            alt={accessory.name}
            className="max-h-32 max-w-full object-contain drop-shadow-lg"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {accessory.isRecommended && (
            <Chip
              size="sm"
              startContent={<Sparkles className="w-3 h-3 text-white" />}
              classNames={{
                base: 'bg-[#4654CD] shadow-lg',
                content: 'text-white text-xs font-semibold',
              }}
            >
              Popular
            </Chip>
          )}
          <Chip
            size="sm"
            startContent={<Tag className="w-3 h-3" />}
            classNames={{
              base: 'bg-white/90 backdrop-blur shadow-lg',
              content: 'text-neutral-700 text-xs font-medium',
            }}
          >
            {categoryLabels[accessory.category] || accessory.category}
          </Chip>
        </div>

        {/* Indicador de selección */}
        {isSelected && (
          <div className="absolute top-4 right-4 bg-[#22c55e] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <Check className="w-3 h-3" />
            Agregado
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5 space-y-4">
        {/* Título y descripción */}
        <div>
          <h2 className="text-lg font-bold text-neutral-800 mb-1">
            {accessory.name}
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed">
            {accessory.description}
          </p>
        </div>

        {/* Precio destacado */}
        <div className="bg-neutral-50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Precio total</p>
            <p className="text-xl font-bold text-neutral-800">
              S/{formatMoney(accessory.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Cuota mensual</p>
            <p className="text-xl font-bold text-[#4654CD]">
              +S/{formatMoney(accessory.monthlyQuota)}
              <span className="text-sm font-normal text-neutral-500">/mes</span>
            </p>
          </div>
        </div>

        {/* Características técnicas */}
        {accessory.specs && accessory.specs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-2 uppercase tracking-wide">
              Especificaciones
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {accessory.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="bg-neutral-50 rounded-lg p-2.5"
                >
                  <p className="text-xs text-neutral-500 mb-0.5">{spec.label}</p>
                  <p className="text-sm font-semibold text-neutral-800">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="flat"
            onPress={onClose}
            className="flex-1 bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 cursor-pointer"
          >
            Cerrar
          </Button>
          <Button
            onPress={handleToggleAndClose}
            className={`flex-1 font-medium cursor-pointer ${
              isSelected
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
            }`}
            startContent={
              isSelected ? (
                <X className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )
            }
          >
            {isSelected ? 'Quitar' : 'Agregar'}
          </Button>
        </div>
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
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="md"
    scrollBehavior="inside"
    classNames={{
      backdrop: 'bg-black/60 backdrop-blur-sm',
      base: 'bg-white rounded-2xl',
      body: 'p-0',
      closeButton: 'top-4 right-4 z-10 bg-white/80 backdrop-blur hover:bg-white cursor-pointer',
    }}
  >
    <ModalContent>
      <ModalBody>
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

  // Block body scroll when drawer is open (iOS Safari fix)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    };
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
