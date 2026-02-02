'use client';

/**
 * CatalogoSettingsModal - Modal de configuración v0.6
 * Opciones:
 * - Selector de Color (V1 Dots / V2 Swatches)
 * - Tour de Ayuda (cantidad de pasos, estilo de highlight)
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
import { Settings, RotateCcw, Link2, Check, Palette, GraduationCap } from 'lucide-react';
import type {
  CatalogConfig,
  ColorSelectorVersion,
  OnboardingConfig,
  OnboardingStepCount,
  OnboardingHighlightStyle,
} from '../../types/catalog';
import {
  defaultCatalogConfig,
  colorSelectorVersionLabels,
  defaultOnboardingConfig,
  onboardingStepCountLabels,
  onboardingHighlightLabels,
} from '../../types/catalog';

interface CatalogoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CatalogConfig;
  onConfigChange: (config: CatalogConfig) => void;
  // Onboarding props
  onboardingConfig: OnboardingConfig;
  onOnboardingConfigChange: (config: OnboardingConfig) => void;
}

export const CatalogoSettingsModal: React.FC<CatalogoSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  onboardingConfig,
  onOnboardingConfigChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();

    // Solo incluir si difiere del default
    if (config.colorSelectorVersion !== defaultCatalogConfig.colorSelectorVersion) {
      params.set('color', config.colorSelectorVersion.toString());
    }

    // Onboarding params
    if (onboardingConfig.stepCount !== defaultOnboardingConfig.stepCount) {
      params.set('tourSteps', onboardingConfig.stepCount);
    }
    if (onboardingConfig.highlightStyle !== defaultOnboardingConfig.highlightStyle) {
      params.set('tourStyle', onboardingConfig.highlightStyle);
    }

    const queryString = params.toString();
    const pathname = window.location.pathname.replace(/\/$/, ''); // Remove trailing slash
    const url = `${window.location.origin}${pathname}${queryString ? `?${queryString}` : ''}`;

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onConfigChange(defaultCatalogConfig);
    onOnboardingConfigChange(defaultOnboardingConfig);
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
        base: 'bg-white my-8 rounded-[14px]',
        wrapper: 'items-center justify-center py-8 min-h-full z-[100]',
        backdrop: 'bg-black/50 z-[99]',
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
          <span className="text-lg font-semibold text-neutral-800">
            Configuración del Catálogo
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona cómo mostrar las opciones de color en las cards de producto.
          </p>

          {/* Selector de Color - única opción iterable */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Selector de Color</h3>
            </div>
            <RadioGroup
              value={config.colorSelectorVersion.toString()}
              onValueChange={(val) =>
                onConfigChange({
                  ...config,
                  colorSelectorVersion: parseInt(val) as ColorSelectorVersion,
                })
              }
              classNames={{ wrapper: 'gap-2' }}
            >
              {([1, 2] as ColorSelectorVersion[]).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        config.colorSelectorVersion === version
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm font-medium',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={colorSelectorVersionLabels[version].description}
                >
                  V{version} - {colorSelectorVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Separador */}
          <div className="my-6 border-t border-neutral-200" />

          {/* Tour de Ayuda */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Tour de Ayuda</h3>
            </div>

            {/* Cantidad de pasos */}
            <div className="mb-5">
              <p className="text-sm text-neutral-600 mb-3">Cantidad de pasos:</p>
              <RadioGroup
                value={onboardingConfig.stepCount}
                onValueChange={(val) =>
                  onOnboardingConfigChange({
                    ...onboardingConfig,
                    stepCount: val as OnboardingStepCount,
                  })
                }
                classNames={{ wrapper: 'gap-2' }}
              >
                {(['minimal', 'complete'] as OnboardingStepCount[]).map((stepCount) => (
                  <Radio
                    key={stepCount}
                    value={stepCount}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${
                          onboardingConfig.stepCount === stepCount
                            ? 'border-[#4654CD] bg-[#4654CD]/5'
                            : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm font-medium',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={onboardingStepCountLabels[stepCount].description}
                  >
                    {onboardingStepCountLabels[stepCount].name}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Estilo de highlight */}
            <div className="mb-5">
              <p className="text-sm text-neutral-600 mb-3">Estilo de highlight:</p>
              <RadioGroup
                value={onboardingConfig.highlightStyle}
                onValueChange={(val) =>
                  onOnboardingConfigChange({
                    ...onboardingConfig,
                    highlightStyle: val as OnboardingHighlightStyle,
                  })
                }
                classNames={{ wrapper: 'gap-2' }}
              >
                {(['spotlight', 'pulse'] as OnboardingHighlightStyle[]).map((style) => (
                  <Radio
                    key={style}
                    value={style}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${
                          onboardingConfig.highlightStyle === style
                            ? 'border-[#4654CD] bg-[#4654CD]/5'
                            : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm font-medium',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={onboardingHighlightLabels[style].description}
                  >
                    {onboardingHighlightLabels[style].name}
                  </Radio>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Nota informativa sobre configuración fija */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-400">
              <span className="font-medium">Nota:</span> Los demás componentes del catálogo
              (layout, cards, filtros) están fijos en esta versión según la presentación v0.4.
            </p>
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

export default CatalogoSettingsModal;
