'use client';

import React, { useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { Mail, Bell, ArrowRight, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailCaptureV6Props {
  onSubmit?: (email: string) => void;
}

/**
 * EmailCaptureV6 - CTA Grande
 * Suscripción a oportunidades como elemento hero
 */
export const EmailCaptureV6: React.FC<EmailCaptureV6Props> = ({ onSubmit }) => {
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
        className="bg-gradient-to-r from-[#4654CD] to-[#3a47b3] rounded-2xl p-8 text-center text-white"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-2">¡Estás en la lista!</h3>
        <p className="text-white/80">Te avisaremos cuando tengas nuevas oportunidades de financiamiento.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#4654CD] to-[#3a47b3] rounded-2xl p-8 text-white">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No te pierdas tu oportunidad</h3>
        <p className="text-white/70">
          Déjanos tu email y te avisaremos cuando puedas volver a aplicar
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <Input
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="lg"
          startContent={<Mail className="w-5 h-5 text-neutral-400" />}
          classNames={{
            inputWrapper: 'bg-white/10 border-0 backdrop-blur data-[focus=true]:bg-white/20',
            input: 'text-white placeholder:text-white/50',
          }}
        />

        <Button
          size="lg"
          className="w-full bg-white text-[#4654CD] font-bold cursor-pointer hover:bg-neutral-100 transition-colors"
          endContent={<ArrowRight className="w-5 h-5" />}
          isLoading={isLoading}
          onPress={handleSubmit}
          isDisabled={!email}
        >
          Quiero que me avisen
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-6 text-white/50 text-sm">
        <Sparkles className="w-4 h-4" />
        <span>Más de 10,000 estudiantes ya están suscritos</span>
      </div>
    </div>
  );
};
