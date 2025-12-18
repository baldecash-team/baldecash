'use client';

/**
 * PersonalSettingsModal - Modal de configuracion del paso personal
 *
 * Permite seleccionar las versiones de cada componente
 * para pruebas A/B
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { Settings, RotateCcw } from 'lucide-react';
import { PersonalStepConfig, defaultPersonalStepConfig, versionDescriptions } from './types';

interface PersonalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PersonalStepConfig;
  onConfigChange: (config: PersonalStepConfig) => void;
}

interface VersionSelectorProps {
  label: string;
  value: number;
  options: number[];
  descriptions: Record<number, string>;
  onChange: (value: number) => void;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  label,
  value,
  options,
  descriptions,
  onChange,
}) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-neutral-700 mb-2 block">
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-center ${
              value === option
                ? 'bg-[#4654CD] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            V{option}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500">{descriptions[value]}</p>
    </div>
  );
};

export const PersonalSettingsModal: React.FC<PersonalSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const handleReset = () => {
    onConfigChange(defaultPersonalStepConfig);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="outside"
      backdrop="blur"
      placement="center"
      classNames={{
        base: 'bg-white my-8',
        wrapper: 'items-center justify-center py-8 min-h-full',
        backdrop: 'bg-black/50',
        header: 'border-b border-neutral-200 bg-white py-4 pr-12',
        body: 'bg-white max-h-[60vh] overflow-y-auto scrollbar-hide',
        footer: 'border-t border-neutral-200 bg-white',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-[#4654CD]" />
          </div>
          <span className="text-lg font-semibold text-neutral-800">
            Configuracion - Datos Personales
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona las versiones de cada componente para probar
            diferentes combinaciones de UX.
          </p>

          {/* Section: DNI */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#4654CD] mb-3">
              Autocompletado DNI
            </h3>

            <VersionSelector
              label="C2.1 - Animacion de carga"
              value={config.dniLoadingVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.dniLoading}
              onChange={(v) => onConfigChange({ ...config, dniLoadingVersion: v as 1 | 2 | 3 })}
            />

            <VersionSelector
              label="C2.2 - Aparicion de datos"
              value={config.dataAppearVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.dataAppear}
              onChange={(v) => onConfigChange({ ...config, dataAppearVersion: v as 1 | 2 | 3 })}
            />
          </div>

          {/* Section: Address */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <h3 className="text-sm font-semibold text-[#4654CD] mb-3">
              Direccion
            </h3>

            <VersionSelector
              label="C2.8 - Confirmacion con mapa"
              value={config.mapConfirmVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.mapConfirm}
              onChange={(v) => onConfigChange({ ...config, mapConfirmVersion: v as 1 | 2 | 3 })}
            />

            <VersionSelector
              label="C2.9 - Fallback si no encuentra"
              value={config.addressFallbackVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.addressFallback}
              onChange={(v) => onConfigChange({ ...config, addressFallbackVersion: v as 1 | 2 | 3 })}
            />
          </div>

          {/* Section: Terms */}
          <div className="pt-4 border-t border-neutral-200">
            <h3 className="text-sm font-semibold text-[#4654CD] mb-3">
              Terminos y Condiciones
            </h3>

            <VersionSelector
              label="C2.13 - Comportamiento del enlace"
              value={config.termsLinkVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.termsLink}
              onChange={(v) => onConfigChange({ ...config, termsLinkVersion: v as 1 | 2 | 3 })}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-500">
                <strong>Nota:</strong> Los campos de contacto y los selects de
                ubicacion tienen una sola version fija. Los demas
                comportamientos como validacion y formato de celular estan
                definidos segun las decisiones del spec.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="bg-white">
          <Button
            variant="light"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={handleReset}
            className="cursor-pointer"
          >
            Restablecer
          </Button>
          <Button
            className="bg-[#4654CD] text-white cursor-pointer"
            onPress={onClose}
          >
            Aplicar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PersonalSettingsModal;
