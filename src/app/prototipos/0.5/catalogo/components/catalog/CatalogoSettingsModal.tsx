'use client';

/**
 * CatalogoSettingsModal - Modal de configuración simplificado v0.5
 * Solo tiene UNA opción: Selector de Color (V1 Dots / V2 Swatches)
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
import { Settings, RotateCcw, Link2, Check, Palette } from 'lucide-react';
import type { CatalogConfig, ColorSelectorVersion } from '../../types/catalog';
import { defaultCatalogConfig, colorSelectorVersionLabels } from '../../types/catalog';

interface CatalogoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CatalogConfig;
  onConfigChange: (config: CatalogConfig) => void;
}

export const CatalogoSettingsModal: React.FC<CatalogoSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();

    // Solo incluir si difiere del default
    if (config.colorSelectorVersion !== defaultCatalogConfig.colorSelectorVersion) {
      params.set('color', config.colorSelectorVersion.toString());
    }

    const queryString = params.toString();
    const url = `${window.location.origin}${window.location.pathname}${queryString ? `?${queryString}` : ''}`;

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onConfigChange(defaultCatalogConfig);
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
                  Versión {version} - {colorSelectorVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
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
