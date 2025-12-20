'use client';

/**
 * DetailSettingsModal - Settings modal for configuring product detail versions
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { Settings, RotateCcw, Link2, Check } from 'lucide-react';
import {
  ProductDetailConfig,
  DetailVersion,
  defaultDetailConfig,
  versionDescriptions,
} from '../../types/detail';
import { useState } from 'react';

interface DetailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProductDetailConfig;
  onConfigChange: (config: ProductDetailConfig) => void;
}

const versionOptions: DetailVersion[] = [1, 2, 3, 4, 5, 6];

interface VersionSelectorProps {
  label: string;
  value: DetailVersion;
  onChange: (value: DetailVersion) => void;
  descriptions: Record<number, string>;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  label,
  value,
  onChange,
  descriptions,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      <Select
        aria-label={label}
        selectedKeys={new Set([value.toString()])}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];
          if (selectedKey) {
            onChange(parseInt(selectedKey as string) as DetailVersion);
          }
        }}
        renderValue={(items) => {
          return items.map((item) => (
            <span key={item.key} className="text-sm text-neutral-700">
              {item.textValue}
            </span>
          ));
        }}
        classNames={{
          base: 'w-full',
          trigger: 'h-12 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
          value: 'text-sm text-neutral-700',
          innerWrapper: 'pr-8',
          selectorIcon: 'right-3',
          popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
          listbox: 'p-1 bg-white',
          listboxWrapper: 'max-h-[300px] bg-white',
        }}
        popoverProps={{
          classNames: {
            base: 'bg-white',
            content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
          },
        }}
      >
        {versionOptions.map((v) => (
          <SelectItem
            key={v.toString()}
            textValue={`V${v}: ${descriptions[v]}`}
            classNames={{
              base: `px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                text-neutral-700
                data-[selected=false]:data-[hover=true]:bg-[#4654CD]/10
                data-[selected=false]:data-[hover=true]:text-[#4654CD]
                data-[selected=true]:bg-[#4654CD]
                data-[selected=true]:text-white`,
            }}
          >
            V{v}: {descriptions[v]}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

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
          <span className="text-lg font-semibold text-neutral-800">Configurar Detalle de Producto</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona la versión de cada componente para ver diferentes combinaciones de diseño en la página de detalle.
          </p>

          <VersionSelector
            label="Info Header"
            value={config.infoHeaderVersion}
            onChange={(v) => onConfigChange({ ...config, infoHeaderVersion: v })}
            descriptions={versionDescriptions.infoHeader}
          />

          <VersionSelector
            label="Galería de Imágenes"
            value={config.galleryVersion}
            onChange={(v) => onConfigChange({ ...config, galleryVersion: v })}
            descriptions={versionDescriptions.gallery}
          />

          <VersionSelector
            label="Tabs / Layout"
            value={config.tabsVersion}
            onChange={(v) => onConfigChange({ ...config, tabsVersion: v })}
            descriptions={versionDescriptions.tabs}
          />

          <VersionSelector
            label="Especificaciones"
            value={config.specsVersion}
            onChange={(v) => onConfigChange({ ...config, specsVersion: v })}
            descriptions={versionDescriptions.specs}
          />

          <VersionSelector
            label="Calculadora de Cuotas"
            value={config.pricingVersion}
            onChange={(v) => onConfigChange({ ...config, pricingVersion: v })}
            descriptions={versionDescriptions.pricing}
          />

          <VersionSelector
            label="Productos Similares"
            value={config.similarProductsVersion}
            onChange={(v) => onConfigChange({ ...config, similarProductsVersion: v })}
            descriptions={versionDescriptions.similarProducts}
          />

          <VersionSelector
            label="Limitaciones (Honestidad)"
            value={config.limitationsVersion}
            onChange={(v) => onConfigChange({ ...config, limitationsVersion: v })}
            descriptions={versionDescriptions.limitations}
          />

          <VersionSelector
            label="Certificaciones"
            value={config.certificationsVersion}
            onChange={(v) => onConfigChange({ ...config, certificationsVersion: v })}
            descriptions={versionDescriptions.certifications}
          />

          <div className="mt-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-500">
              <strong>Nota:</strong> V1 de cada componente es la versión preferida según feedback de v0.3.
              Experimenta con distintas versiones para encontrar la mejor configuración.
            </p>
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
            className="bg-[#4654CD] text-white cursor-pointer hover:bg-[#3a47b3] transition-colors"
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
