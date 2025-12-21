'use client';

/**
 * QuizLayoutV3 - Pagina dedicada /quiz
 *
 * Layout de pagina completa con mas espacio para contenido.
 * Simula una pagina dedicada dentro de un modal.
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
} from '@nextui-org/react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { QuizLayoutProps } from '../../../types/quiz';

export const QuizLayoutV3: React.FC<QuizLayoutProps> = ({
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
      hideCloseButton
      classNames={{
        base: 'bg-neutral-50 m-0',
        body: 'p-0',
      }}
    >
      <ModalContent className="bg-neutral-50">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Button
              variant="light"
              startContent={<ArrowLeft className="w-4 h-4" />}
              onPress={onClose}
              className="cursor-pointer text-neutral-600"
            >
              Volver al catalogo
            </Button>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#4654CD]" />
              <span className="font-semibold text-neutral-800">
                Quiz de Ayuda
              </span>
            </div>
            <div className="w-[120px]" /> {/* Spacer for centering */}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-neutral-100">
            <div
              className="h-full bg-[#4654CD] transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <ModalBody className="py-8 px-4">
          <div className="max-w-2xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            {/* Step indicator */}
            <div className="text-center mb-6">
              <span className="text-sm text-neutral-500">
                Paso {currentStep + 1} de {totalSteps}
              </span>
            </div>

            {children}
          </div>

          {/* Bottom dots */}
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    index < currentStep
                      ? 'bg-[#4654CD]'
                      : index === currentStep
                      ? 'bg-[#4654CD] ring-4 ring-[#4654CD]/20'
                      : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuizLayoutV3;
