'use client';

import React, { useState, useEffect } from 'react';
import { Button, Chip } from '@nextui-org/react';
import { Clock, ArrowRight, Laptop, CalendarDays, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeFinancingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

// Mock data for the pending application
const MOCK_PENDING = {
  productName: 'Lenovo IdeaPad Slim 3',
  step: 'Verificación de identidad',
  stepNumber: 3,
  totalSteps: 5,
  date: '08 feb 2026',
  monthlyQuota: 'S/189',
};

export const ResumeFinancingModal: React.FC<ResumeFinancingModalProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  const progressPercent = (MOCK_PENDING.stepNumber / MOCK_PENDING.totalSteps) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="resume-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[200]"
          />

          {/* Modal */}
          <motion.div
            key="resume-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md space-y-4 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#4654CD]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-800 leading-tight">
                      Retoma tu financiamiento
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4654CD]/40" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4654CD]" />
                      </span>
                      <span className="text-xs text-neutral-500">Solicitud pendiente</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>

              {/* Product info */}
              <div className="mx-5">
                <div className="flex items-center gap-3 bg-neutral-50 rounded-lg p-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                    <Laptop className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800 truncate">
                      {MOCK_PENDING.productName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Cuota desde {MOCK_PENDING.monthlyQuota}/mes
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Chip size="sm" className="bg-[#4654CD]/10 text-[#4654CD] text-xs font-medium">
                      Paso {MOCK_PENDING.stepNumber}/{MOCK_PENDING.totalSteps}
                    </Chip>
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <CalendarDays className="w-3 h-3" />
                      <span>{MOCK_PENDING.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mx-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">
                    Siguiente: <span className="font-medium text-neutral-700">{MOCK_PENDING.step}</span>
                  </span>
                  <span className="text-[#4654CD] font-semibold">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#4654CD] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 flex gap-3">
                <Button
                  variant="bordered"
                  className="flex-1 border-neutral-200 text-neutral-600 font-medium cursor-pointer hover:bg-neutral-50 rounded-xl"
                  onPress={onClose}
                >
                  Ahora no
                </Button>
                <Button
                  className="flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] rounded-xl"
                  endContent={<ArrowRight className="w-4 h-4" />}
                  onPress={() => {
                    onContinue?.();
                    onClose();
                  }}
                >
                  Continuar
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Hook to manage the resume financing modal auto-show
export function useResumeFinancingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('baldecash-resume-financing-dismissed');
    if (dismissed) return;

    // Show after a short delay (1.5s) to let the page load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setIsOpen(false);
    sessionStorage.setItem('baldecash-resume-financing-dismissed', 'true');
  };

  return { isOpen, close };
}

export default ResumeFinancingModal;
