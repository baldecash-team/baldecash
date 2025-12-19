'use client';

/**
 * HeroSettingsModal - Modal de configuracion de versiones
 *
 * Permite seleccionar las versiones de cada componente
 * para pruebas A/B y demos
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { Settings, RotateCcw } from 'lucide-react';
import { HeroConfig, defaultHeroConfig, versionDescriptions } from '../../types/hero';

interface HeroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeroConfig;
  onConfigChange: (config: HeroConfig) => void;
}

interface VersionSelectorProps {
  label: string;
  value: number;
  options: number[];
  descriptions: Record<number, string>;
  onChange: (value: number) => void;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  label,
  value,
  options,
  descriptions,
  onChange,
}) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-neutral-700 mb-2 block">
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-center ${
              value === option
                ? 'bg-[#4654CD] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            V{option}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500">{descriptions[value]}</p>
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
          <span className="text-lg font-semibold text-neutral-800">Configuracion del Hero</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona las versiones de cada componente para crear diferentes
            combinaciones y probar cual funciona mejor.
          </p>

          {/* Navbar Version */}
          <VersionSelector
            label="A.1 - Navbar"
            value={config.navbarVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.navbar}
            onChange={(v) => onConfigChange({ ...config, navbarVersion: v as 1 | 2 | 3 })}
          />

          {/* Brand Identity Version */}
          <VersionSelector
            label="A.2 - Brand Identity / Hero Visual"
            value={config.brandIdentityVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.brandIdentity}
            onChange={(v) => onConfigChange({ ...config, brandIdentityVersion: v as 1 | 2 | 3 })}
          />

          {/* Social Proof Version */}
          <VersionSelector
            label="A.3 - Social Proof"
            value={config.socialProofVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.socialProof}
            onChange={(v) => onConfigChange({ ...config, socialProofVersion: v as 1 | 2 | 3 })}
          />

          {/* CTA Version */}
          <VersionSelector
            label="A.5 - Hero CTA"
            value={config.ctaVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.cta}
            onChange={(v) => onConfigChange({ ...config, ctaVersion: v as 1 | 2 | 3 })}
          />

          {/* Profile Identification Version */}
          <VersionSelector
            label="A.6 - Profile Identification"
            value={config.profileIdentificationVersion}
            options={[1, 2, 3, 4]}
            descriptions={versionDescriptions.profileIdentification}
            onChange={(v) => onConfigChange({ ...config, profileIdentificationVersion: v as 1 | 2 | 3 | 4 })}
          />

          {/* Institutional Banner Version */}
          <VersionSelector
            label="A.7 - Institutional Banner"
            value={config.institutionalBannerVersion}
            options={[1, 2, 3, 4]}
            descriptions={versionDescriptions.institutionalBanner}
            onChange={(v) => onConfigChange({ ...config, institutionalBannerVersion: v as 1 | 2 | 3 | 4 })}
          />

          {/* Footer Version */}
          <VersionSelector
            label="A.8 - Footer"
            value={config.footerVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.footer}
            onChange={(v) => onConfigChange({ ...config, footerVersion: v as 1 | 2 | 3 })}
          />

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-500">
                <strong>Nota:</strong> El componente QuotaCalculator (A.4) es fijo y no tiene
                variantes. Esta integrado en algunas versiones del Brand Identity.
              </p>
            </div>
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

export default HeroSettingsModal;
