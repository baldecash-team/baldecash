'use client';

/**
 * RefurbishedAcceptanceModal — Aceptación obligatoria de la condición
 * reacondicionada antes de enviar la solicitud. El usuario DEBE marcar la
 * casilla de conformidad para poder continuar; sin ella el botón queda
 * deshabilitado.
 */

import React, { useState } from 'react';
import { Modal, ModalContent, ModalBody, Button } from '@nextui-org/react';
import { Recycle, Check } from 'lucide-react';

interface RefurbishedAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Se invoca solo si el usuario marcó la conformidad. */
  onAccept: () => void;
  productName?: string;
}

export const RefurbishedAcceptanceModal: React.FC<RefurbishedAcceptanceModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  productName,
}) => {
  const [accepted, setAccepted] = useState(false);

  // Resetea la casilla al cerrar para que el próximo open empiece sin marcar.
  const handleClose = () => {
    setAccepted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      backdrop="blur"
      placement="center"
      classNames={{
        wrapper: 'z-[100]',
        backdrop: 'bg-black/50 backdrop-blur-sm z-[99]',
        base: 'bg-white rounded-2xl shadow-2xl border border-neutral-200 mx-4',
        body: 'p-0',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalBody className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Recycle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800">Confirma tu solicitud</h2>
              <p className="text-sm text-amber-600 font-medium">Equipo reacondicionado</p>
            </div>
          </div>

          <p className="text-sm text-neutral-600 mb-4">
            Estás por solicitar {productName ? (
              <span className="font-semibold text-neutral-800">{productName}</span>
            ) : 'un equipo'}, que es un <span className="font-semibold">equipo reacondicionado</span>:
            revisado y reparado por técnicos certificados, con garantía y posibles señales
            mínimas de uso.
          </p>

          {/* Required checkbox */}
          <button
            type="button"
            onClick={() => setAccepted((v) => !v)}
            className={`w-full flex items-start gap-3 text-left rounded-xl border p-4 mb-5 transition-colors cursor-pointer ${
              accepted
                ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <span
              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border transition-colors ${
                accepted
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                  : 'bg-white border-neutral-300'
              }`}
            >
              {accepted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </span>
            <span className="text-sm text-neutral-700">
              Entiendo y acepto que el equipo es reacondicionado y estoy de acuerdo en continuar
              con mi solicitud.
            </span>
          </button>

          {/* CTAs */}
          <div className="flex gap-2">
            <Button
              size="lg"
              variant="bordered"
              className="flex-1 border-neutral-300 text-neutral-600 font-semibold cursor-pointer hover:bg-neutral-50 rounded-xl"
              onPress={handleClose}
            >
              Cancelar
            </Button>
            <Button
              size="lg"
              isDisabled={!accepted}
              className="flex-1 bg-[var(--color-primary)] text-white font-bold cursor-pointer hover:brightness-90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              onPress={() => {
                if (!accepted) return;
                onAccept();
                setAccepted(false);
              }}
            >
              Acepto y continúo
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RefurbishedAcceptanceModal;
