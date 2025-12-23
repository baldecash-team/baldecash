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
import { Settings, RotateCcw, Package, Shield, Link2, Check } from 'lucide-react';
import { UpsellConfig, defaultUpsellConfig, versionDescriptions } from '../../types/upsell';

interface UpsellSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UpsellConfig;
  onConfigChange: (config: UpsellConfig) => void;
}

/**
 * UpsellSettingsModal - Modal de configuración para Upsell
 * 13 selectores de versión para A/B testing
 */
export const UpsellSettingsModal: React.FC<UpsellSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [copied, setCopied] = useState(false);

  const updateConfig = <K extends keyof UpsellConfig>(
    key: K,
    value: UpsellConfig[K]
  ) => {
    onConfigChange({ ...config, [key]: value });
  };

  const handleReset = () => {
    onConfigChange(defaultUpsellConfig);
  };

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();
    params.set('accessoryIntro', config.accessoryIntroVersion.toString());
    params.set('accessoryCard', config.accessoryCardVersion.toString());
    params.set('accessoryLimit', config.accessoryLimitVersion.toString());
    params.set('priceBreakdown', config.priceBreakdownVersion.toString());
    params.set('insuranceIntro', config.insuranceIntroVersion.toString());
    params.set('planComparison', config.planComparisonVersion.toString());
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderVersionSelector = (
    label: string,
    configKey: keyof UpsellConfig,
    descriptions: Record<number, string>,
    icon: React.ReactNode
  ) => (
    <div className="mb-6 pt-4 border-t border-neutral-200 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-neutral-800">{label}</h3>
      </div>
      <RadioGroup
        value={config[configKey].toString()}
        onValueChange={(val) => updateConfig(configKey, parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
        classNames={{ wrapper: 'gap-2' }}
      >
        {[1, 2, 3, 4, 5, 6].map((version) => (
          <Radio
            key={version}
            value={version.toString()}
            classNames={{
              base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                ${config[configKey] === version
                  ? 'border-[#4654CD] bg-[#4654CD]/5'
                  : 'border-neutral-200 hover:border-[#4654CD]/50'
                }`,
              wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
              labelWrapper: 'ml-2',
              label: 'text-sm',
              description: 'text-xs text-neutral-500',
            }}
            description={descriptions[version]}
          >
            Versión {version}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );

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
          <span className="text-lg font-semibold text-neutral-800">Configurar Upsell</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Personaliza las versiones de cada componente de upsell para testing A/B.
          </p>

          {/* Sección Accesorios */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-300">
              <Package className="w-5 h-5 text-[#4654CD]" />
              <h2 className="text-base font-bold text-neutral-800">Accesorios</h2>
            </div>

            {renderVersionSelector(
              'Introducción',
              'accessoryIntroVersion',
              versionDescriptions.accessoryIntro,
              <Package className="w-4 h-4 text-[#4654CD]" />
            )}

            {renderVersionSelector(
              'Cards de Accesorios',
              'accessoryCardVersion',
              versionDescriptions.accessoryCard,
              <Package className="w-4 h-4 text-[#4654CD]" />
            )}

            {renderVersionSelector(
              'Límite de Selección',
              'accessoryLimitVersion',
              versionDescriptions.accessoryLimit,
              <Package className="w-4 h-4 text-[#4654CD]" />
            )}

            {renderVersionSelector(
              'Indicador de Selección',
              'selectionIndicatorVersion',
              versionDescriptions.selectionIndicator,
              <Package className="w-4 h-4 text-[#4654CD]" />
            )}

            {renderVersionSelector(
              'Botón Quitar',
              'removeButtonVersion',
              versionDescriptions.removeButton,
              <Package className="w-4 h-4 text-[#4654CD]" />
            )}

            {renderVersionSelector(
              'Desglose de Precios',
              'priceBreakdownVersion',
              versionDescriptions.priceBreakdown,
              <Package className="w-4 h-4 text-[#4654CD]" />
            )}
          </div>

          {/* Sección Seguros */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-300">
              <Shield className="w-5 h-5 text-[#4654CD]" />
              <h2 className="text-base font-bold text-neutral-800">Seguros</h2>
            </div>

            {renderVersionSelector(
              'Introducción',
              'insuranceIntroVersion',
              versionDescriptions.insuranceIntro,
              <Shield className="w-4 h-4 text-[#4654CD]" />
            )}

            {renderVersionSelector(
              'Icono de Protección',
              'protectionIconVersion',
              versionDescriptions.protectionIcon,
              <Shield className="w-4 h-4 text-[#4654CD]" />
            )}

            {renderVersionSelector(
              'Comparación de Planes',
              'planComparisonVersion',
              versionDescriptions.planComparison,
              <Shield className="w-4 h-4 text-[#4654CD]" />
            )}

            {renderVersionSelector(
              'Badge Recomendado',
              'recommendedBadgeVersion',
              versionDescriptions.recommendedBadge,
              <Shield className="w-4 h-4 text-[#4654CD]" />
            )}

            {renderVersionSelector(
              'Visualización de Cobertura',
              'coverageDisplayVersion',
              versionDescriptions.coverageDisplay,
              <Shield className="w-4 h-4 text-[#4654CD]" />
            )}

            {renderVersionSelector(
              'Modal de Omitir',
              'skipModalVersion',
              versionDescriptions.skipModal,
              <Shield className="w-4 h-4 text-[#4654CD]" />
            )}

            {renderVersionSelector(
              'Botones del Modal',
              'modalButtonsVersion',
              versionDescriptions.modalButtons,
              <Shield className="w-4 h-4 text-[#4654CD]" />
            )}
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

export default UpsellSettingsModal;
