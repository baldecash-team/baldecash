'use client';

/**
 * LandingSettingsModal - Modal de configuración v0.5
 * Dos selectores:
 * 1. Layout (L1-L6): Estructura visual del banner
 * 2. Mensaje (V1-V3): Contenido/gancho del banner
 */

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
import {
  Settings,
  RotateCcw,
  Link2,
  Check,
  Sparkles,
  CreditCard,
  Gift,
  LayoutGrid,
  SplitSquareHorizontal,
  Square,
  Layers,
  Minus,
  Play,
} from 'lucide-react';
import {
  BannerVersion,
  LayoutVersion,
  LandingConfig,
  defaultLandingConfig,
  bannerVersionLabels,
  layoutVersionLabels,
} from '../../types/landing';

interface LandingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LandingConfig;
  onConfigChange: (config: LandingConfig) => void;
}

// Icons for banner versions (content)
const bannerVersionIcons: Record<BannerVersion, React.ReactNode> = {
  1: <Sparkles className="w-4 h-4" />,
  2: <CreditCard className="w-4 h-4" />,
  3: <Gift className="w-4 h-4" />,
};

// Icons for layout versions
const layoutVersionIcons: Record<LayoutVersion, React.ReactNode> = {
  1: <SplitSquareHorizontal className="w-4 h-4" />,
  2: <SplitSquareHorizontal className="w-4 h-4 rotate-180" />,
  3: <Square className="w-4 h-4" />,
  4: <Layers className="w-4 h-4" />,
  5: <Minus className="w-4 h-4" />,
  6: <Play className="w-4 h-4" />,
};

export const LandingSettingsModal: React.FC<LandingSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();

    if (config.layoutVersion !== defaultLandingConfig.layoutVersion) {
      params.set('layout', config.layoutVersion.toString());
    }
    if (config.bannerVersion !== defaultLandingConfig.bannerVersion) {
      params.set('banner', config.bannerVersion.toString());
    }

    const queryString = params.toString();
    const pathname = window.location.pathname.replace(/\/$/, '');
    const url = `${window.location.origin}${pathname}${queryString ? `?${queryString}` : ''}`;

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onConfigChange(defaultLandingConfig);
  };

  // Calculate total combinations
  const totalCombinations = 6 * 3; // 6 layouts × 3 messages

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="outside"
      backdrop="blur"
      placement="center"
      classNames={{
        base: 'bg-white my-8 rounded-[14px]',
        wrapper: 'items-center justify-center py-8 min-h-full',
        backdrop: 'bg-black/50',
        header: 'border-b border-neutral-200 bg-white py-4 pr-12 rounded-t-[14px]',
        body: 'bg-white max-h-[60vh] overflow-y-auto scrollbar-hide',
        footer: 'border-t border-neutral-200 bg-white rounded-b-[14px]',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-[#4654CD]" />
          </div>
          <div>
            <span className="text-lg font-semibold text-neutral-800">
              Configuración del Landing
            </span>
            <span className="ml-2 text-xs text-neutral-400 font-normal">
              {totalCombinations} combinaciones
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-6 pb-4 border-b border-neutral-200">
            Selecciona el layout y mensaje del banner de captación.
          </p>

          {/* Layout Selector */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Layout</h3>
              <span className="text-xs text-neutral-400">(estructura visual)</span>
            </div>
            <RadioGroup
              value={config.layoutVersion.toString()}
              onValueChange={(val) =>
                onConfigChange({
                  ...config,
                  layoutVersion: parseInt(val) as LayoutVersion,
                })
              }
              classNames={{ wrapper: 'gap-2' }}
            >
              {([1, 2, 3, 4, 5, 6] as LayoutVersion[]).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        config.layoutVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm font-medium',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={layoutVersionLabels[version].description}
                >
                  <div className="flex items-center gap-2">
                    <span className={config.layoutVersion === version ? 'text-[#4654CD]' : 'text-neutral-500'}>
                      {layoutVersionIcons[version]}
                    </span>
                    <span>L{version} - {layoutVersionLabels[version].name}</span>
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Banner Content Selector */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Mensaje</h3>
              <span className="text-xs text-neutral-400">(contenido/gancho)</span>
            </div>
            <RadioGroup
              value={config.bannerVersion.toString()}
              onValueChange={(val) =>
                onConfigChange({
                  ...config,
                  bannerVersion: parseInt(val) as BannerVersion,
                })
              }
              classNames={{ wrapper: 'gap-2' }}
            >
              {([1, 2, 3] as BannerVersion[]).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        config.bannerVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm font-medium',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={bannerVersionLabels[version].description}
                >
                  <div className="flex items-center gap-2">
                    <span className={config.bannerVersion === version ? 'text-[#4654CD]' : 'text-neutral-500'}>
                      {bannerVersionIcons[version]}
                    </span>
                    <span>V{version} - {bannerVersionLabels[version].name}</span>
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Current config summary */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-400 mb-2">
              <span className="font-medium">Configuración actual:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-[#4654CD]/10 text-[#4654CD] text-xs rounded-md font-medium">
                L{config.layoutVersion}: {layoutVersionLabels[config.layoutVersion].name}
              </span>
              <span className="px-2 py-1 bg-[#03DBD0]/20 text-neutral-700 text-xs rounded-md font-medium">
                V{config.bannerVersion}: {bannerVersionLabels[config.bannerVersion].name}
              </span>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="bg-white justify-between">
          <Button
            variant="flat"
            startContent={
              copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Link2 className="w-4 h-4" />
              )
            }
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

export default LandingSettingsModal;
