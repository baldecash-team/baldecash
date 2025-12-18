'use client';

/**
 * UpsellSettingsModal - Modal de configuracion de upsell
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
import { UpsellConfig, defaultUpsellConfig } from '../../types/upsell';

interface UpsellSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UpsellConfig;
  onConfigChange: (config: UpsellConfig) => void;
}

const versionDescriptions = {
  accessoryCard: {
    1: 'Cards uniformes en grid',
    2: 'Tamaño variable por popularidad',
    3: 'Carrusel horizontal deslizable',
  },
  insurancePlan: {
    1: 'Cards lado a lado',
    2: 'Tabla comparativa',
    3: 'Slider interactivo',
  },
  accessoriesIntro: {
    subtle: '"Complementa tu laptop"',
    direct: '"Accesorios recomendados"',
    social_proof: '"Los estudiantes también..."',
  },
  breakdownDisplay: {
    always_visible: 'Siempre visible en pantalla',
    tooltip: 'Tooltip al hacer hover',
    expandable: 'Botón "Ver desglose"',
  },
  insuranceFraming: {
    protection: 'Protección funcional',
    peace_of_mind: 'Tranquilidad emocional',
    direct: '"Seguro contra..."',
  },
  skipModalTone: {
    persuasive: 'Tono persuasivo',
    neutral: 'Tono neutral',
    last_offer: 'Última oferta especial',
  },
};

interface VersionSelectorProps {
  label: string;
  value: number | string;
  options: (number | string)[];
  descriptions: Record<number | string, string>;
  onChange: (value: number | string) => void;
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
            key={String(option)}
            onClick={() => onChange(option)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-center ${
              value === option
                ? 'bg-[#4654CD] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {typeof option === 'number' ? `V${option}` : option.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500">{descriptions[value]}</p>
    </div>
  );
};

export const UpsellSettingsModal: React.FC<UpsellSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const handleReset = () => {
    onConfigChange(defaultUpsellConfig);
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
          <span className="text-lg font-semibold text-neutral-800">Configuración de Upsell</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona las versiones de cada componente para crear diferentes
            combinaciones y probar cuál funciona mejor.
          </p>

          {/* Accessory Cards */}
          <VersionSelector
            label="D.2 - Cards de Accesorios"
            value={config.accessoryCardVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.accessoryCard}
            onChange={(v) => onConfigChange({ ...config, accessoryCardVersion: v as 1 | 2 | 3 })}
          />

          {/* Insurance Plans */}
          <VersionSelector
            label="E.3 - Planes de Seguro"
            value={config.insurancePlanVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.insurancePlan}
            onChange={(v) => onConfigChange({ ...config, insurancePlanVersion: v as 1 | 2 | 3 })}
          />

          {/* Accessories Intro */}
          <VersionSelector
            label="D.1 - Introducción Accesorios"
            value={config.accessoriesIntro}
            options={['subtle', 'direct', 'social_proof']}
            descriptions={versionDescriptions.accessoriesIntro}
            onChange={(v) => onConfigChange({ ...config, accessoriesIntro: v as 'subtle' | 'direct' | 'social_proof' })}
          />

          {/* Breakdown Display */}
          <VersionSelector
            label="D.8 - Desglose de Precio"
            value={config.breakdownDisplay}
            options={['always_visible', 'tooltip', 'expandable']}
            descriptions={versionDescriptions.breakdownDisplay}
            onChange={(v) => onConfigChange({ ...config, breakdownDisplay: v as 'always_visible' | 'tooltip' | 'expandable' })}
          />

          {/* Insurance Framing */}
          <VersionSelector
            label="E.1 - Framing del Seguro"
            value={config.insuranceFraming}
            options={['protection', 'peace_of_mind', 'direct']}
            descriptions={versionDescriptions.insuranceFraming}
            onChange={(v) => onConfigChange({ ...config, insuranceFraming: v as 'protection' | 'peace_of_mind' | 'direct' })}
          />

          {/* Skip Modal Tone */}
          <VersionSelector
            label="E.7 - Tono Modal Skip"
            value={config.skipModalTone}
            options={['persuasive', 'neutral', 'last_offer']}
            descriptions={versionDescriptions.skipModalTone}
            onChange={(v) => onConfigChange({ ...config, skipModalTone: v as 'persuasive' | 'neutral' | 'last_offer' })}
          />
        </ModalBody>

        <ModalFooter className="bg-white">
          <Button
            variant="light"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={handleReset}
          >
            Restablecer
          </Button>
          <Button className="bg-[#4654CD] text-white" onPress={onClose}>
            Aplicar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpsellSettingsModal;
