'use client';

/**
 * WizardSettingsModal - Modal de configuracion de versiones
 *
 * Permite seleccionar las versiones de cada componente
 * para pruebas A/B y demos
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
} from '@nextui-org/react';
import { Settings, RotateCcw } from 'lucide-react';
import type { WizardConfig } from '../../types/wizard';
import { defaultWizardConfig } from '../../types/wizard';

interface WizardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WizardConfig;
  onConfigChange: (config: WizardConfig) => void;
}

interface VersionSelectorProps {
  label: string;
  value: number;
  options: number[];
  descriptions: Record<number, string>;
  onChange: (value: number) => void;
}

const versionDescriptions = {
  layout: {
    1: 'Fullscreen - Pantalla completa sin distracciones',
    2: 'Header minimalista - Navegación reducida',
    3: 'Header + Progress sticky - Navegación persistente',
  },
  progress: {
    1: 'Steps numerados - Lista vertical con números',
    2: 'Barra con % - Indicador horizontal de progreso',
    3: 'Dots collapsible - Puntos compactos expandibles',
  },
  navigation: {
    1: 'Fixed bottom - Botones fijos en la parte inferior',
    2: 'Inline con form - Botones integrados en el formulario',
    3: 'Adaptive móvil/desktop - Se adapta al dispositivo',
  },
  stepLayout: {
    1: 'Single column - Una columna simple',
    2: 'Secciones agrupadas - Campos organizados por sección',
    3: 'Cards por grupo - Cada grupo en una tarjeta',
  },
  motivation: {
    1: 'Estático - Mensaje fijo de motivación',
    2: 'Dinámico con barra - Mensaje que cambia con el progreso',
    3: 'Avatar con tips - Asistente virtual con consejos',
  },
  celebration: {
    1: 'Check rápido - Animación simple de completado',
    2: 'Mensaje + check - Felicitación con animación',
    3: 'Confetti animado - Celebración con efectos visuales',
  },
};

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

export const WizardSettingsModal: React.FC<WizardSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const handleReset = () => {
    onConfigChange(defaultWizardConfig);
  };

  const updateConfig = (key: keyof WizardConfig, value: number | boolean) => {
    onConfigChange({ ...config, [key]: value });
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
          <span className="text-lg font-semibold text-neutral-800">Configuración del Wizard</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona las versiones de cada componente para crear diferentes
            combinaciones y probar cual funciona mejor.
          </p>

          {/* Layout Version */}
          <VersionSelector
            label="B.1 - Layout del Wizard"
            value={config.layoutVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.layout}
            onChange={(v) => updateConfig('layoutVersion', v as 1 | 2 | 3)}
          />

          {/* Progress Version */}
          <VersionSelector
            label="B.2 - Indicador de Progreso"
            value={config.progressVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.progress}
            onChange={(v) => updateConfig('progressVersion', v as 1 | 2 | 3)}
          />

          {/* Navigation Version */}
          <VersionSelector
            label="B.3 - Botones de Navegación"
            value={config.navigationVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.navigation}
            onChange={(v) => updateConfig('navigationVersion', v as 1 | 2 | 3)}
          />

          {/* Step Layout Version */}
          <VersionSelector
            label="B.4 - Layout del Paso"
            value={config.stepLayoutVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.stepLayout}
            onChange={(v) => updateConfig('stepLayoutVersion', v as 1 | 2 | 3)}
          />

          {/* Motivation Version */}
          <VersionSelector
            label="B.5 - Mensaje Motivacional"
            value={config.motivationVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.motivation}
            onChange={(v) => updateConfig('motivationVersion', v as 1 | 2 | 3)}
          />

          {/* Celebration Version */}
          <VersionSelector
            label="B.6 - Celebración de Paso"
            value={config.celebrationVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.celebration}
            onChange={(v) => updateConfig('celebrationVersion', v as 1 | 2 | 3)}
          />

          {/* Additional Options */}
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-sm font-medium text-neutral-700 mb-4">Opciones adicionales</p>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-neutral-700">Navegación libre entre pasos</span>
                <Switch
                  size="sm"
                  isSelected={config.allowFreeNavigation}
                  onValueChange={(value) => updateConfig('allowFreeNavigation', value)}
                  classNames={{
                    wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                    thumb: 'bg-white shadow-md',
                  }}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-neutral-700">Guardado automático</span>
                <Switch
                  size="sm"
                  isSelected={config.autoSave}
                  onValueChange={(value) => updateConfig('autoSave', value)}
                  classNames={{
                    wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                    thumb: 'bg-white shadow-md',
                  }}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-neutral-700">Mostrar tiempo estimado</span>
                <Switch
                  size="sm"
                  isSelected={config.showTimeEstimate}
                  onValueChange={(value) => updateConfig('showTimeEstimate', value)}
                  classNames={{
                    wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                    thumb: 'bg-white shadow-md',
                  }}
                />
              </label>
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

export default WizardSettingsModal;
