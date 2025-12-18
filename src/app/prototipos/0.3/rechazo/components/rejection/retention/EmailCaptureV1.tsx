'use client';

/**
 * EmailCaptureV1 - Captura de email integrada en el flujo
 *
 * G.14 V1: Integrado en el flujo principal
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Input, Button } from '@nextui-org/react';
import { Mail, Bell, CheckCircle } from 'lucide-react';

interface EmailCaptureV1Props {
  onSubmit?: (email: string) => void;
}

export const EmailCaptureV1: React.FC<EmailCaptureV1Props> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email) {
      onSubmit?.(email);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6"
      >
        <Card className="bg-green-50 border border-green-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium text-green-800">
                  ¡Listo! Te avisaremos
                </p>
                <p className="text-sm text-green-600">
                  Recibirás un correo cuando puedas volver a intentarlo
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border border-neutral-200 bg-gradient-to-r from-[#4654CD]/5 to-transparent">
        <CardBody className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-[#4654CD]" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-neutral-800 mb-1">
                ¿Te avisamos cuando puedas volver a intentarlo?
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Te enviaremos un recordatorio y tips para mejorar tu perfil
                crediticio.
              </p>

              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onValueChange={setEmail}
                  startContent={<Mail className="w-4 h-4 text-neutral-400" />}
                  classNames={{
                    inputWrapper: 'bg-white border-neutral-200',
                  }}
                  className="flex-1"
                />
                <Button
                  className="bg-[#4654CD] text-white"
                  onPress={handleSubmit}
                  isDisabled={!email}
                >
                  Avisarme
                </Button>
              </div>

              <p className="text-xs text-neutral-400 mt-2">
                No spam. Solo te contactaremos para esto.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default EmailCaptureV1;
