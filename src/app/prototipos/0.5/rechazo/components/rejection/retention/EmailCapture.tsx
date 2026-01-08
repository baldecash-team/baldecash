'use client';

/**
 * EmailCapture - Captura de email para notificaciones
 * Versión fija para v0.5 - Estilo V1 (Campo prominente)
 */

import React, { useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Mail, Bell, Check } from 'lucide-react';

interface EmailCaptureProps {
  onSubmit?: (email: string) => void;
}

export const EmailCapture: React.FC<EmailCaptureProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
    onSubmit?.(email);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 rounded-xl p-6 border border-green-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-800">¡Te avisaremos!</p>
            <p className="text-sm text-green-600">Recibirás un email cuando tengas nuevas oportunidades.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="bg-[#4654CD]/5 rounded-xl p-6 border border-[#4654CD]/20"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#4654CD]/10 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-800">¿Quieres que te avisemos?</h3>
          <p className="text-sm text-neutral-600">Te notificaremos cuando tengas nuevas oportunidades</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          startContent={<Mail className="w-4 h-4 text-neutral-400" />}
          classNames={{
            inputWrapper: 'bg-white border border-neutral-200 data-[focus=true]:border-[#4654CD]',
          }}
          className="flex-1"
        />
        <Button
          className="bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] transition-colors"
          isLoading={isLoading}
          onPress={handleSubmit}
          isDisabled={!email}
        >
          Avisarme
        </Button>
      </div>
    </motion.div>
  );
};

export default EmailCapture;
