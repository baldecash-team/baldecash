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
import { Settings, RotateCcw, Scale, Layout, Table, Sparkles, DollarSign, Columns, Eye, MousePointer, CreditCard, Link2, Check } from 'lucide-react';
import {
  ComparatorSettingsModalProps,
  defaultComparatorConfig,
  ComparatorConfig,
  accessVersionLabels,
  maxProductsVersionLabels,
  fieldsVersionLabels,
  highlightVersionLabels,
  priceDiffVersionLabels,
  layoutVersionLabels,
  differenceHighlightVersionLabels,
  cardSelectionVersionLabels,
} from '../../types/comparator';

export const ComparatorSettingsModal: React.FC<ComparatorSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    onConfigChange(defaultComparatorConfig);
  };

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();
    params.set('layout', config.layoutVersion.toString());
    params.set('access', config.accessVersion.toString());
    params.set('maxProducts', config.maxProductsVersion.toString());
    params.set('fields', config.fieldsVersion.toString());
    params.set('highlight', config.highlightVersion.toString());
    params.set('priceDiff', config.priceDiffVersion.toString());
    params.set('differenceHighlight', config.differenceHighlightVersion.toString());
    params.set('cardSelection', config.cardSelectionVersion.toString());
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateConfig = <K extends keyof ComparatorConfig>(
    key: K,
    value: ComparatorConfig[K]
  ) => {
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
            Personaliza el diseño del comparador seleccionando diferentes versiones de layout y componentes.
          </p>

          {/* Layout Version (B.95) */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Layout del Comparador</h3>
            </div>
            <RadioGroup
              value={config.layoutVersion.toString()}
              onValueChange={(val) => updateConfig('layoutVersion', parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((version) => (
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
                  description={layoutVersionLabels[version as keyof typeof layoutVersionLabels].description}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Access Version (B.90) */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <MousePointer className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Acceso al Comparador</h3>
            </div>
            <RadioGroup
              value={config.accessVersion.toString()}
              onValueChange={(val) => updateConfig('accessVersion', parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.accessVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={accessVersionLabels[version as keyof typeof accessVersionLabels].description}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Max Products Version (B.91) */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Cantidad de Productos</h3>
            </div>
            <RadioGroup
              value={config.maxProductsVersion.toString()}
              onValueChange={(val) => updateConfig('maxProductsVersion', parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.maxProductsVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={maxProductsVersionLabels[version as keyof typeof maxProductsVersionLabels].description}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Fields Version (B.92) */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Table className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Campos de Comparación</h3>
            </div>
            <RadioGroup
              value={config.fieldsVersion.toString()}
              onValueChange={(val) => updateConfig('fieldsVersion', parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((version) => (
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
                  description={fieldsVersionLabels[version as keyof typeof fieldsVersionLabels].description}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Highlight Version (B.93) */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Visualización Mejor/Peor</h3>
            </div>
            <RadioGroup
              value={config.highlightVersion.toString()}
              onValueChange={(val) => updateConfig('highlightVersion', parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((version) => (
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
                  description={highlightVersionLabels[version as keyof typeof highlightVersionLabels].description}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Price Diff Version (B.94) */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Diferencia de Precio</h3>
            </div>
            <RadioGroup
              value={config.priceDiffVersion.toString()}
              onValueChange={(val) => updateConfig('priceDiffVersion', parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((version) => (
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
                  description={priceDiffVersionLabels[version as keyof typeof priceDiffVersionLabels].description}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Difference Highlight Version (B.96) */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Resaltado de Diferencias</h3>
            </div>
            <RadioGroup
              value={config.differenceHighlightVersion.toString()}
              onValueChange={(val) => updateConfig('differenceHighlightVersion', parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.differenceHighlightVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={differenceHighlightVersionLabels[version as keyof typeof differenceHighlightVersionLabels].description}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Card Selection Style */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Estilo de Card Seleccionada</h3>
            </div>
            <RadioGroup
              value={config.cardSelectionVersion.toString()}
              onValueChange={(val) => updateConfig('cardSelectionVersion', parseInt(val) as 1 | 2 | 3)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {[1, 2, 3].map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.cardSelectionVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={cardSelectionVersionLabels[version as keyof typeof cardSelectionVersionLabels].description}
                >
                  Versión {version}
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

export default ComparatorSettingsModal;
