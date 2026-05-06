'use client';

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from '@nextui-org/react';
import { X, AlertTriangle, ShieldCheck, ShieldOff } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useIsMobile } from '@/app/prototipos/_shared';

interface InsuranceWarningModalProps {
  isOpen: boolean;
  isMandatory?: boolean;
  onClose: () => void;
  onChooseInsurance: () => void;
  onContinueWithout: () => void;
}

const SharedBody: React.FC<{
  isMandatory: boolean;
  onChooseInsurance: () => void;
  onContinueWithout: () => void;
  onClose: () => void;
}> = ({ isMandatory, onChooseInsurance, onContinueWithout, onClose }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-800">
          {isMandatory
            ? 'Para continuar necesitas un seguro'
            : 'Protege tu laptop'}
        </p>
        <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
          {isMandatory
            ? 'Tu universidad requiere que asegures el equipo. Selecciona un plan para finalizar tu solicitud.'
            : 'Robos y daños accidentales son más comunes de lo que crees. Con un seguro tu cuota mensual no se afecta y tu equipo queda cubierto.'}
        </p>
      </div>
    </div>

    <ul className="space-y-2 text-sm text-neutral-700">
      <li className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4654CD]" />
        Reposición ante robo con violencia
      </li>
      <li className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4654CD]" />
        Cobertura por daño accidental (caídas, líquidos)
      </li>
      <li className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4654CD]" />
        Soporte técnico prioritario
      </li>
    </ul>

    <div className="flex flex-col gap-3 pt-1">
      <Button
        size="lg"
        onPress={onChooseInsurance}
        className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer rounded-xl hover:bg-[#3a47b3]"
        startContent={<ShieldCheck className="w-4 h-4" />}
      >
        Sí, quiero asegurar mi laptop
      </Button>
      {!isMandatory && (
        <Button
          size="lg"
          variant="bordered"
          onPress={onContinueWithout}
          className="w-full border-neutral-300 text-neutral-700 font-semibold cursor-pointer rounded-xl"
          startContent={<ShieldOff className="w-4 h-4" />}
        >
          Sí, continuar sin seguros
        </Button>
      )}
      {isMandatory && (
        <Button
          size="lg"
          variant="light"
          onPress={onClose}
          className="w-full text-neutral-500 cursor-pointer rounded-xl"
        >
          Cerrar
        </Button>
      )}
    </div>
  </div>
);

const DesktopModal: React.FC<InsuranceWarningModalProps> = ({
  isOpen,
  isMandatory = false,
  onClose,
  onChooseInsurance,
  onContinueWithout,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={isMandatory ? () => undefined : onClose}
    size="md"
    backdrop="blur"
    placement="center"
    hideCloseButton={isMandatory}
    isDismissable={!isMandatory}
    isKeyboardDismissDisabled={isMandatory}
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
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">
            {isMandatory ? 'Seguro obligatorio' : '¿Continuar sin seguro?'}
          </h2>
          <p className="text-sm text-neutral-500">
            Tu equipo merece protección
          </p>
        </div>
      </ModalHeader>
      <ModalBody className="p-6">
        <SharedBody
          isMandatory={isMandatory}
          onChooseInsurance={onChooseInsurance}
          onContinueWithout={onContinueWithout}
          onClose={onClose}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

const MobileBottomSheet: React.FC<InsuranceWarningModalProps> = ({
  isOpen,
  isMandatory = false,
  onClose,
  onChooseInsurance,
  onContinueWithout,
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
            key="insurance-warning-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={isMandatory ? undefined : onClose}
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{ touchAction: 'none' }}
          />

          <motion.div
            key="insurance-warning-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag={isMandatory ? false : 'y'}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (!isMandatory && info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] flex flex-col min-h-[50vh] max-h-[80vh]"
            style={{ overscrollBehavior: 'contain' }}
          >
            {!isMandatory && (
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
              >
                <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
              </div>
            )}

            <div className="flex items-center justify-between px-4 pt-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    {isMandatory ? 'Seguro obligatorio' : '¿Continuar sin seguro?'}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Tu equipo merece protección
                  </p>
                </div>
              </div>
              {!isMandatory && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={onClose}
                  className="cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 pb-6"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <SharedBody
                isMandatory={isMandatory}
                onChooseInsurance={onChooseInsurance}
                onContinueWithout={onContinueWithout}
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
 * InsuranceWarningModal - Modal "¿Continuar sin seguro?" / "Seguro obligatorio".
 * Desktop: NextUI Modal. Mobile: bottom sheet con drag.
 */
export const InsuranceWarningModal: React.FC<InsuranceWarningModalProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileBottomSheet {...props} />;
  }

  return <DesktopModal {...props} />;
};

export default InsuranceWarningModal;
