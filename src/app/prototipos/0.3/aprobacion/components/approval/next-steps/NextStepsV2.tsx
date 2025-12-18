'use client';

/**
 * NextStepsV2 - Checklist numerado
 *
 * F.8: Checklist numerado para visualizar proximos pasos
 * F.9 V2: "Te contactaremos hoy o manana"
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Bell } from 'lucide-react';
import { NextStep, ApprovalConfig } from '../../../types/approval';

interface NextStepsV2Props {
  steps: NextStep[];
  timeEstimateVersion: ApprovalConfig['timeEstimateVersion'];
  notificationChannels: ('whatsapp' | 'email' | 'sms')[];
}

export const NextStepsV2: React.FC<NextStepsV2Props> = ({
  steps,
  timeEstimateVersion,
  notificationChannels,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-neutral-50 rounded-xl p-6"
    >
      <h3 className="font-semibold text-neutral-800 mb-4">Proximos pasos</h3>

      {/* Checklist */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              step.status === 'completed'
                ? 'bg-green-50'
                : step.status === 'current'
                  ? 'bg-white border border-[#4654CD]/20'
                  : 'bg-white/50'
            }`}
          >
            {/* Number/Check circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : step.status === 'current'
                    ? 'bg-[#4654CD] text-white'
                    : 'bg-neutral-200 text-neutral-400'
              }`}
            >
              {step.status === 'completed' ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4
                  className={`font-medium ${
                    step.status === 'pending'
                      ? 'text-neutral-400'
                      : 'text-neutral-800'
                  }`}
                >
                  {step.title}
                </h4>
                {step.status === 'current' && (
                  <span className="px-2 py-0.5 bg-[#4654CD]/10 text-[#4654CD] text-xs rounded-full">
                    En proceso
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notification info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 flex items-center gap-3 p-3 bg-amber-50 rounded-lg"
      >
        <Bell className="w-5 h-5 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            {timeEstimateVersion === 1
              ? 'Recibiras confirmacion en 24-48 horas'
              : timeEstimateVersion === 2
                ? 'Te contactaremos hoy o manana'
                : 'Pronto tendras noticias'}
          </p>
          <p className="text-xs text-amber-600">
            via{' '}
            {notificationChannels
              .map((c) =>
                c === 'whatsapp' ? 'WhatsApp' : c === 'email' ? 'Email' : 'SMS'
              )
              .join(', ')}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NextStepsV2;
