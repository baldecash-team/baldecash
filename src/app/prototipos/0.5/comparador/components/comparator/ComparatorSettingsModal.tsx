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
import { Settings, RotateCcw, Link2, Check, Layout, Sparkles, List, DollarSign, Palette } from 'lucide-react';
import {
  ComparatorConfig,
  defaultComparatorConfig,
  layoutVersionLabels,
  designStyleLabels,
  highlightVersionLabels,
  fieldsVersionLabels,
  priceDiffVersionLabels,
} from '../../types/comparator';

interface ComparatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ComparatorConfig;
  onConfigChange: (config: ComparatorConfig) => void;
}

export const ComparatorSettingsModal: React.FC<ComparatorSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();
    if (config.layoutVersion !== defaultComparatorConfig.layoutVersion) {
      params.set('layout', config.layoutVersion.toString());
    }
    if (config.designStyle !== defaultComparatorConfig.designStyle) {
      params.set('design', config.designStyle.toString());
    }
    if (config.highlightVersion !== defaultComparatorConfig.highlightVersion) {
      params.set('highlight', config.highlightVersion.toString());
    }
    if (config.fieldsVersion !== defaultComparatorConfig.fieldsVersion) {
      params.set('fields', config.fieldsVersion.toString());
    }
    if (config.priceDiffVersion !== defaultComparatorConfig.priceDiffVersion) {
      params.set('pricediff', config.priceDiffVersion.toString());
    }

    const queryString = params.toString();
    const pathname = window.location.pathname.replace(/\/$/, ''); // Remove trailing slash
    const url = `${window.location.origin}${pathname}${queryString ? `?${queryString}` : ''}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onConfigChange(defaultComparatorConfig);
  };

  const updateConfig = (key: keyof ComparatorConfig, value: number) => {
    onConfigChange({ ...config, [key]: value });
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
            Configuración del Comparador
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Personaliza el diseño seleccionando diferentes versiones de cada componente.
          </p>

          {/* Layout Version */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Layout del Comparador</h3>
            </div>
            <RadioGroup
              value={config.layoutVersion.toString()}
              onValueChange={(val) => updateConfig('layoutVersion', parseInt(val) as 1 | 2)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {([1, 2] as const).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.layoutVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={layoutVersionLabels[version].description}
                >
                  V{version} - {layoutVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Design Style - V1-V3 Exception */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Estilo de Diseño</h3>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                V1-V3
              </span>
            </div>
            <RadioGroup
              value={config.designStyle.toString()}
              onValueChange={(val) => updateConfig('designStyle', parseInt(val) as 1 | 2 | 3)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {([1, 2, 3] as const).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.designStyle === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={designStyleLabels[version].description}
                >
                  V{version} - {designStyleLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Highlight Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Visualización Mejor/Peor</h3>
            </div>
            <RadioGroup
              value={config.highlightVersion.toString()}
              onValueChange={(val) => updateConfig('highlightVersion', parseInt(val) as 1 | 2)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {([1, 2] as const).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.highlightVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={highlightVersionLabels[version].description}
                >
                  V{version} - {highlightVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Fields Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Campos de Comparación</h3>
            </div>
            <RadioGroup
              value={config.fieldsVersion.toString()}
              onValueChange={(val) => updateConfig('fieldsVersion', parseInt(val) as 1 | 2)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {([1, 2] as const).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.fieldsVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={fieldsVersionLabels[version].description}
                >
                  V{version} - {fieldsVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Price Diff Version */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Diferencia de Precio</h3>
            </div>
            <RadioGroup
              value={config.priceDiffVersion.toString()}
              onValueChange={(val) => updateConfig('priceDiffVersion', parseInt(val) as 1 | 2)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {([1, 2] as const).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.priceDiffVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={priceDiffVersionLabels[version].description}
                >
                  V{version} - {priceDiffVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </ModalBody>

        <ModalFooter className="bg-white justify-between">
          <Button
            variant="flat"
            startContent={copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
            onPress={handleGenerateUrl}
            className={`cursor-pointer transition-colors ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {copied ? '¡Copiado!' : 'Generar URL'}
          </Button>
          <Button
            variant="light"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={handleReset}
            className="cursor-pointer"
          >
            Restablecer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
