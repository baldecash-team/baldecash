'use client';

/**
 * ApplicationStatus - Timeline del estado de la solicitud
 * Versión fija para v0.5
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Send, Search, Bell, Check } from 'lucide-react';
import { StatusStep, defaultStatusSteps } from '../../../types/received';

interface ApplicationStatusProps {
  steps?: StatusStep[];
  notificationChannels: ('whatsapp' | 'email' | 'sms')[];
}

const getIcon = (iconName: string, className: string) => {
  const icons: Record<string, React.ReactNode> = {
    Send: <Send className={className} />,
    Search: <Search className={className} />,
    Bell: <Bell className={className} />,
  };
  return icons[iconName] || <Check className={className} />;
};

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  steps = defaultStatusSteps,
  notificationChannels,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white border border-neutral-200 rounded-xl p-6 mb-8"
    >
      <h3 className="font-semibold text-neutral-800 mb-6">Estado de tu solicitud</h3>

      {/* Timeline horizontal */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex flex-col items-center text-center flex-1"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  step.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : step.status === 'current'
                      ? 'bg-[#4654CD] text-white animate-pulse'
                      : 'bg-neutral-200 text-neutral-400'
                }`}
              >
                {step.status === 'completed' ? (
                  <Check className="w-6 h-6" />
                ) : (
                  getIcon(step.icon, 'w-6 h-6')
                )}
              </div>
              <p
                className={`text-sm font-medium ${
                  step.status === 'pending' ? 'text-neutral-400' : 'text-neutral-800'
                }`}
              >
                {step.title}
              </p>
              <p className="text-xs text-neutral-500 hidden sm:block">{step.description}</p>
            </motion.div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-neutral-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Notification info */}
      <div className="bg-[#4654CD]/5 rounded-lg p-4 text-center">
        <p className="text-sm text-neutral-600">
          Te notificaremos por{' '}
          <span className="font-semibold text-[#4654CD]">
            {notificationChannels
              .map((c) => (c === 'whatsapp' ? 'WhatsApp' : c === 'email' ? 'correo electrónico' : 'SMS'))
              .join(' y ')}
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default ApplicationStatus;
