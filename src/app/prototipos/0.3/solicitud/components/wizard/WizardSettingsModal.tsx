'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Switch,
} from '@nextui-org/react';
import { Settings, Layout, BarChart3, Navigation, MessageCircle, Layers, PartyPopper } from 'lucide-react';
import type { WizardConfig } from '../../types/wizard';

interface WizardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WizardConfig;
  onConfigChange: (config: WizardConfig) => void;
}

const versionOptions = [
  { value: '1', label: 'Versión 1' },
  { value: '2', label: 'Versión 2' },
  { value: '3', label: 'Versión 3' },
];

export const WizardSettingsModal: React.FC<WizardSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const updateConfig = (key: keyof WizardConfig, value: number | boolean) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      backdrop="blur"
      scrollBehavior="outside"
      placement="center"
      classNames={{
        base: 'bg-white my-8',
        wrapper: 'items-center justify-center py-8 min-h-full',
        backdrop: 'bg-black/50',
        body: 'bg-white max-h-[60vh] overflow-y-auto',
        closeButton: 'cursor-pointer',
      }}
    >
      <ModalContent className="bg-white">
        <ModalHeader className="flex items-center gap-3 border-b border-neutral-200">
          <div className="w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">Configuración del Wizard</h3>
            <p className="text-sm text-neutral-500">Ajusta las versiones de cada componente</p>
          </div>
        </ModalHeader>

        <ModalBody className="py-6">
          <div className="space-y-6">
            {/* Layout Version */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Layout className="w-5 h-5 text-neutral-600" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-neutral-800 mb-1 block">
                  Layout del Wizard
                </label>
                <p className="text-xs text-neutral-500 mb-2">
                  V1: Fullscreen | V2: Header minimalista | V3: Header + Progress sticky
                </p>
                <Select
                  aria-label="Layout version"
                  selectedKeys={[String(config.layoutVersion)]}
                  onChange={(e) => updateConfig('layoutVersion', Number(e.target.value) as 1 | 2 | 3)}
                  size="sm"
                  classNames={{
                    trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
                    value: 'text-sm text-neutral-700',
                    popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
                    listbox: 'p-1 bg-white',
                    listboxWrapper: 'max-h-[300px] bg-white',
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'bg-white',
                      content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
                    },
                  }}
                >
                  {versionOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      classNames={{
                        base: 'px-3 py-2 rounded-md text-sm text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selectable=true]:focus:bg-[#4654CD]/10 data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white cursor-pointer',
                      }}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Progress Version */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-neutral-600" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-neutral-800 mb-1 block">
                  Indicador de Progreso
                </label>
                <p className="text-xs text-neutral-500 mb-2">
                  V1: Steps numerados | V2: Barra con % | V3: Dots collapsible
                </p>
                <Select
                  aria-label="Progress version"
                  selectedKeys={[String(config.progressVersion)]}
                  onChange={(e) => updateConfig('progressVersion', Number(e.target.value) as 1 | 2 | 3)}
                  size="sm"
                  classNames={{
                    trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
                    value: 'text-sm text-neutral-700',
                    popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
                    listbox: 'p-1 bg-white',
                    listboxWrapper: 'max-h-[300px] bg-white',
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'bg-white',
                      content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
                    },
                  }}
                >
                  {versionOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      classNames={{
                        base: 'px-3 py-2 rounded-md text-sm text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selectable=true]:focus:bg-[#4654CD]/10 data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white cursor-pointer',
                      }}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Navigation Version */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-5 h-5 text-neutral-600" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-neutral-800 mb-1 block">
                  Botones de Navegación
                </label>
                <p className="text-xs text-neutral-500 mb-2">
                  V1: Fixed bottom | V2: Inline con form | V3: Adaptive móvil/desktop
                </p>
                <Select
                  aria-label="Navigation version"
                  selectedKeys={[String(config.navigationVersion)]}
                  onChange={(e) => updateConfig('navigationVersion', Number(e.target.value) as 1 | 2 | 3)}
                  size="sm"
                  classNames={{
                    trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
                    value: 'text-sm text-neutral-700',
                    popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
                    listbox: 'p-1 bg-white',
                    listboxWrapper: 'max-h-[300px] bg-white',
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'bg-white',
                      content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
                    },
                  }}
                >
                  {versionOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      classNames={{
                        base: 'px-3 py-2 rounded-md text-sm text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selectable=true]:focus:bg-[#4654CD]/10 data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white cursor-pointer',
                      }}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Motivation Version */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-neutral-600" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-neutral-800 mb-1 block">
                  Mensaje Motivacional
                </label>
                <p className="text-xs text-neutral-500 mb-2">
                  V1: Estático | V2: Dinámico con barra | V3: Avatar con tips
                </p>
                <Select
                  aria-label="Motivation version"
                  selectedKeys={[String(config.motivationVersion)]}
                  onChange={(e) => updateConfig('motivationVersion', Number(e.target.value) as 1 | 2 | 3)}
                  size="sm"
                  classNames={{
                    trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
                    value: 'text-sm text-neutral-700',
                    popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
                    listbox: 'p-1 bg-white',
                    listboxWrapper: 'max-h-[300px] bg-white',
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'bg-white',
                      content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
                    },
                  }}
                >
                  {versionOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      classNames={{
                        base: 'px-3 py-2 rounded-md text-sm text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selectable=true]:focus:bg-[#4654CD]/10 data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white cursor-pointer',
                      }}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Step Layout Version */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 text-neutral-600" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-neutral-800 mb-1 block">
                  Layout del Paso
                </label>
                <p className="text-xs text-neutral-500 mb-2">
                  V1: Single column | V2: Secciones agrupadas | V3: Cards por grupo
                </p>
                <Select
                  aria-label="Step layout version"
                  selectedKeys={[String(config.stepLayoutVersion)]}
                  onChange={(e) => updateConfig('stepLayoutVersion', Number(e.target.value) as 1 | 2 | 3)}
                  size="sm"
                  classNames={{
                    trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
                    value: 'text-sm text-neutral-700',
                    popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
                    listbox: 'p-1 bg-white',
                    listboxWrapper: 'max-h-[300px] bg-white',
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'bg-white',
                      content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
                    },
                  }}
                >
                  {versionOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      classNames={{
                        base: 'px-3 py-2 rounded-md text-sm text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selectable=true]:focus:bg-[#4654CD]/10 data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white cursor-pointer',
                      }}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Celebration Version */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <PartyPopper className="w-5 h-5 text-neutral-600" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-neutral-800 mb-1 block">
                  Celebración de Paso
                </label>
                <p className="text-xs text-neutral-500 mb-2">
                  V1: Check rápido | V2: Mensaje + check | V3: Confetti animado
                </p>
                <Select
                  aria-label="Celebration version"
                  selectedKeys={[String(config.celebrationVersion)]}
                  onChange={(e) => updateConfig('celebrationVersion', Number(e.target.value) as 1 | 2 | 3)}
                  size="sm"
                  classNames={{
                    trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
                    value: 'text-sm text-neutral-700',
                    popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
                    listbox: 'p-1 bg-white',
                    listboxWrapper: 'max-h-[300px] bg-white',
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'bg-white',
                      content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
                    },
                  }}
                >
                  {versionOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      classNames={{
                        base: 'px-3 py-2 rounded-md text-sm text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selectable=true]:focus:bg-[#4654CD]/10 data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white cursor-pointer',
                      }}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200 pt-4">
              <p className="text-sm font-medium text-neutral-800 mb-4">Opciones adicionales</p>

              {/* Toggle options */}
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
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-neutral-200">
          <Button
            variant="light"
            onPress={onClose}
            className="cursor-pointer"
          >
            Cerrar
          </Button>
          <Button
            className="bg-[#4654CD] text-white cursor-pointer"
            onPress={onClose}
          >
            Aplicar cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WizardSettingsModal;
