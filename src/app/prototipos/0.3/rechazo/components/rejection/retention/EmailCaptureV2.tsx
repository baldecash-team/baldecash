'use client';

/**
 * EmailCaptureV2 - Modal de captura de email antes de salir
 *
 * G.14 V2: Modal que aparece antes de salir
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from '@nextui-org/react';
import { Mail, X, Sparkles } from 'lucide-react';

interface EmailCaptureV2Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (email: string) => void;
  canRetryIn?: number;
}

export const EmailCaptureV2: React.FC<EmailCaptureV2Props> = ({
  isOpen,
  onClose,
  onSubmit,
  canRetryIn = 90,
}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (email) {
      onSubmit?.(email);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-0">
          <div className="flex items-center justify-between">
            <span>Antes de irte...</span>
          </div>
        </ModalHeader>

        <ModalBody className="pt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#4654CD]/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#4654CD]" />
            </div>

            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              ¿Quieres una segunda oportunidad?
            </h3>

            <p className="text-neutral-600 text-sm mb-6">
              En {canRetryIn} días podrás volver a solicitar tu financiamiento.
              Te avisamos cuando sea el momento ideal para que tengas más
              probabilidades de aprobación.
            </p>

            <Input
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onValueChange={setEmail}
              startContent={<Mail className="w-4 h-4 text-neutral-400" />}
              size="lg"
              classNames={{
                input: 'outline-none',
                innerWrapper: 'bg-transparent',
                inputWrapper: 'border border-neutral-200 bg-white shadow-none data-[focus-visible=true]:ring-0 data-[focus-visible=true]:ring-offset-0 data-[hover=true]:bg-white data-[focus=true]:border-[#4654CD]',
              }}
            />

            <p className="text-xs text-neutral-400 mt-3">
              Incluye tips personalizados para mejorar tu perfil crediticio
            </p>
          </motion.div>
        </ModalBody>

        <ModalFooter className="flex-col gap-2">
          <Button
            className="w-full bg-[#4654CD] text-white"
            size="lg"
            onPress={handleSubmit}
            isDisabled={!email}
          >
            Sí, avísame cuando pueda volver
          </Button>
          <Button
            variant="light"
            className="w-full text-neutral-500"
            onPress={onClose}
          >
            No, gracias
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EmailCaptureV2;
