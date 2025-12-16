"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import type { ProfileIdentificationProps } from "./types";
import { GraduationCapIcon } from "./Icons";

/**
 * ProfileIdentification - Versión A (Modal/Overlay)
 *
 * Características:
 * - Pregunta presentada como modal centrado
 * - Se muestra automáticamente al cargar la página
 * - Interrumpe el flujo para asegurar respuesta
 * - Ideal para: maximizar tasa de respuesta
 * - Trade-off: puede sentirse intrusivo
 */

export const ProfileIdentificationV1 = ({ onResponse }: ProfileIdentificationProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure({ defaultOpen: true });

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
        backdrop: "bg-[#000000]/80 backdrop-blur-md",
        base: "bg-[#1a1a1a] border border-[#333333] rounded-2xl",
        header: "border-b-0",
        body: "bg-[#1a1a1a]",
        footer: "bg-[#1a1a1a] border-t-0",
        wrapper: "items-center justify-center",
      }}
      isDismissable={false}
      hideCloseButton={true}
    >
      <ModalContent className="rounded-2xl overflow-hidden">
        {(onClose) => (
          <>
            <ModalHeader
              className="flex flex-col gap-1 text-center pt-6"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-[#4247d2] p-0.5">
                  <div className="w-full h-full bg-[#1a1a1a] rounded-full flex items-center justify-center">
                    <GraduationCapIcon size={28} className="text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl text-white">¿Eres estudiante?</h2>
            </ModalHeader>
            <ModalBody className="text-center pb-2" style={{ fontFamily: "'Asap', sans-serif" }}>
              <p className="text-gray-300">
                Queremos mostrarte la mejor experiencia según tu perfil
              </p>
            </ModalBody>
            <ModalFooter className="flex-col gap-3 pb-6">
              <Button
                className="w-full bg-[#4247d2] text-white font-semibold hover:bg-[#4247d2]/90 transition-colors"
                size="lg"
                onPress={() => handleResponse(true)}
              >
                Sí, soy estudiante
              </Button>
              <Button
                className="w-full border-2 border-[#444444] text-gray-300 font-medium hover:border-[#4247d2] hover:text-white bg-transparent transition-colors"
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
