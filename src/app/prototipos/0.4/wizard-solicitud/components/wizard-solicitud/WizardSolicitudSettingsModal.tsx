'use client';

/**
 * WizardSolicitudSettingsModal - Modal de configuracion de versiones
 * PROMPT_18: Permite seleccionar 6 versiones por componente
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
import { CustomSwitch } from '@/app/prototipos/_shared/components/CustomSwitch';
import type { WizardSolicitudConfig } from '../../types/wizard-solicitud';
import { defaultWizardSolicitudConfig, versionDescriptions } from '../../types/wizard-solicitud';

interface WizardSolicitudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WizardSolicitudConfig;
  onConfigChange: (config: WizardSolicitudConfig) => void;
}

interface VersionSelectorProps {
  label: string;
  configKey: string;
  value: number;
  descriptions: Record<number, string>;
  onChange: (key: string, value: number) => void;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  label,
  configKey,
  value,
  descriptions,
  onChange,
}) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-neutral-700 mb-2 block">
        {label}
      </label>
      <div className="flex gap-1.5 mb-2 flex-wrap">
        {[1, 2, 3, 4, 5, 6].map((v) => (
          <button
            key={v}
            onClick={() => onChange(configKey, v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              value === v
                ? 'bg-[#4654CD] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            V{v}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500">{descriptions[value] || 'Sin descripcion'}</p>
    </div>
  );
};

export const WizardSolicitudSettingsModal: React.FC<WizardSolicitudSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const handleReset = () => {
    onConfigChange(defaultWizardSolicitudConfig);
  };

  const updateConfig = (key: string, value: number | boolean) => {
    onConfigChange({ ...config, [key]: value } as WizardSolicitudConfig);
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
          <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
            <Settings className="w-4 h-4 text-[#4654CD]" />
          </div>
          <span className="text-lg font-semibold text-neutral-800">Configuracion Formulario</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          {/* Vista Solicitud (B.x) */}
          <div className="mb-6">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#4654CD]/10 rounded text-xs flex items-center justify-center text-[#4654CD] font-bold">B</span>
              Vista de Solicitud (Intro)
            </h3>

            <VersionSelector
              label="B.1 - Header"
              configKey="headerVersion"
              value={config.headerVersion}
              descriptions={versionDescriptions.header}
              onChange={updateConfig}
            />

            <VersionSelector
              label="B.5 - Hero Visual"
              configKey="heroVersion"
              value={config.heroVersion}
              descriptions={versionDescriptions.hero}
              onChange={updateConfig}
            />

            <VersionSelector
              label="B.6 - CTA"
              configKey="ctaVersion"
              value={config.ctaVersion}
              descriptions={versionDescriptions.cta}
              onChange={updateConfig}
            />
          </div>

          <div className="border-t border-neutral-200 my-4" />

          {/* Wizard Estructura (C.x) */}
          <div className="mb-6">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#4654CD]/10 rounded text-xs flex items-center justify-center text-[#4654CD] font-bold">C</span>
              Wizard - Estructura
            </h3>

            <VersionSelector
              label="C.1 - Layout"
              configKey="wizardLayoutVersion"
              value={config.wizardLayoutVersion}
              descriptions={versionDescriptions.wizardLayout}
              onChange={updateConfig}
            />

            <VersionSelector
              label="C.5 - Indicador de Progreso"
              configKey="progressVersion"
              value={config.progressVersion}
              descriptions={versionDescriptions.progress}
              onChange={updateConfig}
            />

            <VersionSelector
              label="C.14 - Navegacion"
              configKey="navigationVersion"
              value={config.navigationVersion}
              descriptions={versionDescriptions.navigation}
              onChange={updateConfig}
            />

            <VersionSelector
              label="C.20 - Celebracion"
              configKey="celebrationVersion"
              value={config.celebrationVersion}
              descriptions={versionDescriptions.celebration}
              onChange={updateConfig}
            />
          </div>

          <div className="border-t border-neutral-200 my-4" />

          {/* Campos (C1.x) */}
          <div className="mb-6">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#4654CD]/10 rounded text-xs flex items-center justify-center text-[#4654CD] font-bold">C1</span>
              Campos del Formulario
            </h3>

            <VersionSelector
              label="C1.1 - Labels"
              configKey="labelVersion"
              value={config.labelVersion}
              descriptions={versionDescriptions.label}
              onChange={updateConfig}
            />

            <VersionSelector
              label="C1.4 - Inputs"
              configKey="inputVersion"
              value={config.inputVersion}
              descriptions={versionDescriptions.input}
              onChange={updateConfig}
            />

            <VersionSelector
              label="C1.13 - Opciones"
              configKey="optionsVersion"
              value={config.optionsVersion}
              descriptions={versionDescriptions.options}
              onChange={updateConfig}
            />

            <VersionSelector
              label="C1.15 - Upload"
              configKey="uploadVersion"
              value={config.uploadVersion}
              descriptions={versionDescriptions.upload}
              onChange={updateConfig}
            />

            <VersionSelector
              label="C1.18 - Fecha de Nacimiento"
              configKey="datePickerVersion"
              value={config.datePickerVersion}
              descriptions={versionDescriptions.datePicker}
              onChange={updateConfig}
            />

            <VersionSelector
              label="C1.21 - Validacion"
              configKey="validationVersion"
              value={config.validationVersion}
              descriptions={versionDescriptions.validation}
              onChange={updateConfig}
            />

            <VersionSelector
              label="C1.23/24 - Errores"
              configKey="errorVersion"
              value={config.errorVersion}
              descriptions={versionDescriptions.error}
              onChange={updateConfig}
            />

            <VersionSelector
              label="C1.28 - Ayuda"
              configKey="helpVersion"
              value={config.helpVersion}
              descriptions={versionDescriptions.help}
              onChange={updateConfig}
            />

            <VersionSelector
              label="C1.29 - Ejemplos Docs"
              configKey="docExamplesVersion"
              value={config.docExamplesVersion}
              descriptions={versionDescriptions.docExamples}
              onChange={updateConfig}
            />
          </div>

          <div className="border-t border-neutral-200 my-4" />

          {/* Opciones adicionales */}
          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">Opciones Adicionales</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Navegacion libre entre pasos</span>
                <CustomSwitch
                  size="sm"
                  isSelected={config.allowFreeNavigation}
                  onValueChange={(value) => updateConfig('allowFreeNavigation', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Guardado automatico</span>
                <CustomSwitch
                  size="sm"
                  isSelected={config.autoSave}
                  onValueChange={(value) => updateConfig('autoSave', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Mostrar tiempo estimado</span>
                <CustomSwitch
                  size="sm"
                  isSelected={config.showTimeEstimate}
                  onValueChange={(value) => updateConfig('showTimeEstimate', value)}
                />
              </div>
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
            className="bg-[#4654CD] text-white cursor-pointer hover:bg-[#3a47b3] transition-colors"
            onPress={onClose}
          >
            Aplicar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WizardSolicitudSettingsModal;
