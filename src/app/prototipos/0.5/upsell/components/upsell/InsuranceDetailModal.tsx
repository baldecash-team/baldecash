'use client';

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from '@nextui-org/react';
import { X, Check, Plus, Shield, ShieldCheck, Sparkles, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import type { InsurancePlan } from '../../types/upsell';
import { formatMoney } from '../../../utils/formatMoney';
import { useIsMobile } from '@/app/prototipos/_shared';

interface InsuranceDetailModalProps {
  plan: InsurancePlan | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  isLocked?: boolean;
  onToggle: () => void;
}

const tierLabels: Record<string, string> = {
  basic: 'Básico',
  standard: 'Estándar',
  premium: 'Premium',
};

const ModalContentShared: React.FC<{
  plan: InsurancePlan;
  isSelected: boolean;
  isLocked: boolean;
  onToggle: () => void;
  onClose: () => void;
}> = ({ plan, isSelected, isLocked, onToggle, onClose }) => {
  const handleToggleAndClose = () => {
    onToggle();
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
        <div className="w-16 h-16 bg-[#4654CD]/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-8 h-8 text-[#4654CD]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {plan.isRecommended && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#03DBD0] px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3" /> Más popular
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-600 bg-neutral-200 px-2 py-0.5 rounded-md">
              <Shield className="w-3 h-3" /> {tierLabels[plan.tier] || plan.tier}
            </span>
          </div>
          <h3 className="text-sm font-bold text-neutral-800 line-clamp-2">
            {plan.name}
          </h3>
          {isSelected && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#22c55e] mt-1">
              <Check className="w-3 h-3" /> Seleccionado
            </span>
          )}
        </div>
      </div>

      <div className="bg-[#4654CD]/5 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-500">Cuota mensual</p>
          <p className="text-lg font-bold text-[#4654CD]">
            +S/{formatMoney(plan.monthlyPrice)}
            <span className="text-sm font-normal text-neutral-400">/mes</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Total anual</p>
          <p className="text-lg font-bold text-neutral-800">
            S/{formatMoney(plan.yearlyPrice)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Coberturas incluidas
        </p>
        <div className="space-y-2">
          {plan.coverage.map((item) => (
            <div
              key={item.name}
              className="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-100"
            >
              <div className="w-7 h-7 rounded-full bg-[#03DBD0]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-[#02C3BA]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-neutral-800">
                    {item.name}
                  </p>
                  {typeof item.maxAmount === 'number' && (
                    <span className="text-[11px] font-medium text-[#4654CD] bg-[#4654CD]/10 px-2 py-0.5 rounded-md">
                      Hasta S/{formatMoney(item.maxAmount)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {plan.exclusions && plan.exclusions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            No cubre
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {plan.exclusions.map((exclusion) => (
              <div
                key={exclusion}
                className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-neutral-700">{exclusion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
          isDisabled={isLocked}
          className={`flex-1 font-semibold rounded-xl ${
            isLocked
              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              : isSelected
              ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
              : 'bg-[#4654CD] text-white hover:bg-[#3a47b3] cursor-pointer'
          }`}
          startContent={
            isLocked ? (
              <Lock className="w-4 h-4" />
            ) : isSelected ? (
              <X className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )
          }
        >
          {isLocked ? 'Heredado' : isSelected ? 'Quitar seguro' : 'Agregar seguro'}
        </Button>
      </div>
    </div>
  );
};

const DesktopModal: React.FC<InsuranceDetailModalProps & { plan: InsurancePlan }> = ({
  plan,
  isOpen,
  onClose,
  isSelected,
  isLocked = false,
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
          <ShieldCheck className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">Detalle del seguro</h2>
          <p className="text-sm text-neutral-500">{plan.name}</p>
        </div>
      </ModalHeader>
      <ModalBody className="p-6">
        <ModalContentShared
          plan={plan}
          isSelected={isSelected}
          isLocked={isLocked}
          onToggle={onToggle}
          onClose={onClose}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

const MobileBottomSheet: React.FC<InsuranceDetailModalProps> = ({
  plan,
  isOpen,
  onClose,
  isSelected,
  isLocked = false,
  onToggle,
}) => {
  const dragControls = useDragControls();
  const shouldShow = isOpen && plan;
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
          <motion.div
            key="insurance-backdrop"
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
            key="insurance-sheet"
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] flex flex-col min-h-[50vh] max-h-[80vh]"
            style={{ overscrollBehavior: 'contain' }}
          >
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#4654CD]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    Detalle del seguro
                  </h2>
                  <p className="text-xs text-neutral-500 truncate max-w-[180px]">
                    {plan.name}
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

            <div
              className="flex-1 overflow-y-auto px-4 pb-6"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <ModalContentShared
                plan={plan}
                isSelected={isSelected}
                isLocked={isLocked}
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
 * InsuranceDetailModal - Detalle del plan de seguro (estilo AccessoryDetailModal).
 * Desktop: NextUI Modal. Mobile: bottom sheet con drag.
 */
export const InsuranceDetailModal: React.FC<InsuranceDetailModalProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileBottomSheet {...props} />;
  }

  if (!props.plan) return null;
  return <DesktopModal {...props} plan={props.plan} />;
};

export default InsuranceDetailModal;
