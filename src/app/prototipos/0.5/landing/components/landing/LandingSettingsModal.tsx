'use client';

/**
 * LandingSettingsModal - Modal de configuración v0.5
 * Selector de versión de Landing: Original, Countdown, Regalo, Flash Sale
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
import { Settings, RotateCcw, Link2, Check, Layout } from 'lucide-react';

export type LandingVersion = 'original' | 'countdown' | 'gift' | 'flash';

export const LANDING_VERSIONS: { id: LandingVersion; label: string; description: string }[] = [
  { id: 'original', label: 'Original', description: 'Landing estándar con carrusel de productos' },
  { id: 'countdown', label: 'V1 - Countdown', description: 'Promo con tiempo limitado y contador regresivo' },
  { id: 'gift', label: 'V2 - Regalo', description: 'Promo con regalo incluido por la compra' },
  { id: 'flash', label: 'V3 - Flash Sale', description: 'Venta flash con stock limitado' },
];

interface LandingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: LandingVersion;
  onVersionChange: (version: LandingVersion) => void;
}

export const LandingSettingsModal: React.FC<LandingSettingsModalProps> = ({
  isOpen,
  onClose,
  currentVersion,
  onVersionChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();

    // Solo incluir si difiere del default
    if (currentVersion !== 'original') {
      params.set('version', currentVersion);
    }

    const queryString = params.toString();
    const url = `${window.location.origin}${window.location.pathname}${queryString ? `?${queryString}` : ''}`;

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onVersionChange('original');
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
            Configuración del Landing
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona la versión de landing page que deseas visualizar.
          </p>

          {/* Selector de Versión */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Versión del Landing</h3>
            </div>
            <RadioGroup
              value={currentVersion}
              onValueChange={(val) => onVersionChange(val as LandingVersion)}
              classNames={{ wrapper: 'gap-2' }}
            >
              {LANDING_VERSIONS.map((version) => (
                <Radio
                  key={version.id}
                  value={version.id}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        currentVersion === version.id
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm font-medium',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={version.description}
                >
                  {version.label}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Nota informativa */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-400">
              <span className="font-medium">Nota:</span> Cada versión muestra un tipo diferente
              de promoción con el formulario de captura de leads integrado.
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

export default LandingSettingsModal;
