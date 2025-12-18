'use client';

/**
 * QuizLayoutV2 - Widget lateral colapsable
 *
 * Layout que muestra el quiz como un panel lateral derecho
 * que se puede colapsar. Siempre accesible mientras navegas.
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { X, HelpCircle, ChevronLeft } from 'lucide-react';
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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#4654CD] text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">¿No te decides?</h2>
                  <p className="text-sm text-white/80">
                    Pregunta {currentStep + 1} de {totalSteps}
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                variant="light"
                onPress={onClose}
                className="cursor-pointer text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-neutral-100 w-full">
              <motion.div
                className="h-full bg-[#03DBD0]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {children}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50">
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <button
                  onClick={onClose}
                  className="flex items-center gap-1 hover:text-neutral-700 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Volver al catalogo
                </button>
                <span>
                  {Math.round(((currentStep + 1) / totalSteps) * 100)}% completado
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuizLayoutV2;
