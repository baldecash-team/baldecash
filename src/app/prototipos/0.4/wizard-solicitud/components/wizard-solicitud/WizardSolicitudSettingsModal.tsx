'use client';

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
} from '@nextui-org/react';
import { Settings, RotateCcw, FileText, Image, MousePointerClick, Layout, BarChart3, Navigation2, PartyPopper, Tag, FormInput, ListChecks, Upload, Calendar, CheckCircle, AlertCircle, HelpCircle, BookOpen, ToggleLeft, Link2, Check } from 'lucide-react';
import { CustomSwitch } from '@/app/prototipos/_shared/components/CustomSwitch';
import type { WizardSolicitudConfig } from '../../types/wizard-solicitud';
import { defaultWizardSolicitudConfig, versionDescriptions } from '../../types/wizard-solicitud';

interface WizardSolicitudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WizardSolicitudConfig;
  onConfigChange: (config: WizardSolicitudConfig) => void;
}

const versionOptions = [1, 2, 3, 4, 5, 6] as const;

export const WizardSolicitudSettingsModal: React.FC<WizardSolicitudSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    onConfigChange(defaultWizardSolicitudConfig);
  };

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();
    params.set('header', config.headerVersion.toString());
    params.set('title', config.titleVersion.toString());
    params.set('message', config.messageVersion.toString());
    params.set('hero', config.heroVersion.toString());
    params.set('cta', config.ctaVersion.toString());
    params.set('wizardLayout', config.wizardLayoutVersion.toString());
    params.set('progress', config.progressVersion.toString());
    params.set('navigation', config.navigationVersion.toString());
    params.set('stepLayout', config.stepLayoutVersion.toString());
    params.set('input', config.inputVersion.toString());
    params.set('label', config.labelVersion.toString());
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-[#4654CD]" />
          </div>
          <span className="text-lg font-semibold text-neutral-800">
            Configuración del Formulario
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Personaliza el diseño del wizard seleccionando diferentes versiones de cada componente.
          </p>

          {/* Vista Solicitud (B.x) */}
          <div className="mb-6">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#4654CD]/10 rounded text-xs flex items-center justify-center text-[#4654CD] font-bold">B</span>
              Vista de Solicitud (Intro)
            </h3>

            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Header</h4>
              </div>
              <RadioGroup
                value={String(config.headerVersion)}
                onValueChange={(val) => updateConfig('headerVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.headerVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.header[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Hero Visual */}
            <div className="mb-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <Image className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Hero Visual</h4>
              </div>
              <RadioGroup
                value={String(config.heroVersion)}
                onValueChange={(val) => updateConfig('heroVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.heroVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.hero[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <MousePointerClick className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">CTA</h4>
              </div>
              <RadioGroup
                value={String(config.ctaVersion)}
                onValueChange={(val) => updateConfig('ctaVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.ctaVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.cta[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Wizard Estructura (C.x) */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#4654CD]/10 rounded text-xs flex items-center justify-center text-[#4654CD] font-bold">C</span>
              Wizard - Estructura
            </h3>

            {/* Layout */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Layout className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Layout</h4>
              </div>
              <RadioGroup
                value={String(config.wizardLayoutVersion)}
                onValueChange={(val) => updateConfig('wizardLayoutVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.wizardLayoutVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.wizardLayout[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Progress */}
            <div className="mb-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Indicador de Progreso</h4>
              </div>
              <RadioGroup
                value={String(config.progressVersion)}
                onValueChange={(val) => updateConfig('progressVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.progressVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.progress[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Navigation */}
            <div className="mb-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <Navigation2 className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Navegación</h4>
              </div>
              <RadioGroup
                value={String(config.navigationVersion)}
                onValueChange={(val) => updateConfig('navigationVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.navigationVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.navigation[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Celebration */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <PartyPopper className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Celebración</h4>
              </div>
              <RadioGroup
                value={String(config.celebrationVersion)}
                onValueChange={(val) => updateConfig('celebrationVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.celebrationVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.celebration[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Campos (C1.x) */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#4654CD]/10 rounded text-xs flex items-center justify-center text-[#4654CD] font-bold">C1</span>
              Campos del Formulario
            </h3>

            {/* Labels */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Labels</h4>
              </div>
              <RadioGroup
                value={String(config.labelVersion)}
                onValueChange={(val) => updateConfig('labelVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.labelVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.label[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Inputs */}
            <div className="mb-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <FormInput className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Inputs</h4>
              </div>
              <RadioGroup
                value={String(config.inputVersion)}
                onValueChange={(val) => updateConfig('inputVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.inputVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.input[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Options */}
            <div className="mb-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Opciones</h4>
              </div>
              <RadioGroup
                value={String(config.optionsVersion)}
                onValueChange={(val) => updateConfig('optionsVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.optionsVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.options[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Upload */}
            <div className="mb-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Upload</h4>
              </div>
              <RadioGroup
                value={String(config.uploadVersion)}
                onValueChange={(val) => updateConfig('uploadVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.uploadVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.upload[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* DatePicker */}
            <div className="mb-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Fecha de Nacimiento</h4>
              </div>
              <RadioGroup
                value={String(config.datePickerVersion)}
                onValueChange={(val) => updateConfig('datePickerVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.datePickerVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.datePicker[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Validation */}
            <div className="mb-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Validación</h4>
              </div>
              <RadioGroup
                value={String(config.validationVersion)}
                onValueChange={(val) => updateConfig('validationVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.validationVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.validation[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Errors */}
            <div className="mb-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Errores</h4>
              </div>
              <RadioGroup
                value={String(config.errorVersion)}
                onValueChange={(val) => updateConfig('errorVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.errorVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.error[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Help */}
            <div className="mb-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Ayuda</h4>
              </div>
              <RadioGroup
                value={String(config.helpVersion)}
                onValueChange={(val) => updateConfig('helpVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.helpVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.help[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Doc Examples */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#4654CD]" />
                <h4 className="font-medium text-neutral-800">Ejemplos Documentos</h4>
              </div>
              <RadioGroup
                value={String(config.docExamplesVersion)}
                onValueChange={(val) => updateConfig('docExamplesVersion', Number(val))}
                classNames={{ wrapper: 'gap-2' }}
              >
                {versionOptions.map((version) => (
                  <Radio
                    key={version}
                    value={String(version)}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${config.docExamplesVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={versionDescriptions.docExamples[version]}
                  >
                    Versión {version}
                  </Radio>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Opciones adicionales */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-4">
              <ToggleLeft className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Opciones Adicionales</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                <span className="text-sm text-neutral-700">Navegación libre entre pasos</span>
                <CustomSwitch
                  size="sm"
                  isSelected={config.allowFreeNavigation}
                  onValueChange={(value) => updateConfig('allowFreeNavigation', value)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                <span className="text-sm text-neutral-700">Guardado automático</span>
                <CustomSwitch
                  size="sm"
                  isSelected={config.autoSave}
                  onValueChange={(value) => updateConfig('autoSave', value)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
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

        <ModalFooter className="bg-white justify-between">
          <Button
            variant="flat"
            startContent={copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
            onPress={handleGenerateUrl}
            className={`cursor-pointer transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
          >
            {copied ? 'Copiado!' : 'Generar URL'}
          </Button>
          <div className="flex gap-2">
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
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WizardSolicitudSettingsModal;
