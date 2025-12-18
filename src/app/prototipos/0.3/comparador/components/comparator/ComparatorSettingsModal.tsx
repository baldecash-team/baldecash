'use client';

/**
 * ComparatorSettingsModal - Modal de configuracion del comparador
 *
 * Permite seleccionar versiones de layout, tabla, highlights, etc.
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
import {
  ComparatorConfig,
  defaultComparatorConfig,
  versionDescriptions,
} from '../../types/comparator';

interface ComparatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ComparatorConfig;
  onConfigChange: (config: ComparatorConfig) => void;
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

export const ComparatorSettingsModal: React.FC<ComparatorSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const handleReset = () => {
    onConfigChange(defaultComparatorConfig);
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
            Configuracion del Comparador
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona las versiones de cada componente para crear diferentes
            experiencias de comparacion.
          </p>

          {/* Layout Version */}
          <VersionSelector
            label="B.95 - Tipo de Comparador"
            value={config.layoutVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.layout}
            onChange={(v) => onConfigChange({ ...config, layoutVersion: v as 1 | 2 | 3 })}
          />

          {/* Table Version */}
          <VersionSelector
            label="B.92 - Visualizacion de Tabla"
            value={config.tableVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.table}
            onChange={(v) => onConfigChange({ ...config, tableVersion: v as 1 | 2 | 3 })}
          />

          {/* Highlight Version */}
          <VersionSelector
            label="B.93 - Resaltado de Diferencias"
            value={config.highlightVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.highlight}
            onChange={(v) => onConfigChange({ ...config, highlightVersion: v as 1 | 2 | 3 })}
          />

          {/* Max Products */}
          <div className="mb-4">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              B.91 - Maximo de Productos
            </label>
            <div className="flex gap-2 mb-2">
              {[2, 3, 4].map((option) => (
                <button
                  key={option}
                  onClick={() => onConfigChange({ ...config, maxProducts: option as 2 | 3 | 4 })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-center ${
                    config.maxProducts === option
                      ? 'bg-[#4654CD] text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {option} productos
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-500">
              {versionDescriptions.maxProducts[config.maxProducts]}
            </p>
          </div>

          {/* Price Diff Version */}
          <VersionSelector
            label="B.94 - Diferencia de Precio"
            value={config.priceDiffVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.priceDiff}
            onChange={(v) => onConfigChange({ ...config, priceDiffVersion: v as 1 | 2 | 3 })}
          />

          {/* Difference Mode */}
          <VersionSelector
            label="B.96 - Modo de Diferencias"
            value={config.differenceMode}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.differenceMode}
            onChange={(v) => onConfigChange({ ...config, differenceMode: v as 1 | 2 | 3 })}
          />

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-500">
                <strong>Nota:</strong> Cada combinacion ofrece una experiencia
                diferente. Prueba varias para encontrar la mejor para tus usuarios.
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

export default ComparatorSettingsModal;
