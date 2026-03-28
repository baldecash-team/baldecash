'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, AlertCircle, FileUp, ShieldCheck, Send } from 'lucide-react';
import type { SubmitStage } from '../../../hooks/useSubmitApplication';

interface SubmitOverlayProps {
  isOpen: boolean;
  stage: SubmitStage;
}

const STAGE_CONFIG: Record<string, {
  icon: typeof Loader2;
  title: string;
  subtitle: string;
  spinning?: boolean;
  color: string;
}> = {
  validating: {
    icon: ShieldCheck,
    title: 'Validando tus datos',
    subtitle: 'Verificando que todo esté correcto...',
    spinning: true,
    color: 'text-[var(--color-primary)]',
  },
  uploading: {
    icon: FileUp,
    title: 'Subiendo archivos',
    subtitle: 'Enviando tus documentos de forma segura...',
    spinning: true,
    color: 'text-[var(--color-primary)]',
  },
  processing: {
    icon: Send,
    title: 'Enviando solicitud',
    subtitle: 'Ya casi terminamos...',
    spinning: true,
    color: 'text-[var(--color-primary)]',
  },
  slow: {
    icon: Loader2,
    title: 'Un momento, por favor',
    subtitle: 'Está tardando un poco más de lo esperado...',
    spinning: true,
    color: 'text-amber-500',
  },
  success: {
    icon: Check,
    title: '¡Solicitud enviada!',
    subtitle: 'Redirigiendo a tu confirmación...',
    spinning: false,
    color: 'text-green-500',
  },
  error: {
    icon: AlertCircle,
    title: 'Hubo un problema',
    subtitle: 'Por favor intenta nuevamente.',
    spinning: false,
    color: 'text-red-500',
  },
};

// Progress steps for the stepper
const STEPS = ['validating', 'uploading', 'processing', 'success'] as const;
const STEP_LABELS = {
  validating: 'Validar',
  uploading: 'Archivos',
  processing: 'Enviar',
  success: 'Listo',
};

function getStepIndex(stage: SubmitStage): number {
  if (stage === 'slow') return 2; // Same as processing
  const idx = STEPS.indexOf(stage as typeof STEPS[number]);
  return idx >= 0 ? idx : 0;
}

export const SubmitOverlay: React.FC<SubmitOverlayProps> = ({ isOpen, stage }) => {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.processing;
  const Icon = config.icon;
  const currentStep = getStepIndex(stage);

  return (
    <AnimatePresence>
      {isOpen && stage !== 'idle' && stage !== 'error' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center text-center px-6 max-w-sm"
          >
            {/* Animated icon */}
            <motion.div
              key={stage}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                stage === 'success'
                  ? 'bg-green-50'
                  : 'bg-[rgba(var(--color-primary-rgb),0.1)]'
              }`}
            >
              {config.spinning ? (
                <Loader2 className={`w-10 h-10 ${config.color} animate-spin`} />
              ) : (
                <Icon className={`w-10 h-10 ${config.color}`} />
              )}
            </motion.div>

            {/* Title */}
            <motion.h2
              key={`title-${stage}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-neutral-800 mb-2"
            >
              {config.title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              key={`sub-${stage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-neutral-500 mb-8"
            >
              {config.subtitle}
            </motion.p>

            {/* Progress stepper */}
            <div className="flex items-center gap-0 w-full max-w-xs">
              {STEPS.map((step, i) => {
                const isDone = i < currentStep;
                const isCurrent = i === currentStep;
                const isLast = i === STEPS.length - 1;

                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isDone
                            ? 'bg-green-500 text-white'
                            : isCurrent
                              ? 'bg-[var(--color-primary)] text-white'
                              : 'bg-neutral-200 text-neutral-400'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`text-[10px] ${
                        isDone || isCurrent ? 'text-neutral-700 font-medium' : 'text-neutral-400'
                      }`}>
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                    {!isLast && (
                      <div className="flex-1 h-0.5 mb-5 mx-1">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDone ? 'bg-green-500' : 'bg-neutral-200'
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubmitOverlay;
