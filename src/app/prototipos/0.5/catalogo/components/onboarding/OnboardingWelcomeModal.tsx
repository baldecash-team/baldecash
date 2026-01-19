'use client';

/**
 * OnboardingWelcomeModal - Modal inicial para nuevos usuarios
 * Pregunta si quieren un tour guiado del catálogo
 */

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Sparkles, X, ChevronRight } from 'lucide-react';

interface OnboardingWelcomeModalProps {
  isOpen: boolean;
  onStartTour: () => void;
  onDismiss: () => void;
}

export const OnboardingWelcomeModal: React.FC<OnboardingWelcomeModalProps> = ({
  isOpen,
  onStartTour,
  onDismiss,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onDismiss}
      size="md"
      backdrop="blur"
      placement="center"
      hideCloseButton
      classNames={{
        base: 'bg-white rounded-[14px] mx-4',
        backdrop: 'bg-black/60',
        body: 'py-6',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-4 pt-8 pb-2">
          {/* Animated Icon */}
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4654CD] to-[#6366f1] flex items-center justify-center shadow-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h2
            className="text-2xl font-bold text-neutral-800 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            ¿Eres nuevo en BaldeCash?
          </motion.h2>
        </ModalHeader>

        <ModalBody className="text-center px-8">
          <motion.p
            className="text-neutral-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Te mostramos un tour rápido para que descubras cómo encontrar tu laptop ideal en minutos.
          </motion.p>
        </ModalBody>

        <ModalFooter className="flex flex-col gap-3 px-8 pb-8">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              className="w-full bg-[#4654CD] text-white font-bold cursor-pointer hover:bg-[#3a47b3] transition-colors"
              style={{ borderRadius: '14px' }}
              endContent={<ChevronRight className="w-5 h-5" />}
              onPress={onStartTour}
            >
              Sí, guíame
            </Button>
          </motion.div>

          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              size="lg"
              variant="light"
              className="w-full text-neutral-500 font-medium cursor-pointer hover:text-neutral-700"
              onPress={onDismiss}
            >
              No, ya conozco la plataforma
            </Button>
          </motion.div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OnboardingWelcomeModal;
