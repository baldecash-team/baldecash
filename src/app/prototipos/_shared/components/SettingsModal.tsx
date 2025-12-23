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
} from '@nextui-org/react';
import { Settings, RotateCcw } from 'lucide-react';
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
 *
 * IMPORTANTE: Este modal sigue el patrón de HeroSettingsModal
 * - Usa Select en lugar de RadioGroup
 * - Sin bordes visibles en el contenido
 * - Estilos consistentes con la marca
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
          <span className="text-lg font-semibold text-neutral-800">Configurar {sectionLabel}</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona la versión de cada componente para ver diferentes combinaciones de diseño.
          </p>

          {groups.map((group) => (
            <div key={group.id} className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {group.label}
              </label>
              <Select
                aria-label={group.label}
                selectedKeys={new Set([String(group.currentVersion)])}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  if (selectedKey) {
                    onVersionChange(group.id, Number(selectedKey) as ComponentVersion);
                  }
                }}
                renderValue={(items) => {
                  return items.map((item) => (
                    <span key={item.key} className="text-sm text-neutral-700">
                      {item.textValue}
                    </span>
                  ));
                }}
                classNames={{
                  base: 'w-full',
                  trigger: 'h-12 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
                  value: 'text-sm text-neutral-700',
                  innerWrapper: 'pr-8',
                  selectorIcon: 'right-3',
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
                {group.options.map((option) => (
                  <SelectItem
                    key={String(option.value)}
                    textValue={`V${option.value}: ${option.description}`}
                    classNames={{
                      base: `px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                        text-neutral-700
                        data-[selected=false]:data-[hover=true]:bg-[#4654CD]/10
                        data-[selected=false]:data-[hover=true]:text-[#4654CD]
                        data-[selected=true]:bg-[#4654CD]
                        data-[selected=true]:text-white`,
                    }}
                  >
                    V{option.value}: {option.description}
                  </SelectItem>
                ))}
              </Select>
            </div>
          ))}

          <div className="mt-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-500">
              <strong>Nota:</strong> Cada combinación puede producir diferentes experiencias de usuario.
              Experimenta con distintas versiones para encontrar la mejor configuración.
            </p>
          </div>
        </ModalBody>

        <ModalFooter className="bg-white">
          <Button
            variant="light"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={onReset}
            className="cursor-pointer"
          >
            Restablecer
          </Button>
          <Button
            className="bg-[#4654CD] text-white cursor-pointer hover:bg-[#3a47b3] transition-colors"
            onPress={handleApplyAndClose}
          >
            Aplicar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default SettingsModal;
