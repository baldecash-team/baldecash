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
import { Settings, RotateCcw, Navigation2, Image, Type, Users, ListOrdered, MousePointerClick, HelpCircle, PanelBottom, Link2, Check } from 'lucide-react';
import { HeroConfig, HeroVersion, UnderlineStyle, defaultHeroConfig, versionDescriptions } from '../../types/hero';

interface HeroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeroConfig;
  onConfigChange: (config: HeroConfig) => void;
}

const versionOptions: HeroVersion[] = [1, 2, 3, 4, 5, 6];

export const HeroSettingsModal: React.FC<HeroSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    onConfigChange(defaultHeroConfig);
  };

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();
    params.set('navbar', config.navbarVersion.toString());
    params.set('heroBanner', config.heroBannerVersion.toString());
    params.set('underline', config.underlineStyle.toString());
    params.set('socialProof', config.socialProofVersion.toString());
    params.set('howItWorks', config.howItWorksVersion.toString());
    params.set('cta', config.ctaVersion.toString());
    params.set('faq', config.faqVersion.toString());
    params.set('footer', config.footerVersion.toString());
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            Configuración del Hero
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Personaliza el diseño del hero seleccionando diferentes versiones de cada componente.
          </p>

          {/* Navbar Version */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Navigation2 className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Navbar</h3>
            </div>
            <RadioGroup
              value={config.navbarVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, navbarVersion: parseInt(val) as HeroVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.navbarVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.navbar[version]}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Hero Banner Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Hero Banner</h3>
            </div>
            <RadioGroup
              value={config.heroBannerVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, heroBannerVersion: parseInt(val) as HeroVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.heroBannerVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.heroBanner[version]}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Underline Style */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Estilo de Subrayado</h3>
            </div>
            <RadioGroup
              value={config.underlineStyle.toString()}
              onValueChange={(val) => onConfigChange({ ...config, underlineStyle: parseInt(val) as UnderlineStyle })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.underlineStyle === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.underline[version]}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Social Proof Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Social Proof</h3>
            </div>
            <RadioGroup
              value={config.socialProofVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, socialProofVersion: parseInt(val) as HeroVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.socialProofVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.socialProof[version]}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* How It Works Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <ListOrdered className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">¿Cómo Funciona?</h3>
            </div>
            <RadioGroup
              value={config.howItWorksVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, howItWorksVersion: parseInt(val) as HeroVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.howItWorksVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.howItWorks[version]}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* CTA Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <MousePointerClick className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">CTA</h3>
            </div>
            <RadioGroup
              value={config.ctaVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, ctaVersion: parseInt(val) as HeroVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.ctaVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.cta[version]}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* FAQ Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">¿Tienes Dudas? (FAQ)</h3>
            </div>
            <RadioGroup
              value={config.faqVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, faqVersion: parseInt(val) as HeroVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.faqVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.faq[version]}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Footer Version */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <PanelBottom className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Footer</h3>
            </div>
            <RadioGroup
              value={config.footerVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, footerVersion: parseInt(val) as HeroVersion })}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {versionOptions.map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.footerVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.footer[version]}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
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

export default HeroSettingsModal;
