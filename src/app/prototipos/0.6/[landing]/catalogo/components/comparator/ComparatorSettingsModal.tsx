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
        base: 'bg-[var(--surface,#fff)] my-8 rounded-[14px]',
        wrapper: 'items-center justify-center py-8 min-h-full z-[100]',
        backdrop: 'bg-black/50 z-[99]',
        header: 'border-b border-[var(--border-soft,#e5e7eb)] bg-[var(--surface,#fff)] py-4 pr-12 rounded-t-[14px]',
        body: 'bg-[var(--surface,#fff)] max-h-[60vh] overflow-y-auto scrollbar-hide',
        footer: 'border-t border-[var(--border-soft,#e5e7eb)] bg-[var(--surface,#fff)] rounded-b-[14px]',
        closeButton: 'top-4 right-4 hover:bg-[var(--surface-2,#f3f4f6)] rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <span className="text-lg font-semibold text-[var(--text-strong,#1f2937)]">
            Configuración del Comparador
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-[var(--surface,#fff)]">
          <p className="text-sm text-[var(--text-muted,#4b5563)] mb-4 pb-4 border-b border-[var(--border-soft,#e5e7eb)]">
            Personaliza el diseño seleccionando diferentes versiones de cada componente.
          </p>

          {/* Layout Version */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-[var(--text-strong,#1f2937)]">Layout del Comparador</h3>
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
                        ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                        : 'border-[var(--border-soft,#e5e7eb)] hover:border-[rgba(var(--color-primary-rgb),0.5)]'
                      }`,
                    wrapper: 'before:border-[var(--color-primary)] group-data-[selected=true]:border-[var(--color-primary)]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-[var(--text-muted,#6b7280)]',
                  }}
                  description={layoutVersionLabels[version].description}
                >
                  V{version} - {layoutVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Design Style - V1-V3 Exception */}
          <div className="mb-6 pt-4 border-t border-[var(--border-soft,#e5e7eb)]">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-[var(--text-strong,#1f2937)]">Estilo de Diseño</h3>
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
                        ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                        : 'border-[var(--border-soft,#e5e7eb)] hover:border-[rgba(var(--color-primary-rgb),0.5)]'
                      }`,
                    wrapper: 'before:border-[var(--color-primary)] group-data-[selected=true]:border-[var(--color-primary)]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-[var(--text-muted,#6b7280)]',
                  }}
                  description={designStyleLabels[version].description}
                >
                  V{version} - {designStyleLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Highlight Version */}
          <div className="mb-6 pt-4 border-t border-[var(--border-soft,#e5e7eb)]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-[var(--text-strong,#1f2937)]">Visualización Mejor/Peor</h3>
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
                        ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                        : 'border-[var(--border-soft,#e5e7eb)] hover:border-[rgba(var(--color-primary-rgb),0.5)]'
                      }`,
                    wrapper: 'before:border-[var(--color-primary)] group-data-[selected=true]:border-[var(--color-primary)]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-[var(--text-muted,#6b7280)]',
                  }}
                  description={highlightVersionLabels[version].description}
                >
                  V{version} - {highlightVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Fields Version */}
          <div className="mb-6 pt-4 border-t border-[var(--border-soft,#e5e7eb)]">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-[var(--text-strong,#1f2937)]">Campos de Comparación</h3>
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
                        ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                        : 'border-[var(--border-soft,#e5e7eb)] hover:border-[rgba(var(--color-primary-rgb),0.5)]'
                      }`,
                    wrapper: 'before:border-[var(--color-primary)] group-data-[selected=true]:border-[var(--color-primary)]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-[var(--text-muted,#6b7280)]',
                  }}
                  description={fieldsVersionLabels[version].description}
                >
                  V{version} - {fieldsVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Price Diff Version */}
          <div className="pt-4 border-t border-[var(--border-soft,#e5e7eb)]">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-[var(--text-strong,#1f2937)]">Diferencia de Precio</h3>
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
                        ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                        : 'border-[var(--border-soft,#e5e7eb)] hover:border-[rgba(var(--color-primary-rgb),0.5)]'
                      }`,
                    wrapper: 'before:border-[var(--color-primary)] group-data-[selected=true]:border-[var(--color-primary)]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-[var(--text-muted,#6b7280)]',
                  }}
                  description={priceDiffVersionLabels[version].description}
                >
                  V{version} - {priceDiffVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </ModalBody>

        <ModalFooter className="bg-[var(--surface,#fff)] justify-between">
          <Button
            variant="flat"
            startContent={copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
            onPress={handleGenerateUrl}
            className={`cursor-pointer transition-colors ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-[var(--surface-2,#f3f4f6)] text-[var(--text,#374151)] hover:bg-[var(--surface-2,#e5e7eb)]'
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
