'use client';

/**
 * QuizLayoutV6 - Chat conversacional (asistente virtual)
 *
 * Layout estilo chat con mensajes y respuestas.
 * Simula una conversacion con un asistente.
 */

import React from 'react';
import { Button, Avatar } from '@nextui-org/react';
import { X, Bot, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizLayoutProps } from '../../../types/quiz';

export const QuizLayoutV6: React.FC<QuizLayoutProps> = ({
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
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between bg-[#4654CD] text-white py-3 px-4">
              <div className="flex items-center gap-3">
                <Avatar
                  icon={<Bot className="w-5 h-5" />}
                  classNames={{
                    base: 'bg-white/20',
                    icon: 'text-white',
                  }}
                  size="sm"
                />
                <div>
                  <h2 className="font-semibold text-sm">
                    Asistente BaldeCash
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs opacity-80">En linea</span>
                  </div>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                className="cursor-pointer text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress */}
            <div className="h-1 bg-[#4654CD]/20">
              <div
                className="h-full bg-[#4654CD] transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
              {/* Assistant message bubble */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 mb-4"
              >
                <Avatar
                  icon={<Bot className="w-4 h-4" />}
                  classNames={{
                    base: 'bg-[#4654CD]/10 flex-shrink-0',
                    icon: 'text-[#4654CD]',
                  }}
                  size="sm"
                />
                <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-neutral-100 max-w-[85%]">
                  {children}
                </div>
              </motion.div>
            </div>

            {/* Chat Input (decorative) */}
            <div className="border-t border-neutral-200 p-3 bg-white">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-neutral-100 rounded-full px-4 py-2 text-sm text-neutral-400">
                  Selecciona una opción arriba...
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  isDisabled
                  className="bg-[#4654CD] text-white rounded-full"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-center text-xs text-neutral-400 mt-2">
                Pregunta {currentStep + 1} de {totalSteps}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuizLayoutV6;
