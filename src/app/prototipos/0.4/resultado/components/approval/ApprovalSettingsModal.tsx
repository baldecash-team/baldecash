'use client';

/**
 * ApprovalSettingsModal - Modal de configuración A/B
 * Permite seleccionar las versiones de cada componente
 */

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
import { Settings, RotateCcw, PartyPopper, Sparkles, Volume2, FileText, List, Share2, Users } from 'lucide-react';
import type { ApprovalConfig, Version } from '../../types/approval';
import {
  defaultApprovalConfig,
  celebrationVersionLabels,
  confettiVersionLabels,
  soundVersionLabels,
  summaryVersionLabels,
  nextStepsVersionLabels,
  shareVersionLabels,
  referralVersionLabels,
} from '../../types/approval';

interface ApprovalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApprovalConfig;
  onConfigChange: (config: ApprovalConfig) => void;
}

export const ApprovalSettingsModal: React.FC<ApprovalSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const updateConfig = <K extends keyof ApprovalConfig>(key: K, value: ApprovalConfig[K]) => {
    onConfigChange({ ...config, [key]: value });
  };

  const resetConfig = () => {
    onConfigChange(defaultApprovalConfig);
  };

  const versions: Version[] = [1, 2, 3, 4, 5, 6];

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
          <span className="text-lg font-semibold text-neutral-800">Configurar Aprobación</span>
        </ModalHeader>

        <ModalBody className="p-6">
          {/* F.1 - Celebración */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <PartyPopper className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Elementos de celebración</h3>
            </div>
            <RadioGroup
              value={config.celebrationVersion.toString()}
              onValueChange={(val) => updateConfig('celebrationVersion', parseInt(val) as Version)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {versions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
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
                  description={celebrationVersionLabels[version].description}
                >
                  V{version} - {celebrationVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* F.2 - Confetti */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Intensidad del confetti</h3>
            </div>
            <RadioGroup
              value={config.confettiVersion.toString()}
              onValueChange={(val) => updateConfig('confettiVersion', parseInt(val) as Version)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {versions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.confettiVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={confettiVersionLabels[version].description}
                >
                  V{version} - {confettiVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* F.3 - Sonido */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Sonido de celebración</h3>
            </div>
            <RadioGroup
              value={config.soundVersion.toString()}
              onValueChange={(val) => updateConfig('soundVersion', parseInt(val) as Version)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {versions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.soundVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={soundVersionLabels[version].description}
                >
                  V{version} - {soundVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* F.7 - Resumen */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Resumen del producto</h3>
            </div>
            <RadioGroup
              value={config.summaryVersion.toString()}
              onValueChange={(val) => updateConfig('summaryVersion', parseInt(val) as Version)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {versions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.summaryVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={summaryVersionLabels[version].description}
                >
                  V{version} - {summaryVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* F.9 - Próximos pasos */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Tiempo estimado</h3>
            </div>
            <RadioGroup
              value={config.nextStepsVersion.toString()}
              onValueChange={(val) => updateConfig('nextStepsVersion', parseInt(val) as Version)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {versions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.nextStepsVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={nextStepsVersionLabels[version].description}
                >
                  V{version} - {nextStepsVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* F.12 - Compartir */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Compartir en redes</h3>
            </div>
            <RadioGroup
              value={config.shareVersion.toString()}
              onValueChange={(val) => updateConfig('shareVersion', parseInt(val) as Version)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {versions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.shareVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={shareVersionLabels[version].description}
                >
                  V{version} - {shareVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* F.13 - Referidos */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Referidos</h3>
            </div>
            <RadioGroup
              value={config.referralVersion.toString()}
              onValueChange={(val) => updateConfig('referralVersion', parseInt(val) as Version)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {versions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.referralVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={referralVersionLabels[version].description}
                >
                  V{version} - {referralVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="light"
            className="cursor-pointer"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={resetConfig}
          >
            Restaurar valores
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

export default ApprovalSettingsModal;
