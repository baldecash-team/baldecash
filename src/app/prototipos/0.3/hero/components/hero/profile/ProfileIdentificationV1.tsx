'use client';

/**
 * ProfileIdentificationV1 - Modal centrado al entrar
 *
 * Caracteristicas:
 * - Modal que aparece al cargar la pagina
 * - Maxima tasa de respuesta pero mas friccion
 * - Pregunta: "Eres estudiante?"
 */

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@nextui-org/react';
import { GraduationCap, User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfileIdentificationProps } from '../../../types/hero';

export const ProfileIdentificationV1: React.FC<
  ProfileIdentificationProps & { isOpen: boolean; onClose: () => void }
> = ({ isOpen, onClose, onSelectProfile, onDismiss }) => {
  const handleSelect = (profile: 'student' | 'other') => {
    onSelectProfile?.(profile);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      placement="center"
      backdrop="blur"
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center pt-8">
          <h2 className="font-['Baloo_2'] text-2xl font-bold text-neutral-900">
            Bienvenido a BaldeCash
          </h2>
          <p className="text-sm text-neutral-500 font-normal">
            Personalizaremos tu experiencia
          </p>
        </ModalHeader>
        <ModalBody className="pb-8">
          <p className="text-center text-neutral-700 mb-6">
            Eres estudiante de educacion superior?
          </p>

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect('student')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-neutral-200 hover:border-[#4654CD] hover:bg-[#4654CD]/5 transition-colors cursor-pointer"
            >
              <div className="w-16 h-16 bg-[#4654CD]/10 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-[#4654CD]" />
              </div>
              <span className="font-semibold text-neutral-800">
                Si, soy estudiante
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect('other')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-neutral-500" />
              </div>
              <span className="font-semibold text-neutral-800">
                No, solo exploro
              </span>
            </motion.button>
          </div>

          <button
            onClick={() => {
              onDismiss?.();
              onClose();
            }}
            className="mt-4 text-sm text-neutral-400 hover:text-neutral-600 transition-colors text-center cursor-pointer"
          >
            Omitir por ahora
          </button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProfileIdentificationV1;
