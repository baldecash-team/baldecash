'use client';

/**
 * RejectionSettingsModal - Interactive settings panel for testing rejection screen variations
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
import { RejectionConfig, defaultRejectionConfig } from '../../types/rejection';

interface RejectionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RejectionConfig;
  onConfigChange: (config: RejectionConfig) => void;
}

const versionDescriptions = {
  visual: {
    1: 'Colores neutros, profesional',
    2: 'Colores cálidos, empático',
    3: 'Marca suavizada, minimalista',
  },
  illustration: {
    person: 'Persona pensativa/reflexiva',
    path: 'Camino con bifurcación',
    none: 'Sin ilustración',
  },
  branding: {
    minimal: 'Branding mínimo',
    logo_only: 'Solo logo',
    full: 'Branding completo',
  },
  message: {
    1: 'Personalizado con nombre',
    2: 'Mensaje genérico',
    3: 'Condicional según contexto',
  },
  explanation: {
    1: 'Breve + tips específicos',
    2: 'Detallado con factores',
    3: 'Conversacional simple',
  },
  productAlternatives: {
    1: 'Grid de 3 productos',
    2: 'Carrusel deslizable',
    3: 'Un solo recomendado',
  },
  calculator: {
    1: 'Slider interactivo',
    2: 'Presets + input manual',
    3: 'No mostrar calculadora',
  },
  retention: {
    1: 'Integrado en el flujo',
    2: 'Modal al intentar salir',
    3: 'No capturar email',
  },
  support: {
    1: 'Prominente + múltiples canales',
    2: 'Sutil + solo WhatsApp',
    3: 'No mostrar soporte',
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

export const RejectionSettingsModal: React.FC<RejectionSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const resetConfig = () => {
    onConfigChange(defaultRejectionConfig);
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
          <span className="text-lg font-semibold text-neutral-800">Configurar Pantalla de Rechazo</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona las versiones de cada componente para crear diferentes
            combinaciones y probar cuál funciona mejor.
          </p>

          {/* Visual Version */}
          <VersionSelector
            label="G.1 - Versión Visual"
            value={config.visualVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.visual}
            onChange={(v) => onConfigChange({ ...config, visualVersion: v as 1 | 2 | 3 })}
          />

          {/* Illustration Type */}
          <VersionSelector
            label="G.2 - Ilustración"
            value={config.illustrationType}
            options={['person', 'path', 'none']}
            descriptions={versionDescriptions.illustration}
            onChange={(v) => onConfigChange({ ...config, illustrationType: v as 'person' | 'path' | 'none' })}
          />

          {/* Branding Level */}
          <VersionSelector
            label="G.3 - Nivel de Branding"
            value={config.brandingLevel}
            options={['minimal', 'logo_only', 'full']}
            descriptions={versionDescriptions.branding}
            onChange={(v) => onConfigChange({ ...config, brandingLevel: v as 'minimal' | 'logo_only' | 'full' })}
          />

          {/* Message Version */}
          <VersionSelector
            label="G.4 - Mensaje Principal"
            value={config.messageVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.message}
            onChange={(v) => onConfigChange({ ...config, messageVersion: v as 1 | 2 | 3 })}
          />

          {/* Explanation Version */}
          <VersionSelector
            label="G.7 - Explicación"
            value={config.explanationVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.explanation}
            onChange={(v) => onConfigChange({ ...config, explanationVersion: v as 1 | 2 | 3 })}
          />

          {/* Product Alternatives */}
          <VersionSelector
            label="G.10 - Productos Alternativos"
            value={config.productAlternativesVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.productAlternatives}
            onChange={(v) => onConfigChange({ ...config, productAlternativesVersion: v as 1 | 2 | 3 })}
          />

          {/* Calculator Version */}
          <VersionSelector
            label="G.11 - Calculadora Inicial"
            value={config.calculatorVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.calculator}
            onChange={(v) => onConfigChange({ ...config, calculatorVersion: v as 1 | 2 | 3 })}
          />

          {/* Retention Version */}
          <VersionSelector
            label="G.14 - Captura de Email"
            value={config.retentionVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.retention}
            onChange={(v) => onConfigChange({ ...config, retentionVersion: v as 1 | 2 | 3 })}
          />

          {/* Support Version */}
          <VersionSelector
            label="G.16 - CTA de Soporte"
            value={config.supportVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.support}
            onChange={(v) => onConfigChange({ ...config, supportVersion: v as 1 | 2 | 3 })}
          />
        </ModalBody>

        <ModalFooter className="bg-white">
          <Button
            variant="light"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={resetConfig}
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

export default RejectionSettingsModal;
