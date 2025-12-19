'use client';

/**
 * ApprovalSettingsModal - Modal de configuracion de aprobacion
 *
 * Permite cambiar todas las opciones de aprobacion para testing
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
import { ApprovalConfig, defaultApprovalConfig } from '../../types/approval';

interface ApprovalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApprovalConfig;
  onConfigChange: (config: ApprovalConfig) => void;
}

// Version descriptions
const versionDescriptions = {
  celebration: {
    1: 'Confetti animado + ilustración festiva',
    2: 'Solo ilustración colorida sin confetti',
    3: 'Checkmark animado minimalista',
  },
  confetti: {
    exuberant: 'Explosión de confetti por 3-5 segundos',
    subtle: 'Confetti sutil por 1-2 segundos',
    none: 'Sin efectos de confetti',
  },
  sound: {
    default_on: 'Sonido activado con opción de silenciar',
    off: 'Sin sonido por defecto',
    user_activated: 'Solo si el usuario lo activa',
  },
  summary: {
    1: 'Card completa con imagen del producto',
    2: 'Solo texto resumido sin imagen',
    3: 'Sección expandible/colapsable',
  },
  time: {
    1: 'Formato "24-48 horas hábiles"',
    2: 'Formato conversacional "Hoy o mañana"',
    3: 'Countdown visual en tiempo real',
  },
  share: {
    1: 'Botones prominentes de redes sociales',
    2: 'Link sutil "Compartir logro"',
    3: 'Sin opción de compartir',
  },
  referral: {
    1: 'Banner prominente con incentivo',
    2: 'Mención sutil al final',
    3: 'Sin programa de referidos',
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
            {typeof option === 'number' ? `V${option}` : option.replace('_', ' ')}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500">{descriptions[value]}</p>
    </div>
  );
};

export const ApprovalSettingsModal: React.FC<ApprovalSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const handleReset = () => {
    onConfigChange(defaultApprovalConfig);
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
          <span className="text-lg font-semibold text-neutral-800">Configuración de Aprobación</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona las versiones de cada componente para crear diferentes
            combinaciones y probar cuál funciona mejor.
          </p>

          {/* Celebration Version */}
          <VersionSelector
            label="F.1 - Elementos de Celebración"
            value={config.celebrationVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.celebration}
            onChange={(v) => onConfigChange({ ...config, celebrationVersion: v as 1 | 2 | 3 })}
          />

          {/* Confetti Intensity */}
          <VersionSelector
            label="F.2 - Intensidad del Confetti"
            value={config.confettiIntensity}
            options={['exuberant', 'subtle', 'none']}
            descriptions={versionDescriptions.confetti}
            onChange={(v) => onConfigChange({ ...config, confettiIntensity: v as 'exuberant' | 'subtle' | 'none' })}
          />

          {/* Sound Mode */}
          <VersionSelector
            label="F.3 - Sonido"
            value={config.soundMode}
            options={['default_on', 'off', 'user_activated']}
            descriptions={versionDescriptions.sound}
            onChange={(v) => onConfigChange({ ...config, soundMode: v as 'default_on' | 'off' | 'user_activated' })}
          />

          {/* Summary Version */}
          <VersionSelector
            label="F.7 - Resumen del Producto"
            value={config.summaryVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.summary}
            onChange={(v) => onConfigChange({ ...config, summaryVersion: v as 1 | 2 | 3 })}
          />

          {/* Time Estimate Version */}
          <VersionSelector
            label="F.9 - Tiempo Estimado"
            value={config.timeEstimateVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.time}
            onChange={(v) => onConfigChange({ ...config, timeEstimateVersion: v as 1 | 2 | 3 })}
          />

          {/* Share Version */}
          <VersionSelector
            label="F.12 - Compartir en Redes"
            value={config.shareVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.share}
            onChange={(v) => onConfigChange({ ...config, shareVersion: v as 1 | 2 | 3 })}
          />

          {/* Referral Version */}
          <VersionSelector
            label="F.13 - Referidos"
            value={config.referralVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.referral}
            onChange={(v) => onConfigChange({ ...config, referralVersion: v as 1 | 2 | 3 })}
          />
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
          <Button className="bg-[#4654CD] text-white cursor-pointer" onPress={onClose}>
            Aplicar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApprovalSettingsModal;
