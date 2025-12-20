'use client';

/**
 * HeroSettingsModal - Settings modal for configuring hero versions
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
import { Settings, RotateCcw } from 'lucide-react';
import { HeroConfig, HeroVersion, UnderlineStyle, defaultHeroConfig, versionDescriptions } from '../../types/hero';

interface HeroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeroConfig;
  onConfigChange: (config: HeroConfig) => void;
}

const versionOptions: HeroVersion[] = [1, 2, 3, 4, 5, 6];

interface VersionSelectorProps {
  label: string;
  value: HeroVersion;
  onChange: (value: HeroVersion) => void;
  descriptions: Record<number, string>;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  label,
  value,
  onChange,
  descriptions,
}) => {
  // Create items array for renderValue lookup
  const items = versionOptions.map((v) => ({
    key: v.toString(),
    label: `V${v}: ${descriptions[v]}`,
  }));

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      <Select
        aria-label={label}
        selectedKeys={new Set([value.toString()])}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];
          if (selectedKey) {
            onChange(parseInt(selectedKey as string) as HeroVersion);
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

export const HeroSettingsModal: React.FC<HeroSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const handleReset = () => {
    onConfigChange(defaultHeroConfig);
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
          <span className="text-lg font-semibold text-neutral-800">Configurar Hero Section</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona la versión de cada componente para ver diferentes combinaciones de diseño.
          </p>

          <VersionSelector
            label="Navbar"
            value={config.navbarVersion}
            onChange={(v) => onConfigChange({ ...config, navbarVersion: v })}
            descriptions={versionDescriptions.navbar}
          />

          <VersionSelector
            label="Hero Banner"
            value={config.heroBannerVersion}
            onChange={(v) => onConfigChange({ ...config, heroBannerVersion: v })}
            descriptions={versionDescriptions.heroBanner}
          />

          <VersionSelector
            label="Estilo de Subrayado"
            value={config.underlineStyle}
            onChange={(v) => onConfigChange({ ...config, underlineStyle: v as UnderlineStyle })}
            descriptions={versionDescriptions.underline}
          />

          <VersionSelector
            label="Social Proof"
            value={config.socialProofVersion}
            onChange={(v) => onConfigChange({ ...config, socialProofVersion: v })}
            descriptions={versionDescriptions.socialProof}
          />

          <VersionSelector
            label="¿Cómo Funciona?"
            value={config.howItWorksVersion}
            onChange={(v) => onConfigChange({ ...config, howItWorksVersion: v })}
            descriptions={versionDescriptions.howItWorks}
          />

          <VersionSelector
            label="CTA"
            value={config.ctaVersion}
            onChange={(v) => onConfigChange({ ...config, ctaVersion: v })}
            descriptions={versionDescriptions.cta}
          />

          <VersionSelector
            label="¿Tienes Dudas? (FAQ)"
            value={config.faqVersion}
            onChange={(v) => onConfigChange({ ...config, faqVersion: v })}
            descriptions={versionDescriptions.faq}
          />

          <VersionSelector
            label="Footer"
            value={config.footerVersion}
            onChange={(v) => onConfigChange({ ...config, footerVersion: v })}
            descriptions={versionDescriptions.footer}
          />

          <div className="mt-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-500">
              <strong>Nota:</strong> Cada combinación puede producir diferentes experiencias de usuario.
              Experimenta con distintas versiones para encontrar la mejor configuración.
            </p>
          </div>
        </ModalBody>

        <ModalFooter className="bg-white">
          <Button
            variant="light"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={handleReset}
            className="cursor-pointer"
          >
            Restablecer
          </Button>
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

export default HeroSettingsModal;
