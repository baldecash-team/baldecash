'use client';

/**
 * EstadosSettingsModal - Panel de configuración para Estados Vacíos
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
import {
  EmptyStateConfig,
  EmptyStateScenario,
  defaultEmptyStateConfig,
  emptyStateScenarios,
} from '../types/estados';

interface EstadosSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EmptyStateConfig;
  onConfigChange: (config: EmptyStateConfig) => void;
  selectedScenario: EmptyStateScenario;
  onScenarioChange: (scenario: EmptyStateScenario) => void;
}

const versionDescriptions = {
  visual: {
    1: 'Estándar - Icono centrado con mensaje',
    2: 'Ilustrado - Con personaje amigable',
    3: 'Minimalista - Enfoque en acciones',
  },
  animation: {
    none: 'Sin animaciones',
    subtle: 'Animaciones sutiles',
    full: 'Animaciones completas',
  },
  suggestions: {
    3: 'Mostrar 3 productos sugeridos',
    6: 'Mostrar 6 productos sugeridos',
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
            {typeof option === 'number' ? `V${option}` : option}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500">{descriptions[value]}</p>
    </div>
  );
};

interface ScenarioSelectorProps {
  scenarios: EmptyStateScenario[];
  selected: EmptyStateScenario;
  onChange: (scenario: EmptyStateScenario) => void;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  selected,
  onChange,
}) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-neutral-700 mb-2 block">
        Escenario de Prueba
      </label>
      <div className="flex gap-2 mb-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onChange(scenario)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-center ${
              selected.id === scenario.id
                ? 'bg-[#4654CD] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {scenario.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500">{selected.description}</p>
    </div>
  );
};

export const EstadosSettingsModal: React.FC<EstadosSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  selectedScenario,
  onScenarioChange,
}) => {
  const resetConfig = () => {
    onConfigChange(defaultEmptyStateConfig);
    onScenarioChange(emptyStateScenarios[0]);
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
          <span className="text-lg font-semibold text-neutral-800">Configurar Estados Vacíos</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona las versiones de cada componente para crear diferentes
            combinaciones y probar cuál funciona mejor.
          </p>

          {/* Scenario */}
          <ScenarioSelector
            scenarios={emptyStateScenarios}
            selected={selectedScenario}
            onChange={onScenarioChange}
          />

          {/* Visual Version */}
          <VersionSelector
            label="Versión Visual"
            value={config.visualVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.visual}
            onChange={(v) => onConfigChange({ ...config, visualVersion: v as 1 | 2 | 3 })}
          />

          {/* Animation Level */}
          <VersionSelector
            label="Nivel de Animación"
            value={config.animationLevel}
            options={['none', 'subtle', 'full']}
            descriptions={versionDescriptions.animation}
            onChange={(v) => onConfigChange({ ...config, animationLevel: v as 'none' | 'subtle' | 'full' })}
          />

          {/* Options */}
          <div className="mb-4 pt-4 border-t border-neutral-100">
            <label className="text-sm font-medium text-neutral-700 mb-3 block">
              Opciones Adicionales
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-700">Mostrar sugerencias</p>
                  <p className="text-xs text-neutral-500">Productos alternativos relevantes</p>
                </div>
                <Switch
                  isSelected={config.showSuggestions}
                  onValueChange={(value) => onConfigChange({ ...config, showSuggestions: value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-700">Mostrar acciones de filtro</p>
                  <p className="text-xs text-neutral-500">Botones para limpiar/ajustar filtros</p>
                </div>
                <Switch
                  isSelected={config.showFilterActions}
                  onValueChange={(value) => onConfigChange({ ...config, showFilterActions: value })}
                />
              </div>
            </div>
          </div>

          {/* Suggestions Count */}
          {config.showSuggestions && (
            <VersionSelector
              label="Cantidad de Sugerencias"
              value={config.suggestionsCount}
              options={[3, 6]}
              descriptions={versionDescriptions.suggestions}
              onChange={(v) => onConfigChange({ ...config, suggestionsCount: v as 3 | 6 })}
            />
          )}
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

export default EstadosSettingsModal;
