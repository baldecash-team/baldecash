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
} from '@nextui-org/react';
import { Settings, RotateCcw, Image, MousePointerClick } from 'lucide-react';
import {
  EmptyStateConfig,
  defaultEmptyStateConfig,
  illustrationVersionLabels,
  actionsVersionLabels,
} from '../../types/empty';

interface EmptyStateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EmptyStateConfig;
  onConfigChange: (config: EmptyStateConfig) => void;
}

/**
 * EmptyStateSettingsModal
 * Modal de configuración para el estado vacío
 * Sigue el patrón de HeroSettingsModal de v0.4
 */
export const EmptyStateSettingsModal: React.FC<EmptyStateSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const updateConfig = <K extends keyof EmptyStateConfig>(
    key: K,
    value: EmptyStateConfig[K]
  ) => {
    onConfigChange({ ...config, [key]: value });
  };

  const handleReset = () => {
    onConfigChange(defaultEmptyStateConfig);
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
            Configurar Estado Vacío
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Personaliza la apariencia del estado vacío cuando no hay resultados en el catálogo.
          </p>

          {/* Sección: Ilustración (B.103) */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Ilustración</h3>
            </div>
            <RadioGroup
              value={config.illustrationVersion.toString()}
              onValueChange={(val) => updateConfig('illustrationVersion', parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {([1, 2, 3, 4, 5, 6] as const).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.illustrationVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={illustrationVersionLabels[version].description}
                >
                  V{version} - {illustrationVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Separador */}
          <div className="border-t border-neutral-200 my-4" />

          {/* Sección: Acciones (B.104) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MousePointerClick className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Acciones</h3>
            </div>
            <RadioGroup
              value={config.actionsVersion.toString()}
              onValueChange={(val) => updateConfig('actionsVersion', parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {([1, 2, 3, 4, 5, 6] as const).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.actionsVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={actionsVersionLabels[version].description}
                >
                  V{version} - {actionsVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
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

export default EmptyStateSettingsModal;
