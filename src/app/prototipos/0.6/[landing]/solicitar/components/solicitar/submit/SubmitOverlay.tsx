'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Send, FileUp, ShieldCheck, FileSignature } from 'lucide-react';
import type { SubmitStage } from '../../../hooks/useSubmitApplication';

export interface PasoOverlay {
  /** Tiene que coincidir con el `stage` que lo pone en curso. */
  id: SubmitStage;
  icon: keyof typeof ICON_MAP;
  title: string;
  description: string;
}

interface SubmitOverlayProps {
  isOpen: boolean;
  stage: SubmitStage;
  /**
   * Los pasos del progreso. Por defecto, los del envío de la solicitud.
   *
   * Existe porque la firma del contrato usa este mismo overlay y no sube
   * archivos ni envía una solicitud: decirle a alguien "Subiendo archivos"
   * mientras se registra su firma es describirle mal lo que está pasando.
   */
  pasos?: readonly PasoOverlay[];
  titulo?: string;
  subtitulo?: string;
  tituloProgreso?: string;
}

// Steps matching the confirmation page style
const STEPS: readonly PasoOverlay[] = [
  { id: 'validating', icon: 'ShieldCheck', title: 'Validando datos', description: 'Verificando tu información' },
  { id: 'uploading', icon: 'FileUp', title: 'Subiendo archivos', description: 'Enviando documentos' },
  { id: 'processing', icon: 'Send', title: 'Enviando solicitud', description: 'Procesando tu solicitud' },
] as const;

const ICON_MAP = {
  ShieldCheck: <ShieldCheck className="w-6 h-6" />,
  FileUp: <FileUp className="w-6 h-6" />,
  Send: <Send className="w-6 h-6" />,
  FileSignature: <FileSignature className="w-6 h-6" />,
};

function getStepStatus(
  stepId: SubmitStage,
  currentStage: SubmitStage,
  pasos: readonly PasoOverlay[],
): 'completed' | 'current' | 'pending' {
  const order = pasos.map((p) => p.id);
  const ultimo = order[order.length - 1];
  const currentIdx = order.indexOf(currentStage === 'slow' ? ultimo : currentStage);
  const stepIdx = order.indexOf(stepId);

  if (currentStage === 'success') return 'completed';
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'current';
  return 'pending';
}

export const SubmitOverlay: React.FC<SubmitOverlayProps> = ({
  isOpen, stage, pasos = STEPS, titulo, subtitulo, tituloProgreso = 'Progreso del envío',
}) => {
  const isActive = isOpen && stage !== 'idle' && stage !== 'error';

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center px-6 w-full max-w-md"
          >
            {/* Animated spinner / success icon */}
            <motion.div
              key={stage === 'success' ? 'success' : 'loading'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                stage === 'success'
                  ? 'bg-green-500'
                  : 'bg-[var(--color-primary)]'
              }`}
            >
              {stage === 'success' ? (
                <Check className="w-10 h-10 text-white" />
              ) : (
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              )}
            </motion.div>

            {/* Title - same style as confirmation page */}
            <motion.h1
              key={`title-${stage}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2 text-center"
            >
              {stage === 'success'
                ? '¡Solicitud enviada!'
                : stage === 'slow'
                  ? 'Un momento, por favor'
                  : (titulo ?? 'Enviando tu solicitud')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              key={`sub-${stage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-neutral-600 mb-8 text-center"
            >
              {stage === 'success'
                ? 'Redirigiendo a tu confirmación...'
                : stage === 'slow'
                  ? 'Está tardando un poco más de lo esperado...'
                  : (subtitulo ?? 'Esto solo tomará unos segundos.')}
            </motion.p>

            {/* Timeline - matching ApplicationStatus style */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 w-full">
              <h3 className="font-semibold text-neutral-800 mb-6">{tituloProgreso}</h3>

              <div className="flex items-center justify-between">
                {pasos.map((step, index) => {
                  const status = getStepStatus(step.id, stage, pasos);

                  return (
                    <React.Fragment key={step.id}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="flex flex-col items-center text-center flex-1"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                            status === 'completed'
                              ? 'bg-green-500 text-white'
                              : status === 'current'
                                ? 'bg-[var(--color-primary)] text-white animate-pulse'
                                : 'bg-neutral-200 text-neutral-400'
                          }`}
                        >
                          {status === 'completed' ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            ICON_MAP[step.icon]
                          )}
                        </div>
                        <p
                          className={`text-sm font-medium ${
                            status === 'pending' ? 'text-neutral-400' : 'text-neutral-800'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-neutral-500 hidden sm:block">
                          {step.description}
                        </p>
                      </motion.div>

                      {/* Connector line */}
                      {index < pasos.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-2 mb-6 transition-all duration-500 ${
                            status === 'completed' ? 'bg-green-500' : 'bg-neutral-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Slow mode note */}
            {stage === 'slow' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 bg-[var(--color-primary)]/5 rounded-lg p-4 text-center w-full"
              >
                <p className="text-sm text-neutral-600">
                  No cierres esta ventana, estamos procesando tu solicitud.
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubmitOverlay;
