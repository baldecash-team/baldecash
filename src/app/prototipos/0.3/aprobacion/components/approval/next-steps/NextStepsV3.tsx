'use client';

/**
 * NextStepsV3 - Cards horizontales
 *
 * F.8: Cards para visualizar proximos pasos
 * F.9 V3: Countdown especifico
 */

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Send,
  Search,
  FileSignature,
  Package,
  Check,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { NextStep, ApprovalConfig } from '../../../types/approval';

interface NextStepsV3Props {
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

export const NextStepsV3: React.FC<NextStepsV3Props> = ({
  steps,
  timeEstimateVersion,
  notificationChannels,
}) => {
  // Countdown timer (24 hours from now)
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (timeEstimateVersion !== 3) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeEstimateVersion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="space-y-4"
    >
      <h3 className="font-semibold text-neutral-800">Proximos pasos</h3>

      {/* Horizontal scrollable cards */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        <div className="flex gap-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex-shrink-0 w-[200px] snap-start"
            >
              <Card
                className={`h-full ${
                  step.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : step.status === 'current'
                      ? 'bg-[#4654CD]/5 border-[#4654CD]/30'
                      : 'bg-neutral-50 border-neutral-200'
                } border`}
              >
                <CardBody className="p-4">
                  {/* Step number */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-medium ${
                        step.status === 'completed'
                          ? 'text-green-600'
                          : step.status === 'current'
                            ? 'text-[#4654CD]'
                            : 'text-neutral-400'
                      }`}
                    >
                      Paso {index + 1}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.status === 'completed'
                          ? 'bg-green-500'
                          : step.status === 'current'
                            ? 'bg-[#4654CD]'
                            : 'bg-neutral-200'
                      }`}
                    >
                      {step.status === 'completed' ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        getIcon(
                          step.icon,
                          `w-3.5 h-3.5 ${step.status === 'current' ? 'text-white' : 'text-neutral-400'}`
                        )
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <h4
                    className={`font-medium text-sm ${
                      step.status === 'pending'
                        ? 'text-neutral-400'
                        : 'text-neutral-800'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    {step.description}
                  </p>

                  {/* Time estimate for current step */}
                  {step.status === 'current' && step.estimatedTime && (
                    <div className="mt-3 pt-2 border-t border-neutral-200">
                      <span className="text-xs text-[#4654CD] font-medium">
                        {step.estimatedTime}
                      </span>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Countdown or time estimate */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-gradient-to-r from-[#4654CD]/10 to-purple-100 rounded-xl p-4"
      >
        {timeEstimateVersion === 3 ? (
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-2">
              Tiempo estimado de respuesta
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-white rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <p className="text-[10px] text-neutral-500">horas</p>
              </div>
              <span className="text-xl font-bold text-neutral-400">:</span>
              <div className="bg-white rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <p className="text-[10px] text-neutral-500">min</p>
              </div>
              <span className="text-xl font-bold text-neutral-400">:</span>
              <div className="bg-white rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <p className="text-[10px] text-neutral-500">seg</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-center text-neutral-700">
            {timeEstimateVersion === 1
              ? 'Recibiras confirmacion en 24-48 horas'
              : 'Te contactaremos hoy o manana'}
          </p>
        )}

        {/* Notification channels */}
        <div className="flex items-center justify-center gap-4 mt-3">
          {notificationChannels.includes('whatsapp') && (
            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span>WhatsApp</span>
            </div>
          )}
          {notificationChannels.includes('email') && (
            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Email</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NextStepsV3;
