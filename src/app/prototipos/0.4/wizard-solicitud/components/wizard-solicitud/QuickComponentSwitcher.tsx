'use client';

/**
 * QuickComponentSwitcher - Modal rápido para cambiar componentes
 * Permite seleccionar componente y versión con un click
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from '@nextui-org/react';
import { Zap, Check } from 'lucide-react';
import type { WizardSolicitudConfig } from '../../types/wizard-solicitud';

type ComponentKey = 'wizardLayout' | 'progress' | 'navigation' | 'celebration' | 'input' | 'options' | 'upload' | 'header' | 'hero' | 'cta' | 'datePicker' | 'search';

interface QuickComponentSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  config: WizardSolicitudConfig;
  onConfigChange: (config: WizardSolicitudConfig) => void;
  activeComponent: ComponentKey;
  onActiveComponentChange: (component: ComponentKey) => void;
}

const COMPONENT_CONFIG_MAP: Record<ComponentKey, keyof WizardSolicitudConfig> = {
  header: 'headerVersion',
  hero: 'heroVersion',
  cta: 'ctaVersion',
  wizardLayout: 'wizardLayoutVersion',
  progress: 'progressVersion',
  navigation: 'navigationVersion',
  celebration: 'celebrationVersion',
  input: 'inputVersion',
  options: 'optionsVersion',
  upload: 'uploadVersion',
  datePicker: 'datePickerVersion',
  search: 'searchVersion',
};

const COMPONENT_GROUPS = [
  {
    title: 'Vista Intro (B.x)',
    color: 'bg-blue-500',
    components: [
      { key: 'header' as ComponentKey, label: 'B.1 - Header' },
      { key: 'hero' as ComponentKey, label: 'B.5 - Hero' },
      { key: 'cta' as ComponentKey, label: 'B.6 - CTA' },
    ],
  },
  {
    title: 'Wizard (C.x)',
    color: 'bg-purple-500',
    components: [
      { key: 'wizardLayout' as ComponentKey, label: 'C.1 - Layout' },
      { key: 'progress' as ComponentKey, label: 'C.5 - Progreso' },
      { key: 'navigation' as ComponentKey, label: 'C.14 - Navegacion' },
      { key: 'celebration' as ComponentKey, label: 'C.20 - Celebracion' },
    ],
  },
  {
    title: 'Campos (C1.x)',
    color: 'bg-green-500',
    components: [
      { key: 'input' as ComponentKey, label: 'C1.1+C1.4 - Input (Label integrado)' },
      { key: 'options' as ComponentKey, label: 'C1.13 - Opciones' },
      { key: 'upload' as ComponentKey, label: 'C1.15 - Upload' },
      { key: 'datePicker' as ComponentKey, label: 'C1.18 - DatePicker' },
      { key: 'search' as ComponentKey, label: 'C1.xx - SearchField' },
    ],
  },
];

export const QuickComponentSwitcher: React.FC<QuickComponentSwitcherProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  activeComponent,
  onActiveComponentChange,
}) => {
  const handleVersionChange = (componentKey: ComponentKey, version: number) => {
    const configKey = COMPONENT_CONFIG_MAP[componentKey];
    onConfigChange({
      ...config,
      [configKey]: version,
    });
    onActiveComponentChange(componentKey);
  };

  const getVersion = (componentKey: ComponentKey): number => {
    const configKey = COMPONENT_CONFIG_MAP[componentKey];
    return config[configKey] as number;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      backdrop="blur"
      placement="center"
      classNames={{
        base: 'bg-white',
        backdrop: 'bg-black/30',
        header: 'border-b border-neutral-200 py-3',
        body: 'py-4',
        closeButton: 'hover:bg-neutral-100 rounded-lg',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#4654CD]" />
          </div>
          <span className="text-base font-semibold text-neutral-800">Cambio Rapido</span>
          <span className="text-xs text-neutral-400 ml-auto mr-6">Presiona C para abrir/cerrar</span>
        </ModalHeader>

        <ModalBody className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {COMPONENT_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${group.color}`} />
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    {group.title}
                  </h3>
                </div>

                <div className="grid gap-2">
                  {group.components.map(({ key, label }) => {
                    const currentVersion = getVersion(key);
                    const isActive = activeComponent === key;

                    return (
                      <div
                        key={key}
                        className={`
                          p-3 rounded-xl border transition-all
                          ${isActive
                            ? 'border-[#4654CD] bg-[#4654CD]/5 ring-1 ring-[#4654CD]/20'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <button
                            type="button"
                            onClick={() => onActiveComponentChange(key)}
                            className="flex items-center gap-2 text-left"
                          >
                            {isActive && (
                              <div className="w-4 h-4 bg-[#4654CD] rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                            <span className={`text-sm font-medium ${isActive ? 'text-[#4654CD]' : 'text-neutral-700'}`}>
                              {label}
                            </span>
                          </button>
                          <span className="text-xs text-neutral-400">
                            V{currentVersion}
                          </span>
                        </div>

                        {/* Version buttons */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => handleVersionChange(key, v)}
                              className={`
                                flex-1 py-1.5 text-xs font-medium rounded-lg transition-all
                                ${currentVersion === v
                                  ? 'bg-[#4654CD] text-white'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }
                              `}
                            >
                              V{v}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Keyboard hints */}
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
              <span className="bg-neutral-100 px-2 py-1 rounded">Tab = siguiente</span>
              <span className="bg-neutral-100 px-2 py-1 rounded">Shift+Tab = anterior</span>
              <span className="bg-neutral-100 px-2 py-1 rounded">1-6 = version</span>
              <span className="bg-neutral-100 px-2 py-1 rounded">Esc = cerrar</span>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuickComponentSwitcher;
