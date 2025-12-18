'use client';

/**
 * NextStepsV1 - Timeline vertical
 *
 * F.8: Timeline para visualizar proximos pasos
 * F.9 V1: "Recibiras confirmacion en 24-48 horas"
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Search,
  FileSignature,
  Package,
  Check,
  Clock,
} from 'lucide-react';
import { NextStep, ApprovalConfig } from '../../../types/approval';

interface NextStepsV1Props {
  steps: NextStep[];
  timeEstimateVersion: ApprovalConfig['timeEstimateVersion'];
  notificationChannels: ('whatsapp' | 'email' | 'sms')[];
}

const getIcon = (iconName: string, className: string) => {
  const icons: Record<string, React.ReactNode> = {
    Send: <Send className={className} />,
    Search: <Search className={className} />,
    FileSignature: <FileSignature className={className} />,
    Package: <Package className={className} />,
  };
  return icons[iconName] || <Check className={className} />;
};

const getTimeEstimate = (version: ApprovalConfig['timeEstimateVersion']) => {
  switch (version) {
    case 1:
      return 'Recibiras confirmacion en 24-48 horas';
    case 2:
      return 'Te contactaremos hoy o manana';
    case 3:
      return null; // Countdown handled separately
    default:
      return 'Recibiras confirmacion pronto';
  }
};

export const NextStepsV1: React.FC<NextStepsV1Props> = ({
  steps,
  timeEstimateVersion,
  notificationChannels,
}) => {
  const timeEstimate = getTimeEstimate(timeEstimateVersion);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white border border-neutral-200 rounded-xl p-6"
    >
      <h3 className="font-semibold text-neutral-800 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-[#4654CD]" />
        Que sigue?
      </h3>

      {/* Timeline */}
      <div className="relative">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="flex gap-4 pb-6 last:pb-0"
          >
            {/* Timeline line and dot */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                  step.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : step.status === 'current'
                      ? 'bg-[#4654CD] text-white'
                      : 'bg-neutral-200 text-neutral-400'
                }`}
              >
                {step.status === 'completed' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  getIcon(step.icon, 'w-5 h-5')
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-10 w-0.5 h-full ${
                    step.status === 'completed'
                      ? 'bg-green-500'
                      : 'bg-neutral-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <h4
                className={`font-medium ${
                  step.status === 'pending'
                    ? 'text-neutral-400'
                    : 'text-neutral-800'
                }`}
              >
                {step.title}
              </h4>
              <p className="text-sm text-neutral-500 mt-0.5">
                {step.description}
              </p>
              {step.estimatedTime && step.status === 'current' && (
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                  {step.estimatedTime}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Time estimate and notification info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 pt-4 border-t border-neutral-100 space-y-2"
      >
        {timeEstimate && (
          <p className="text-sm text-neutral-600 text-center">{timeEstimate}</p>
        )}
        {timeEstimateVersion === 3 && (
          <div className="text-center">
            <span className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
              24:00:00
            </span>
            <p className="text-xs text-neutral-500">
              Tiempo estimado de respuesta
            </p>
          </div>
        )}
        <p className="text-xs text-neutral-500 text-center">
          Te avisaremos por{' '}
          {notificationChannels
            .map((c) =>
              c === 'whatsapp' ? 'WhatsApp' : c === 'email' ? 'correo' : 'SMS'
            )
            .join(' y ')}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default NextStepsV1;
