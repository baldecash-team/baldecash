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
import { Settings, RotateCcw, Link2, Check, FileText, Images, Layout, Cpu, Calculator, Calendar, Grid2X2, AlertTriangle, Award } from 'lucide-react';
import {
  ProductDetailConfig,
  DetailVersion,
  defaultDetailConfig,
  versionDescriptions,
} from '../../types/detail';

interface DetailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProductDetailConfig;
  onConfigChange: (config: ProductDetailConfig) => void;
}

const versionOptions: DetailVersion[] = [1, 2, 3, 4, 5, 6];

export const DetailSettingsModal: React.FC<DetailSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    onConfigChange(defaultDetailConfig);
  };

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();
    params.set('infoHeader', config.infoHeaderVersion.toString());
    params.set('gallery', config.galleryVersion.toString());
    params.set('tabs', config.tabsVersion.toString());
    params.set('specs', config.specsVersion.toString());
    params.set('pricing', config.pricingVersion.toString());
    params.set('cronograma', config.cronogramaVersion.toString());
    params.set('similar', config.similarProductsVersion.toString());
    params.set('limitations', config.limitationsVersion.toString());
    params.set('certifications', config.certificationsVersion.toString());

    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/prototipos/0.4/producto/detail-preview`
      : '/prototipos/0.4/producto/detail-preview';

    const fullUrl = `${baseUrl}?${params.toString()}`;

    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
            Configuración del Detalle de Producto
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Personaliza el diseño de la página de detalle seleccionando diferentes versiones de cada componente.
          </p>

          {/* Info Header Version */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Info Header</h3>
            </div>
            <RadioGroup
              value={config.infoHeaderVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, infoHeaderVersion: parseInt(val) as DetailVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.infoHeaderVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.infoHeader[version]}
                >
                  Version {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Gallery Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Images className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Galería de Imágenes</h3>
            </div>
            <RadioGroup
              value={config.galleryVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, galleryVersion: parseInt(val) as DetailVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.galleryVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.gallery[version]}
                >
                  Version {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Tabs Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Tabs / Layout</h3>
            </div>
            <RadioGroup
              value={config.tabsVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, tabsVersion: parseInt(val) as DetailVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.tabsVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.tabs[version]}
                >
                  Version {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Specs Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Especificaciones</h3>
            </div>
            <RadioGroup
              value={config.specsVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, specsVersion: parseInt(val) as DetailVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.specsVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.specs[version]}
                >
                  Version {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Pricing Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Calculadora de Cuotas</h3>
            </div>
            <RadioGroup
              value={config.pricingVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, pricingVersion: parseInt(val) as DetailVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.pricingVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.pricing[version]}
                >
                  Version {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Cronograma Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Cronograma de Pagos</h3>
            </div>
            <RadioGroup
              value={config.cronogramaVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, cronogramaVersion: parseInt(val) as DetailVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.cronogramaVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.cronograma[version]}
                >
                  Version {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Similar Products Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Grid2X2 className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Productos Similares</h3>
            </div>
            <RadioGroup
              value={config.similarProductsVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, similarProductsVersion: parseInt(val) as DetailVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.similarProductsVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.similarProducts[version]}
                >
                  Version {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Limitations Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Limitaciones (Honestidad)</h3>
            </div>
            <RadioGroup
              value={config.limitationsVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, limitationsVersion: parseInt(val) as DetailVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.limitationsVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.limitations[version]}
                >
                  Version {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Certifications Version */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Certificaciones</h3>
            </div>
            <RadioGroup
              value={config.certificationsVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, certificationsVersion: parseInt(val) as DetailVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.certificationsVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.certifications[version]}
                >
                  Version {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </ModalBody>

        <ModalFooter className="bg-white flex justify-between">
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
              variant="flat"
              startContent={copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
              onPress={handleGenerateUrl}
              className={`cursor-pointer transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              {copied ? 'Copiado!' : 'Generar URL'}
            </Button>
          </div>
          <Button
            className="bg-[#4654CD] text-white cursor-pointer"
            onPress={onClose}
          >
            Aplicar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DetailSettingsModal;
