'use client';

/**
 * QuizLayoutV5 - Modal con pasos visuales (wizard style)
 *
 * Layout con indicador de pasos prominente estilo wizard.
 * Muestra claramente el progreso y pasos restantes.
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from '@nextui-org/react';
import { X, HelpCircle, Check } from 'lucide-react';
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
      classNames={{
        base: 'bg-white m-4 rounded-2xl',
        backdrop: 'bg-black/60',
        body: 'p-0',
      }}
    >
      <ModalContent className="bg-white overflow-hidden">
        {/* Header with wizard steps */}
        <ModalHeader className="flex flex-col bg-gradient-to-b from-[#4654CD]/5 to-white border-b border-neutral-100 py-6 px-6">
          <div className="flex items-center justify-between mb-6">
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

          {/* Wizard Steps */}
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      index < currentStep
                        ? 'bg-[#22c55e] text-white'
                        : index === currentStep
                        ? 'bg-[#4654CD] text-white ring-4 ring-[#4654CD]/20'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      index <= currentStep
                        ? 'text-neutral-700'
                        : 'text-neutral-400'
                    }`}
                  >
                    Paso {index + 1}
                  </span>
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      index < currentStep ? 'bg-[#22c55e]' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
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
