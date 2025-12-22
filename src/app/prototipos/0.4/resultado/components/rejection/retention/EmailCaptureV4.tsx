'use client';

import React, { useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { Mail, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailCaptureV4Props {
  onSubmit?: (email: string) => void;
}

/**
 * EmailCaptureV4 - Input Elegante
 * Con animación de confirmación estilo fintech
 */
export const EmailCaptureV4: React.FC<EmailCaptureV4Props> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    setIsSubmitted(true);
    onSubmit?.(email);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#4654CD]" />
              <p className="text-sm font-medium text-neutral-700">Mantente informado</p>
            </div>

            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={<Mail className="w-4 h-4 text-neutral-400" />}
                classNames={{
                  inputWrapper: 'bg-neutral-50 border-0 data-[focus=true]:bg-white data-[focus=true]:ring-2 data-[focus=true]:ring-[#4654CD]/20',
                }}
                className="flex-1"
              />
              <Button
                className="bg-[#4654CD] text-white font-medium cursor-pointer hover:bg-[#3a47b3]"
                isLoading={isLoading}
                onPress={handleSubmit}
                isDisabled={!email}
                size="md"
              >
                Suscribir
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-gradient-to-r from-[#4654CD]/5 to-[#03DBD0]/5"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
              >
                <Check className="w-5 h-5 text-green-600" />
              </motion.div>
              <div>
                <p className="font-medium text-neutral-800">¡Listo!</p>
                <p className="text-sm text-neutral-600">Te avisaremos con novedades</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
