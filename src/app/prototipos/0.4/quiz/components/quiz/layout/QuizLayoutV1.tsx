'use client';

/**
 * QuizLayoutV1 - Modal overlay centrado, full screen en mobile
 *
 * PREFERIDO (B.98): Layout que muestra el quiz en un modal a pantalla completa
 * en mobile y centrado en desktop. Integrado con catalogo.
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

export const QuizLayoutV1: React.FC<QuizLayoutProps> = ({
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
      size="full"
      scrollBehavior="inside"
      backdrop="blur"
      placement="center"
      hideCloseButton
      classNames={{
        base: 'bg-white m-0 sm:m-4 sm:max-w-2xl sm:rounded-2xl rounded-none h-full sm:h-auto sm:max-h-[90vh]',
        wrapper: 'items-center justify-center',
        backdrop: 'bg-black/60',
        body: 'bg-white p-0',
      }}
    >
      <ModalContent className="bg-white overflow-hidden h-full sm:h-auto">
        {/* Header */}
        <ModalHeader className="flex items-center justify-between bg-white border-b border-neutral-200 py-4 px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800">
                ¿No te decides?
              </h2>
              <p className="text-sm text-neutral-500">
                Te ayudamos a encontrar la laptop ideal
              </p>
            </div>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={onClose}
            className="cursor-pointer text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </ModalHeader>

        {/* Progress bar */}
        <div className="h-1 bg-neutral-100 w-full flex-shrink-0">
          <div
            className="h-full bg-[#4654CD] transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Body - scrollable */}
        <ModalBody className="py-6 sm:py-8 px-4 sm:px-10 bg-white flex-1 overflow-y-auto flex flex-col">
          {children}
        </ModalBody>

        {/* Footer with step indicator */}
        <div className="flex items-center justify-center py-4 border-t border-neutral-100 bg-neutral-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index < currentStep
                    ? 'bg-[#4654CD]'
                    : index === currentStep
                    ? 'bg-[#4654CD] w-6'
                    : 'bg-neutral-300'
                }`}
              />
            ))}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default QuizLayoutV1;
