'use client';

/**
 * QuizLayoutV3 - Pagina dedicada /quiz
 *
 * Layout fullscreen para el quiz con mas espacio visual
 * y navegacion propia. Ideal para SEO y landing pages.
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowLeft, HelpCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuizLayoutProps } from '../../../types/quiz';

export const QuizLayoutV3: React.FC<QuizLayoutProps> = ({
  children,
  isOpen,
  onClose,
  currentStep,
  totalSteps,
}) => {
  if (!isOpen) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4654CD]/5 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onPress={onClose}
            className="cursor-pointer text-neutral-600 hover:text-neutral-800"
          >
            Volver
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4654CD] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#4654CD]">BaldeCash</span>
          </div>

          {/* Progress text */}
          <span className="text-sm text-neutral-500">
            {currentStep + 1}/{totalSteps}
          </span>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="h-1 bg-neutral-100">
        <motion.div
          className="h-full bg-[#4654CD]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[#4654CD]/10 text-[#4654CD] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            Quiz de ayuda
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#4654CD] mb-2">
            Encuentra tu laptop ideal
          </h1>
          <p className="text-neutral-600">
            Responde {totalSteps} preguntas simples y te recomendamos la mejor opcion
          </p>
        </motion.div>

        {/* Quiz content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 md:p-8"
        >
          {children}
        </motion.div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{
                scale: index === currentStep ? 1.2 : 1,
                backgroundColor:
                  index < currentStep
                    ? '#4654CD'
                    : index === currentStep
                    ? '#4654CD'
                    : '#e5e5e5',
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index <= currentStep ? 'bg-[#4654CD]' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 py-4 md:hidden">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">
              Pregunta {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-[#4654CD] font-medium">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QuizLayoutV3;
