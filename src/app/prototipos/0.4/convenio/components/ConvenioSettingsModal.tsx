'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { Settings, RotateCcw, GraduationCap, Navigation2, Image, Gift, MessageCircle, HelpCircle, MousePointerClick } from 'lucide-react';
import {
  ConvenioConfig,
  ConvenioVersion,
  ConvenioData,
  defaultConvenioConfig,
  versionDescriptions,
} from '../types/convenio';

interface ConvenioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConvenioConfig;
  onConfigChange: (config: ConvenioConfig) => void;
  convenio: ConvenioData;
  onConvenioChange: (convenio: ConvenioData) => void;
  conveniosList: ConvenioData[];
}

const versionOptions: ConvenioVersion[] = [1, 2, 3, 4, 5, 6];

export const ConvenioSettingsModal: React.FC<ConvenioSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  convenio,
  onConvenioChange,
  conveniosList,
}) => {
  const handleReset = () => {
    onConfigChange(defaultConvenioConfig);
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
            Configuración del Landing Convenio
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Personaliza el diseño del landing seleccionando el convenio y las versiones de cada componente.
          </p>

          {/* Convenio Selector */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Convenio Activo</h3>
            </div>
            <Select
              aria-label="Seleccionar convenio"
              selectedKeys={new Set([convenio.slug])}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                if (selectedKey) {
                  const selected = conveniosList.find((c) => c.slug === selectedKey);
                  if (selected) onConvenioChange(selected);
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
                trigger: 'h-12 bg-white border-2 border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer rounded-lg',
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
              {conveniosList.map((c) => (
                <SelectItem
                  key={c.slug}
                  textValue={`${c.nombreCorto} - ${c.descuentoCuota}% descuento`}
                  classNames={{
                    base: `px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                      text-neutral-700
                      data-[selected=false]:data-[hover=true]:bg-[#4654CD]/10
                      data-[selected=false]:data-[hover=true]:text-[#4654CD]
                      data-[selected=true]:bg-[#4654CD]
                      data-[selected=true]:text-white`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: c.colorPrimario }}
                    />
                    <span>{c.nombreCorto} - {c.descuentoCuota}% descuento</span>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Navbar Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Navigation2 className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Navbar</h3>
            </div>
            <RadioGroup
              value={config.navbarVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, navbarVersion: parseInt(val) as ConvenioVersion })}
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

          {/* Hero Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Hero</h3>
            </div>
            <RadioGroup
              value={config.heroVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, heroVersion: parseInt(val) as ConvenioVersion })}
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
                      ${config.heroVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.hero[version]}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Benefits Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Beneficios</h3>
            </div>
            <RadioGroup
              value={config.benefitsVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, benefitsVersion: parseInt(val) as ConvenioVersion })}
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
                      ${config.benefitsVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.benefits[version]}
                >
                  Versión {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Testimonials Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Testimonios</h3>
            </div>
            <RadioGroup
              value={config.testimonialsVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, testimonialsVersion: parseInt(val) as ConvenioVersion })}
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
                      ${config.testimonialsVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={versionDescriptions.testimonials[version]}
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
              onValueChange={(val) => onConfigChange({ ...config, faqVersion: parseInt(val) as ConvenioVersion })}
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

          {/* CTA Version */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <MousePointerClick className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">CTA Final</h3>
            </div>
            <RadioGroup
              value={config.ctaVersion.toString()}
              onValueChange={(val) => onConfigChange({ ...config, ctaVersion: parseInt(val) as ConvenioVersion })}
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

export default ConvenioSettingsModal;
