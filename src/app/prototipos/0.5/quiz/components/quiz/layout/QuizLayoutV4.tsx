'use client';

/**
 * QuizLayoutV4 - Bottom sheet deslizable (mobile)
 * Sheet que aparece desde abajo, común en apps mobile.
 */

import React, { useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { QuizLayoutProps } from '../../../types/quiz';

export const QuizLayoutV4: React.FC<QuizLayoutProps> = ({
  children,
  footer,
  isOpen,
  onClose,
  currentStep,
  totalSteps,
}) => {
  const dragControls = useDragControls();

  // Block body scroll when drawer is open (iOS Safari fix)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[9998]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] min-h-[50vh] max-h-[70vh] flex flex-col"
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-[#4654CD]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    Encuentra tu laptop
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {currentStep >= totalSteps ? 'Resultados' : `Pregunta ${currentStep + 1}/${totalSteps}`}
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-neutral-100">
              <div
                className="h-full bg-[#4654CD] transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Body - scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              <div className="min-h-0">
                {children}
              </div>
            </div>

            {/* Footer - fixed at bottom */}
            {footer && (
              <div className="border-t border-neutral-200 bg-white p-4">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuizLayoutV4;
