'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizReminderPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onOpenQuiz: () => void;
}

export const QuizReminderPopup: React.FC<QuizReminderPopupProps> = ({
  isVisible,
  onClose,
  onOpenQuiz,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-6 z-[95] max-w-xs"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-[#4654CD]/20 overflow-hidden">
            {/* Arrow pointing down-left toward help button */}
            <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-b border-r border-[#4654CD]/20 transform rotate-45" />

            <div className="p-4">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="flex items-start gap-3 pr-6">
                <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-[#4654CD]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">
                    Encuentra tu laptop ideal
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Responde 7 preguntas y te recomendamos la mejor opción en 2 minutos
                  </p>
                </div>
              </div>

              {/* Action button */}
              <Button
                size="sm"
                className="w-full mt-3 bg-[#4654CD] text-white font-medium cursor-pointer hover:bg-[#3a47b3] rounded-xl"
                startContent={<Sparkles className="w-4 h-4" />}
                onPress={() => {
                  onOpenQuiz();
                  onClose();
                }}
              >
                Iniciar asistente
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizReminderPopup;
