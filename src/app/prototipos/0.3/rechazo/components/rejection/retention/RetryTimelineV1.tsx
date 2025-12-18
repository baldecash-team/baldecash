'use client';

/**
 * RetryTimelineV1 - Timeline visual con fechas
 *
 * G.15 V1: Visual con fechas específicas
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, CheckCircle } from 'lucide-react';

interface RetryTimelineV1Props {
  canRetryIn: number; // días
}

export const RetryTimelineV1: React.FC<RetryTimelineV1Props> = ({
  canRetryIn,
}) => {
  const milestones = useMemo(() => {
    const today = new Date();
    const retryDate = new Date(today.getTime() + canRetryIn * 24 * 60 * 60 * 1000);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
      });
    };

    return [
      {
        label: 'Hoy',
        date: formatDate(today),
        status: 'current' as const,
        description: 'Solicitud procesada',
      },
      {
        label: `En ${Math.round(canRetryIn / 3)} días`,
        date: formatDate(
          new Date(today.getTime() + (canRetryIn / 3) * 24 * 60 * 60 * 1000)
        ),
        status: 'upcoming' as const,
        description: 'Revisa tu historial',
      },
      {
        label: `En ${Math.round((canRetryIn * 2) / 3)} días`,
        date: formatDate(
          new Date(today.getTime() + ((canRetryIn * 2) / 3) * 24 * 60 * 60 * 1000)
        ),
        status: 'upcoming' as const,
        description: 'Prepara documentos',
      },
      {
        label: `En ${canRetryIn} días`,
        date: formatDate(retryDate),
        status: 'goal' as const,
        description: '¡Puedes volver a intentar!',
      },
    ];
  }, [canRetryIn]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="bg-neutral-50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#4654CD]" />
          <h3 className="font-semibold text-neutral-800">
            Tu camino hacia la aprobación
          </h3>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-neutral-200" />

          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative flex items-start gap-4"
              >
                {/* Dot */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    milestone.status === 'current'
                      ? 'bg-[#4654CD] text-white'
                      : milestone.status === 'goal'
                      ? 'bg-green-500 text-white'
                      : 'bg-white border-2 border-neutral-300'
                  }`}
                >
                  {milestone.status === 'current' ? (
                    <Clock className="w-4 h-4" />
                  ) : milestone.status === 'goal' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-neutral-300" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        milestone.status === 'current'
                          ? 'text-[#4654CD]'
                          : milestone.status === 'goal'
                          ? 'text-green-600'
                          : 'text-neutral-600'
                      }`}
                    >
                      {milestone.label}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {milestone.date}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RetryTimelineV1;
