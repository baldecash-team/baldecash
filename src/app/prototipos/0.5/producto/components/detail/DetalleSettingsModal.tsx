'use client';

/**
 * DetalleSettingsModal - Modal de configuración para Detalle v0.5
 * Permite seleccionar tipo de dispositivo: Laptop, Tablet, Celular
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
import { Settings, RotateCcw, Link2, Check, Laptop, Tablet, Smartphone } from 'lucide-react';
import {
  DetalleConfig,
  DeviceType,
  defaultDetalleConfig,
  deviceTypeLabels,
} from '../../types/detail';

interface DetalleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DetalleConfig;
  onConfigChange: (config: DetalleConfig) => void;
}

const deviceTypeIcons: Record<DeviceType, React.ReactNode> = {
  laptop: <Laptop className="w-5 h-5" />,
  tablet: <Tablet className="w-5 h-5" />,
  celular: <Smartphone className="w-5 h-5" />,
};

export const DetalleSettingsModal: React.FC<DetalleSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();

    // Solo incluir si difiere del default
    if (config.deviceType !== defaultDetalleConfig.deviceType) {
      params.set('device', config.deviceType);
    }

    const queryString = params.toString();
    const pathname = window.location.pathname.replace(/\/$/, ''); // Remove trailing slash
    const url = `${window.location.origin}${pathname}${queryString ? `?${queryString}` : ''}`;

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onConfigChange(defaultDetalleConfig);
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
            Configuración del Detalle
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona el tipo de dispositivo para ver su detalle de producto.
          </p>

          {/* Selector de Tipo de Dispositivo */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Laptop className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Tipo de Equipo</h3>
            </div>
            <RadioGroup
              value={config.deviceType}
              onValueChange={(val) =>
                onConfigChange({
                  ...config,
                  deviceType: val as DeviceType,
                })
              }
              classNames={{ wrapper: 'gap-2' }}
            >
              {(['laptop', 'tablet', 'celular'] as DeviceType[]).map((deviceType) => (
                <Radio
                  key={deviceType}
                  value={deviceType}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        config.deviceType === deviceType
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm font-medium',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={deviceTypeLabels[deviceType].description}
                >
                  <div className="flex items-center gap-2">
                    <span className={config.deviceType === deviceType ? 'text-[#4654CD]' : 'text-neutral-500'}>
                      {deviceTypeIcons[deviceType]}
                    </span>
                    <span>{deviceTypeLabels[deviceType].name}</span>
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Nota informativa */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-400">
              <span className="font-medium">Nota:</span> Los demás componentes del detalle
              (layout, pricing, similar products) están fijos en esta versión. Solo el tipo
              de dispositivo y sus características cambian.
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

export default DetalleSettingsModal;
