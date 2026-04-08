'use client';

/**
 * MacbookNeoSettingsModal - Configuration modal for the MacBook Neo landing
 *
 * Two selectors:
 * 1. Default color: Citrus | Rubor | Indigo | Plata
 * 2. Scroll speed: Normal (400vh) | Lento (500vh)
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
  Palette,
  MousePointerClick,
} from 'lucide-react';
import {
  MacbookNeoConfig,
  MacbookNeoColor,
  ScrollSpeedVersion,
  defaultMacbookNeoConfig,
  colorLabels,
  scrollSpeedLabels,
} from '../../types/macbook-neo';

interface MacbookNeoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MacbookNeoConfig;
  onConfigChange: (config: MacbookNeoConfig) => void;
}

const colorValues: MacbookNeoColor[] = ['citrus', 'blush', 'indigo', 'silver'];
const speedValues: ScrollSpeedVersion[] = [1, 2];

export const MacbookNeoSettingsModal: React.FC<MacbookNeoSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();

    if (config.selectedColor !== defaultMacbookNeoConfig.selectedColor) {
      params.set('color', config.selectedColor);
    }
    if (config.scrollSpeed !== defaultMacbookNeoConfig.scrollSpeed) {
      params.set('speed', config.scrollSpeed.toString());
    }

    const queryString = params.toString();
    const pathname = window.location.pathname.replace(/\/$/, '');
    const url = `${window.location.origin}${pathname}${queryString ? `?${queryString}` : ''}`;

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onConfigChange(defaultMacbookNeoConfig);
  };

  const totalCombinations = colorValues.length * speedValues.length; // 4 × 2 = 8

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
              Configuración MacBook Neo
            </span>
            <span className="ml-2 text-xs text-neutral-400 font-normal">
              {totalCombinations} combinaciones
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-6 pb-4 border-b border-neutral-200">
            Personaliza el color por defecto y la velocidad de scroll de la landing.
          </p>

          {/* Color Selector */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Color por defecto</h3>
              <span className="text-xs text-neutral-400">(selector de colores)</span>
            </div>
            <RadioGroup
              value={config.selectedColor}
              onValueChange={(val) =>
                onConfigChange({
                  ...config,
                  selectedColor: val as MacbookNeoColor,
                })
              }
              classNames={{ wrapper: 'gap-2' }}
            >
              {colorValues.map((color) => (
                <Radio
                  key={color}
                  value={color}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        config.selectedColor === color
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm font-medium',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={colorLabels[color].description}
                >
                  <span>{colorLabels[color].name}</span>
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Scroll Speed Selector */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MousePointerClick className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Velocidad de scroll</h3>
              <span className="text-xs text-neutral-400">(storytelling)</span>
            </div>
            <RadioGroup
              value={config.scrollSpeed.toString()}
              onValueChange={(val) =>
                onConfigChange({
                  ...config,
                  scrollSpeed: parseInt(val) as ScrollSpeedVersion,
                })
              }
              classNames={{ wrapper: 'gap-2' }}
            >
              {speedValues.map((speed) => (
                <Radio
                  key={speed}
                  value={speed.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        config.scrollSpeed === speed
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm font-medium',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={scrollSpeedLabels[speed].description}
                >
                  <span>{scrollSpeedLabels[speed].name}</span>
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
                Color: {colorLabels[config.selectedColor].name}
              </span>
              <span className="px-2 py-1 bg-[#03DBD0]/20 text-neutral-700 text-xs rounded-md font-medium">
                Scroll: {scrollSpeedLabels[config.scrollSpeed].name}
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
