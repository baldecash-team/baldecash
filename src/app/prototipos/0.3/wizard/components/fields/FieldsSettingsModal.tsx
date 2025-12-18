'use client';

/**
 * FieldsSettingsModal - Modal de configuracion de campos
 *
 * Permite seleccionar las versiones de cada tipo de campo
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
} from '@nextui-org/react';
import { Settings, RotateCcw } from 'lucide-react';
import { WizardConfig, defaultWizardConfig, versionDescriptions } from '../../types/fields';

interface FieldsSettingsModalProps {
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

export const FieldsSettingsModal: React.FC<FieldsSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const handleReset = () => {
    onConfigChange(defaultWizardConfig);
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
            Configuracion de Campos
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona las versiones de cada tipo de campo para probar
            diferentes combinaciones de UX.
          </p>

          {/* Section: Labels & Inputs */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#4654CD] mb-3">
              Labels e Inputs
            </h3>

            <VersionSelector
              label="C1.1 - Estilo de Labels"
              value={config.labelVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.label}
              onChange={(v) => onConfigChange({ ...config, labelVersion: v as 1 | 2 | 3 })}
            />

            <VersionSelector
              label="C1.4 - Estilo de Inputs"
              value={config.inputVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.input}
              onChange={(v) => onConfigChange({ ...config, inputVersion: v as 1 | 2 | 3 })}
            />
          </div>

          {/* Section: Options */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <h3 className="text-sm font-semibold text-[#4654CD] mb-3">
              Opciones y Seleccion
            </h3>

            <VersionSelector
              label="C1.13 - Opciones Excluyentes"
              value={config.radioVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.radio}
              onChange={(v) => onConfigChange({ ...config, radioVersion: v as 1 | 2 | 3 })}
            />
          </div>

          {/* Section: File Upload */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <h3 className="text-sm font-semibold text-[#4654CD] mb-3">
              Subida de Archivos
            </h3>

            <VersionSelector
              label="C1.15 - Area de Upload"
              value={config.uploadVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.upload}
              onChange={(v) => onConfigChange({ ...config, uploadVersion: v as 1 | 2 | 3 })}
            />

            <VersionSelector
              label="C1.16 - Preview de Archivo"
              value={config.previewVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.preview}
              onChange={(v) => onConfigChange({ ...config, previewVersion: v as 1 | 2 | 3 })}
            />

            <VersionSelector
              label="C1.17 - Indicador de Progreso"
              value={config.progressVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.progress}
              onChange={(v) => onConfigChange({ ...config, progressVersion: v as 1 | 2 | 3 })}
            />
          </div>

          {/* Section: Validation */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <h3 className="text-sm font-semibold text-[#4654CD] mb-3">
              Validacion y Errores
            </h3>

            <VersionSelector
              label="C1.21 - Validacion al Enviar"
              value={config.validationSubmitVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.validationSubmit}
              onChange={(v) => onConfigChange({ ...config, validationSubmitVersion: v as 1 | 2 | 3 })}
            />

            <VersionSelector
              label="C1.23 - Posicion del Error"
              value={config.errorMessageVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.errorMessage}
              onChange={(v) => onConfigChange({ ...config, errorMessageVersion: v as 1 | 2 | 3 })}
            />

            <VersionSelector
              label="C1.24 - Estilo del Error"
              value={config.errorStyleVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.errorStyle}
              onChange={(v) => onConfigChange({ ...config, errorStyleVersion: v as 1 | 2 | 3 })}
            />
          </div>

          {/* Section: Help */}
          <div className="pt-4 border-t border-neutral-200">
            <h3 className="text-sm font-semibold text-[#4654CD] mb-3">
              Ayuda Contextual
            </h3>

            <VersionSelector
              label="C1.28 - Tipo de Ayuda"
              value={config.helpVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.help}
              onChange={(v) => onConfigChange({ ...config, helpVersion: v as 1 | 2 | 3 })}
            />

            <VersionSelector
              label="C1.29 - Ejemplos de Documentos"
              value={config.documentExampleVersion}
              options={[1, 2, 3]}
              descriptions={versionDescriptions.documentExample}
              onChange={(v) => onConfigChange({ ...config, documentExampleVersion: v as 1 | 2 | 3 })}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-500">
                <strong>Nota:</strong> Los componentes de Select y Checkbox tienen
                una sola version fija con colores de marca. Estos ajustes afectan
                solo a los componentes con variantes.
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

export default FieldsSettingsModal;
