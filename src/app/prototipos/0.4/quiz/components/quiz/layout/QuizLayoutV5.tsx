'use client';

/**
 * QuizLayoutV5 - Modal limpio sin barra de progreso
 *
 * Layout minimalista que solo muestra el header con título
 * y el contenido, sin indicador de pasos.
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from '@nextui-org/react';
import { X, HelpCircle } from 'lucide-react';
import { QuizLayoutProps } from '../../../types/quiz';

export const QuizLayoutV5: React.FC<QuizLayoutProps> = ({
  children,
  isOpen,
  onClose,
  currentStep,
  totalSteps,
}) => {
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
        base: 'bg-white m-4 rounded-2xl',
        backdrop: 'bg-black/60',
        body: 'p-0',
      }}
    >
      <ModalContent className="bg-white overflow-hidden">
        {/* Header with wizard steps */}
        <ModalHeader className="flex flex-col bg-gradient-to-b from-[#4654CD]/5 to-white border-b border-neutral-100 py-6 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4654CD] flex items-center justify-center">
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

        {/* Body */}
        <ModalBody className="py-8 px-6 sm:px-10 bg-white min-h-[300px] flex flex-col">
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuizLayoutV5;
