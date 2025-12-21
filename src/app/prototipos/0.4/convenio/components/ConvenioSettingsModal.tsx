'use client';

/**
 * ConvenioSettingsModal - Settings modal for configuring convenio landing versions
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
  Divider,
} from '@nextui-org/react';
import { Settings, RotateCcw, GraduationCap } from 'lucide-react';
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

interface VersionSelectorProps {
  label: string;
  value: ConvenioVersion;
  onChange: (value: ConvenioVersion) => void;
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
            onChange(parseInt(selectedKey as string) as ConvenioVersion);
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
          <span className="text-lg font-semibold text-neutral-800">Configurar Landing Convenio</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona el convenio y las versiones de cada componente para ver diferentes combinaciones de diseño.
          </p>

          {/* Convenio Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Convenio Activo
            </label>
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

          <Divider className="my-4" />

          <p className="text-sm font-medium text-neutral-700 mb-4">Versiones de Componentes</p>

          <VersionSelector
            label="Navbar"
            value={config.navbarVersion}
            onChange={(v) => onConfigChange({ ...config, navbarVersion: v })}
            descriptions={versionDescriptions.navbar}
          />

          <VersionSelector
            label="Hero"
            value={config.heroVersion}
            onChange={(v) => onConfigChange({ ...config, heroVersion: v })}
            descriptions={versionDescriptions.hero}
          />

          <VersionSelector
            label="Beneficios"
            value={config.benefitsVersion}
            onChange={(v) => onConfigChange({ ...config, benefitsVersion: v })}
            descriptions={versionDescriptions.benefits}
          />

          <VersionSelector
            label="Testimonios"
            value={config.testimonialsVersion}
            onChange={(v) => onConfigChange({ ...config, testimonialsVersion: v })}
            descriptions={versionDescriptions.testimonials}
          />

          <VersionSelector
            label="¿Tienes Dudas? (FAQ)"
            value={config.faqVersion}
            onChange={(v) => onConfigChange({ ...config, faqVersion: v })}
            descriptions={versionDescriptions.faq}
          />

          <VersionSelector
            label="CTA Final"
            value={config.ctaVersion}
            onChange={(v) => onConfigChange({ ...config, ctaVersion: v })}
            descriptions={versionDescriptions.cta}
          />

          <div className="mt-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-500">
              <strong>Nota:</strong> Cada combinación puede producir diferentes experiencias de usuario.
              Experimenta con distintas versiones para encontrar la mejor configuración para cada convenio.
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

export default ConvenioSettingsModal;
