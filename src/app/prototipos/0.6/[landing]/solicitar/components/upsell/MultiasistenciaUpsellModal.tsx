'use client';

import React from 'react';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { Video, Laptop, Users } from 'lucide-react';
import { formatMoneyNoDecimals } from '../../utils/formatMoney';

interface MultiasistenciaUpsellModalProps {
  isOpen: boolean;
  monthlyPrice: number;
  onAccept: () => void;
  onDecline: () => void;
}

const BENEFITS = [
  { icon: Video, label: 'Telemedicina' },
  { icon: Laptop, label: 'Soporte técnico ilimitado' },
  { icon: Users, label: 'Hasta 3 familiares' },
];

export const MultiasistenciaUpsellModal: React.FC<MultiasistenciaUpsellModalProps> = ({
  isOpen, monthlyPrice, onAccept, onDecline,
}) => {
  const price = Math.floor(monthlyPrice ?? 0);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onDecline}
      placement="center"
      hideCloseButton
      // Backdrop explícito: NextUI por defecto usa `bg-overlay/50`, cuyo token
      // `overlay` no está definido en esta app → se renderizaba transparente
      // ("sin fondo"). Se replica el patrón de InsuranceDetailModal.
      classNames={{
        wrapper: 'z-[100]',
        backdrop: 'bg-black/60 backdrop-blur-sm z-[99]',
        base: 'rounded-2xl overflow-hidden bg-white',
        body: 'p-0',
      }}
    >
      <ModalContent>
        <ModalBody className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-[#4b3fd1] to-[#7c3aed] text-white px-6 pt-6 pb-5 text-center">
            <span className="inline-block bg-[#ffce3a] text-[#5a4200] text-[10px] font-extrabold uppercase tracking-wide rounded-full px-3 py-1 mb-2">
              ⭐ Lo más elegido por las familias
            </span>
            <h3 className="text-xl font-bold text-white mb-1">Protégete hoy, no cuando ya sea tarde</h3>
            <p className="text-sm text-white/90">
              Una emergencia no avisa. Por muy poco al mes, tú y tu familia tienen médico, soporte técnico y respaldo legal cuando lo necesiten — no esperes a necesitarlo para tenerlo.
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="flex justify-center gap-3 mb-4 flex-wrap">
              {BENEFITS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex-1 min-w-[100px] bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-center">
                  <Icon className="w-5 h-5 mx-auto text-[var(--color-primary)]" />
                  <div className="text-xs text-neutral-600 font-medium mt-1">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-neutral-500 mb-4">
              Por solo <b className="text-2xl text-[var(--color-primary)]">S/{formatMoneyNoDecimals(price)}</b> /mes en tu cuota
            </p>
            <button onClick={onAccept}
              className="w-full py-3.5 rounded-xl font-extrabold text-base bg-[var(--color-secondary)] text-white cursor-pointer hover:brightness-95">
              Sí, lo quiero ✓
            </button>
            <button onClick={onDecline}
              className="w-full mt-2.5 text-xs text-neutral-500 underline cursor-pointer">
              No, prefiero arriesgarme y continuar sin protección
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MultiasistenciaUpsellModal;
