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
            <div className="bg-[var(--surface,#fff)] rounded-xl shadow-xl border border-[var(--border-soft,#e5e7eb)] w-full max-w-md space-y-4 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-strong,#1f2937)] leading-tight">
                      Retoma tu financiamiento
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[rgba(var(--color-primary-rgb),0.4)]" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]" />
                      </span>
                      <span className="text-xs text-[var(--text-muted,#6b7280)]">Solicitud pendiente</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface-2,#f3f4f6)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-[var(--text-faint,#9ca3af)]" />
                </button>
              </div>

              {/* Product info */}
              <div className="mx-5">
                <div className="flex items-center gap-3 bg-[var(--surface-bg,#fafafa)] rounded-lg p-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface,#fff)] border border-[var(--border-soft,#e5e7eb)] flex items-center justify-center flex-shrink-0">
                    <Laptop className="w-5 h-5 text-[var(--text-muted,#6b7280)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-strong,#1f2937)] truncate">
                      {MOCK_PENDING.productName}
                    </p>
                    <p className="text-xs text-[var(--text-muted,#6b7280)]">
                      Cuota desde {MOCK_PENDING.monthlyQuota}/mes
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Chip size="sm" className="bg-[rgba(var(--color-primary-rgb),0.1)] text-[var(--color-primary)] text-xs font-medium">
                      Paso {MOCK_PENDING.stepNumber}/{MOCK_PENDING.totalSteps}
                    </Chip>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-faint,#9ca3af)]">
                      <CalendarDays className="w-3 h-3" />
                      <span>{MOCK_PENDING.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mx-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted,#6b7280)]">
                    Siguiente: <span className="font-medium text-[var(--text,#374151)]">{MOCK_PENDING.step}</span>
                  </span>
                  <span className="text-[var(--color-primary)] font-semibold">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-2 bg-[var(--surface-2,#f3f4f6)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--color-primary)] rounded-full"
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
                  className="flex-1 border-[var(--border-soft,#e5e7eb)] text-[var(--text-muted,#4b5563)] font-medium cursor-pointer hover:bg-[var(--surface-bg,#fafafa)] rounded-xl"
                  onPress={onClose}
                >
                  Ahora no
                </Button>
                <Button
                  className="flex-1 bg-[var(--color-primary)] text-white font-semibold cursor-pointer hover:brightness-90 rounded-xl"
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

  // Check if feature is enabled via env variable
  const isEnabled = process.env.NEXT_PUBLIC_SHOW_RESUME_FINANCING === 'true';

  useEffect(() => {
    // Skip if feature is disabled
    if (!isEnabled) return;

    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('baldecash-resume-financing-dismissed');
    if (dismissed) return;

    // Show after a short delay (1.5s) to let the page load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isEnabled]);

  const close = () => {
    setIsOpen(false);
    sessionStorage.setItem('baldecash-resume-financing-dismissed', 'true');
  };

  return { isOpen, close };
}

export default ResumeFinancingModal;
