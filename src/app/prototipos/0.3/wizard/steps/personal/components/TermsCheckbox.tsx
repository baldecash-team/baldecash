'use client';

/**
 * TermsCheckbox - Checkbox de terminos y condiciones
 *
 * 3 versiones para el enlace:
 * V1 - Modal overlay
 * V2 - Nueva pestana
 * V3 - Expandible inline
 */

import React, { useState } from 'react';
import { Checkbox, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { Check, AlertCircle, ExternalLink, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  version?: 1 | 2 | 3;
  error?: string;
}

const termsContent = `
TERMINOS Y CONDICIONES DE USO

1. ACEPTACION DE TERMINOS
Al acceder y utilizar los servicios de BaldeCash, usted acepta estar sujeto a estos Terminos y Condiciones.

2. SERVICIOS
BaldeCash ofrece financiamiento para la adquisicion de equipos tecnologicos destinados a estudiantes de educacion superior.

3. REQUISITOS
- Ser mayor de 18 años
- Ser estudiante activo de una institucion de educacion superior
- Contar con DNI vigente
- Proporcionar informacion veridica

4. PRIVACIDAD
Sus datos personales seran tratados conforme a nuestra Politica de Privacidad y la Ley de Proteccion de Datos Personales del Peru.

5. OBLIGACIONES DEL USUARIO
- Proporcionar informacion veraz
- Cumplir con los pagos en las fechas acordadas
- Notificar cambios en su situacion

6. CREDITO
El otorgamiento del credito esta sujeto a evaluacion crediticia. BaldeCash se reserva el derecho de aprobar o rechazar solicitudes.

7. CONTACTO
Para consultas: contacto@baldecash.com
`;

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  checked,
  onChange,
  version = 1,
  error,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    switch (version) {
      case 1:
        setShowModal(true);
        break;
      case 2:
        window.open('/terminos-condiciones', '_blank');
        break;
      case 3:
        setIsExpanded(!isExpanded);
        break;
    }
  };

  return (
    <div className="space-y-3">
      {/* Trust signal */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg">
        <Shield className="w-4 h-4 text-[#4654CD]" />
        <span>Conexion segura - Tus datos estan protegidos</span>
      </div>

      {/* Checkbox */}
      <label
        className={`
          flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer
          ${checked
            ? 'border-[#4654CD] bg-[#4654CD]/5'
            : error
              ? 'border-[#ef4444] bg-[#ef4444]/5'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }
        `}
      >
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`
              w-5 h-5 rounded-md border-2 transition-all duration-200
              flex items-center justify-center
              ${checked
                ? 'border-[#4654CD] bg-[#4654CD]'
                : error
                  ? 'border-[#ef4444] bg-white'
                  : 'border-neutral-300 bg-white'
              }
            `}
          >
            {checked && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm text-neutral-700">
            Acepto los{' '}
            <button
              type="button"
              onClick={handleLinkClick}
              className="text-[#4654CD] font-medium hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              Terminos y Condiciones
              {version === 2 && <ExternalLink className="w-3 h-3" />}
              {version === 3 && (
                isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {' '}y la{' '}
            <button
              type="button"
              onClick={handleLinkClick}
              className="text-[#4654CD] font-medium hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              Politica de Privacidad
              {version === 2 && <ExternalLink className="w-3 h-3" />}
            </button>
          </p>
        </div>
      </label>

      {/* Error message */}
      {error && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* V3 - Expandible inline */}
      <AnimatePresence>
        {version === 3 && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mt-2">
              <div className="max-h-48 overflow-y-auto text-sm text-neutral-600 whitespace-pre-line">
                {termsContent}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* V1 - Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="2xl"
        backdrop="blur"
        scrollBehavior="outside"
        placement="center"
        classNames={{
          base: 'bg-white my-8',
          wrapper: 'items-center justify-center py-8 min-h-full',
          backdrop: 'bg-black/50',
          body: 'bg-white max-h-[60vh] overflow-y-auto',
          closeButton: 'cursor-pointer',
        }}
      >
        <ModalContent className="bg-white">
          <ModalHeader className="border-b border-neutral-100">
            Terminos y Condiciones
          </ModalHeader>
          <ModalBody className="py-4">
            <div className="prose prose-sm max-w-none text-neutral-600 whitespace-pre-line">
              {termsContent}
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-neutral-100">
            <Button
              className="bg-[#4654CD] text-white cursor-pointer"
              onPress={() => {
                setShowModal(false);
                if (!checked) onChange(true);
              }}
            >
              Entendido y acepto
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TermsCheckbox;
