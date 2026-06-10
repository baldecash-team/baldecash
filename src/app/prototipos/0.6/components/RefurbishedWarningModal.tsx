'use client';

/**
 * RefurbishedWarningModal — Aviso de confirmación al dar "Lo quiero" sobre un
 * equipo reacondicionado. Informa al usuario (revisado, garantía, menor precio,
 * posibles señales de uso) y le pide confirmar antes de continuar al flujo de
 * solicitud.
 *
 * Compartido entre el card del catálogo y el detalle del producto.
 */

import React from 'react';
import { Modal, ModalContent, ModalBody, Button } from '@nextui-org/react';
import { Recycle, ShieldCheck, Tag, Sparkles } from 'lucide-react';

/** ¿El código de condición corresponde a un reacondicionado? */
export function isRefurbishedCondition(condition?: string | null): boolean {
  const c = condition?.toLowerCase().trim();
  return !!c && (c.includes('reacondicion') || c === 'refurbished');
}

interface RefurbishedWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Continuar al flujo de solicitud. */
  onConfirm: () => void;
  /** Nombre del producto (para personalizar el mensaje). */
  productName?: string;
}

const POINTS: { icon: React.ReactNode; text: string }[] = [
  { icon: <Sparkles className="w-4 h-4" />, text: 'Revisado, probado y reparado por técnicos certificados.' },
  { icon: <ShieldCheck className="w-4 h-4" />, text: 'Incluye garantía, igual que un equipo nuevo.' },
  { icon: <Tag className="w-4 h-4" />, text: 'Precio menor: ahorra sin sacrificar calidad.' },
  { icon: <Recycle className="w-4 h-4" />, text: 'Puede presentar señales mínimas de uso.' },
];

export const RefurbishedWarningModal: React.FC<RefurbishedWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
              <h2 className="text-lg font-bold text-neutral-800">Este es un equipo reacondicionado</h2>
              <p className="text-sm text-amber-600 font-medium">Confirma antes de continuar</p>
            </div>
          </div>

          {/* Intro */}
          <p className="text-sm text-neutral-600 mb-4">
            {productName ? (
              <><span className="font-semibold text-neutral-800">{productName}</span> es un equipo reacondicionado. </>
            ) : (
              <>El equipo que elegiste es reacondicionado. </>
            )}
            Esto significa:
          </p>

          {/* Points */}
          <ul className="space-y-2.5 mb-6">
            {POINTS.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  {p.icon}
                </span>
                <span className="text-sm text-neutral-700 pt-1">{p.text}</span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex gap-2">
            <Button
              size="lg"
              variant="bordered"
              className="flex-1 border-neutral-300 text-neutral-600 font-semibold cursor-pointer hover:bg-neutral-50 rounded-xl"
              onPress={onClose}
            >
              Cancelar
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-[var(--color-primary)] text-white font-bold cursor-pointer hover:brightness-90 rounded-xl"
              onPress={() => {
                onConfirm();
                onClose();
              }}
            >
              Sí, continuar
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RefurbishedWarningModal;
