'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
  Divider,
  Chip,
} from '@nextui-org/react';
import { RotateCcw, Check, X } from 'lucide-react';
import type { SettingsGroup, ComponentVersion } from '../types/config.types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  sectionLabel: string;
  groups: SettingsGroup[];
  onVersionChange: (componentId: string, version: ComponentVersion) => void;
  onReset: () => void;
  onApply: () => void;
  hasChanges: boolean;
}

/**
 * Modal para seleccionar versiones de componentes
 * Permite preview en tiempo real antes de guardar
 */
export function SettingsModal({
  isOpen,
  onClose,
  sectionName,
  sectionLabel,
  groups,
  onVersionChange,
  onReset,
  onApply,
  hasChanges,
}: SettingsModalProps) {
  const handleApplyAndClose = () => {
    onApply();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-white',
        header: 'border-b border-neutral-200',
        body: 'py-6',
        footer: 'border-t border-neutral-200',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-neutral-800">
            Configurar {sectionLabel}
          </h2>
          <p className="text-sm font-normal text-neutral-500">
            Selecciona las versiones de cada componente para probar
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {groups.map((group, index) => (
              <div key={group.id}>
                {index > 0 && <Divider className="my-4" />}

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-neutral-800">
                      {group.label}
                    </h3>
                    <Chip size="sm" variant="flat" className="bg-[#4654CD]/10 text-[#4654CD]">
                      V{group.currentVersion}
                    </Chip>
                  </div>
                </div>

                <RadioGroup
                  value={String(group.currentVersion)}
                  onValueChange={(value) =>
                    onVersionChange(group.id, Number(value) as ComponentVersion)
                  }
                  classNames={{
                    wrapper: 'gap-3',
                  }}
                >
                  {group.options.map((option) => (
                    <Radio
                      key={option.value}
                      value={String(option.value)}
                      classNames={{
                        base: 'border border-neutral-200 rounded-lg p-3 max-w-full hover:bg-neutral-50 data-[selected=true]:border-[#4654CD] data-[selected=true]:bg-[#4654CD]/5',
                        label: 'w-full',
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-800">
                          {option.label}
                        </span>
                        <span className="text-sm text-neutral-500">
                          {option.description}
                        </span>
                      </div>
                    </Radio>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between">
          <Button
            variant="light"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={onReset}
            className="text-neutral-600"
          >
            Resetear
          </Button>

          <div className="flex gap-2">
            <Button
              variant="bordered"
              startContent={<X className="w-4 h-4" />}
              onPress={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#4654CD] text-white"
              startContent={<Check className="w-4 h-4" />}
              onPress={handleApplyAndClose}
              isDisabled={!hasChanges}
            >
              Aplicar cambios
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default SettingsModal;
