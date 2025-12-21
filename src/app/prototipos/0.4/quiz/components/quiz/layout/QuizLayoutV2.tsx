'use client';

/**
 * QuizLayoutV2 - Widget lateral colapsable
 *
 * Panel lateral siempre accesible que se desliza desde la derecha.
 * Permite navegar mientras el quiz esta abierto.
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizLayoutProps } from '../../../types/quiz';

export const QuizLayoutV2: React.FC<QuizLayoutProps> = ({
  children,
  isOpen,
  onClose,
  currentStep,
  totalSteps,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-white border-b border-neutral-200 py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-[#4654CD]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-800">
                    Asistente de compra
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {currentStep + 1} de {totalSteps}
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

            {/* Progress bar */}
            <div className="h-1 bg-neutral-100 w-full">
              <div
                className="h-full bg-[#4654CD] transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center py-3 border-t border-neutral-100 bg-neutral-50">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      index < currentStep
                        ? 'bg-[#4654CD]'
                        : index === currentStep
                        ? 'bg-[#4654CD] w-4'
                        : 'bg-neutral-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuizLayoutV2;
