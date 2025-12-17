'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from '@nextui-org/react';
import { GraduationCap } from 'lucide-react';
import type { ProfileIdentificationProps } from '../../types/hero';

/**
 * ProfileIdentificationV1 - Modal Centrado
 *
 * Se muestra automáticamente al cargar la página
 * Máxima tasa de respuesta pero más fricción
 *
 * Ideal para: Garantizar segmentación de usuarios
 */

export const ProfileIdentificationV1: React.FC<ProfileIdentificationProps> = ({
  onResponse,
}) => {
  const { isOpen, onOpenChange } = useDisclosure({ defaultOpen: true });

  const handleResponse = (isStudent: boolean) => {
    onResponse?.(isStudent);
    onOpenChange();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      placement="center"
      classNames={{
        backdrop: 'bg-black/60 backdrop-blur-sm',
        base: 'bg-white border border-neutral-200 rounded-2xl',
        header: 'border-b-0',
        body: 'py-4',
        footer: 'border-t-0 pt-0',
      }}
      isDismissable={false}
      hideCloseButton
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center pt-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#4247d2] flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2
                className="text-2xl font-bold text-neutral-800"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                ¿Eres estudiante?
              </h2>
            </ModalHeader>
            <ModalBody
              className="text-center"
              style={{ fontFamily: "'Asap', sans-serif" }}
            >
              <p className="text-neutral-600">
                Queremos mostrarte la mejor experiencia según tu perfil
              </p>
            </ModalBody>
            <ModalFooter className="flex-col gap-3 pb-8 px-8">
              <Button
                className="w-full bg-[#4247d2] text-white font-semibold"
                size="lg"
                onPress={() => handleResponse(true)}
              >
                Sí, soy estudiante
              </Button>
              <Button
                className="w-full border-2 border-neutral-300 text-neutral-600 font-medium bg-transparent hover:border-[#4247d2] hover:text-[#4247d2] transition-colors"
                variant="bordered"
                size="lg"
                onPress={() => handleResponse(false)}
              >
                No, solo estoy explorando
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ProfileIdentificationV1;
