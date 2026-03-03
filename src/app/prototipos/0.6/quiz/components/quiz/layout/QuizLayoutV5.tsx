'use client';

/**
 * QuizLayoutV5 - Modal limpio (desktop)
 * Layout minimalista con header y contenido.
 */

import React, { useRef, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { X, HelpCircle } from 'lucide-react';
import { QuizLayoutProps } from '../../../types/quiz';

export const QuizLayoutV5: React.FC<QuizLayoutProps> = ({
  children,
  footer,
  isOpen,
  onClose,
  currentStep,
  totalSteps,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Scroll al inicio cuando cambia el paso
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      backdrop="blur"
      placement="center"
      hideCloseButton
      isDismissable={false}
      classNames={{
        base: 'bg-white m-4 rounded-2xl max-h-[90vh]',
        backdrop: 'bg-black/60 z-[99]',
        body: 'p-0 overflow-hidden',
        wrapper: 'overflow-hidden z-[100]',
      }}
    >
      <ModalContent className="bg-white overflow-hidden">
        {/* Header */}
        <ModalHeader
          className="flex flex-col border-b border-neutral-100 py-6 px-6"
          style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--color-primary) 5%, transparent), white)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-800">
                  Asistente de Compra
                </h2>
                <p className="text-sm text-neutral-500">
                  Responde algunas preguntas
                </p>
              </div>
            </div>
            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              className="cursor-pointer text-neutral-500 hover:text-neutral-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </ModalHeader>

        {/* Body - scrollable */}
        <ModalBody
          className="py-6 px-6 sm:px-8 bg-white max-h-[calc(90vh-180px)] overflow-y-auto overscroll-contain"
        >
          <div ref={bodyRef}>
            {children}
          </div>
        </ModalBody>

        {/* Footer - fixed at bottom */}
        {footer && (
          <ModalFooter className="border-t border-neutral-200 bg-white px-6 py-4">
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default QuizLayoutV5;
