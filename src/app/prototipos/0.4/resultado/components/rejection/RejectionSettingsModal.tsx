'use client';

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
import { Settings, RotateCcw, Palette, Image, Bookmark, MessageSquare, FileText, LayoutGrid, ShoppingBag, Calculator, Mail, Clock, Headphones, Quote } from 'lucide-react';
import { RejectionConfig, defaultRejectionConfig, versionLabels } from '../../types/rejection';

interface RejectionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RejectionConfig;
  onConfigChange: (config: RejectionConfig) => void;
}

type ConfigKey = keyof RejectionConfig;
type VersionLabelsKey = keyof typeof versionLabels;

interface VersionSelectorProps {
  label: string;
  icon: React.ReactNode;
  configKey: ConfigKey;
  labelsKey: VersionLabelsKey;
  config: RejectionConfig;
  onConfigChange: (config: RejectionConfig) => void;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  label,
  icon,
  configKey,
  labelsKey,
  config,
  onConfigChange,
}) => {
  const currentValue = config[configKey];
  const labels = versionLabels[labelsKey];

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium text-neutral-700">{label}</span>
      </div>
      <Select
        selectedKeys={new Set([currentValue.toString()])}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];
          if (selectedKey) {
            onConfigChange({
              ...config,
              [configKey]: parseInt(selectedKey as string) as 1 | 2 | 3 | 4 | 5 | 6,
            });
          }
        }}
        classNames={{
          trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
          value: 'text-sm text-neutral-700',
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
        renderValue={(items) => {
          return items.map((item) => (
            <span key={item.key} className="text-sm text-neutral-700">
              {item.textValue}
            </span>
          ));
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((v) => {
          const versionLabel = labels[v as keyof typeof labels];
          return (
            <SelectItem
              key={v.toString()}
              textValue={`V${v} - ${versionLabel?.name || ''}`}
              classNames={{
                base: `px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                  text-neutral-700
                  data-[selected=false]:data-[hover=true]:bg-[#4654CD]/10
                  data-[selected=false]:data-[hover=true]:text-[#4654CD]
                  data-[selected=true]:bg-[#4654CD]
                  data-[selected=true]:text-white`,
              }}
            >
              <div>
                <p className="font-medium">V{v} - {versionLabel?.name}</p>
                <p className="text-xs opacity-70">{versionLabel?.description}</p>
              </div>
            </SelectItem>
          );
        })}
      </Select>
    </div>
  );
};

export const RejectionSettingsModal: React.FC<RejectionSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const handleReset = () => {
    onConfigChange(defaultRejectionConfig);
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
          <span className="text-lg font-semibold text-neutral-800">Configurar Pantalla de Rechazo</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Configura cada elemento de la pantalla de rechazo. Hay 13 opciones configurables con 6 versiones cada una.
          </p>

          {/* Tono Visual */}
          <div className="border-b border-neutral-100 pb-4 mb-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Tono Visual</h3>

            <VersionSelector
              label="Colores"
              icon={<Palette className="w-4 h-4 text-[#4654CD]" />}
              configKey="visualVersion"
              labelsKey="visual"
              config={config}
              onConfigChange={onConfigChange}
            />

            <VersionSelector
              label="Ilustración"
              icon={<Image className="w-4 h-4 text-[#4654CD]" />}
              configKey="illustrationVersion"
              labelsKey="illustration"
              config={config}
              onConfigChange={onConfigChange}
            />

            <VersionSelector
              label="Branding"
              icon={<Bookmark className="w-4 h-4 text-[#4654CD]" />}
              configKey="brandingVersion"
              labelsKey="branding"
              config={config}
              onConfigChange={onConfigChange}
            />
          </div>

          {/* Mensaje */}
          <div className="border-b border-neutral-100 pb-4 mb-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Mensaje Principal</h3>

            <VersionSelector
              label="Personalización"
              icon={<MessageSquare className="w-4 h-4 text-[#4654CD]" />}
              configKey="messageVersion"
              labelsKey="message"
              config={config}
              onConfigChange={onConfigChange}
            />
          </div>

          {/* Explicación */}
          <div className="border-b border-neutral-100 pb-4 mb-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Explicación</h3>

            <VersionSelector
              label="Nivel de detalle"
              icon={<FileText className="w-4 h-4 text-[#4654CD]" />}
              configKey="explanationDetailVersion"
              labelsKey="explanationDetail"
              config={config}
              onConfigChange={onConfigChange}
            />

            <VersionSelector
              label="Framing"
              icon={<FileText className="w-4 h-4 text-[#4654CD]" />}
              configKey="explanationFramingVersion"
              labelsKey="explanationFraming"
              config={config}
              onConfigChange={onConfigChange}
            />
          </div>

          {/* Alternativas */}
          <div className="border-b border-neutral-100 pb-4 mb-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Alternativas</h3>

            <VersionSelector
              label="Layout"
              icon={<LayoutGrid className="w-4 h-4 text-[#4654CD]" />}
              configKey="alternativesLayoutVersion"
              labelsKey="alternativesLayout"
              config={config}
              onConfigChange={onConfigChange}
            />

            <VersionSelector
              label="Productos alternativos"
              icon={<ShoppingBag className="w-4 h-4 text-[#4654CD]" />}
              configKey="productAlternativesVersion"
              labelsKey="productAlternatives"
              config={config}
              onConfigChange={onConfigChange}
            />

            <VersionSelector
              label="Calculadora"
              icon={<Calculator className="w-4 h-4 text-[#4654CD]" />}
              configKey="calculatorVersion"
              labelsKey="calculator"
              config={config}
              onConfigChange={onConfigChange}
            />
          </div>

          {/* Retención */}
          <div className="border-b border-neutral-100 pb-4 mb-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Retención</h3>

            <VersionSelector
              label="Captura de email"
              icon={<Mail className="w-4 h-4 text-[#4654CD]" />}
              configKey="emailCaptureVersion"
              labelsKey="emailCapture"
              config={config}
              onConfigChange={onConfigChange}
            />

            <VersionSelector
              label="Tiempo de reintento"
              icon={<Clock className="w-4 h-4 text-[#4654CD]" />}
              configKey="retryTimelineVersion"
              labelsKey="retryTimeline"
              config={config}
              onConfigChange={onConfigChange}
            />
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Soporte</h3>

            <VersionSelector
              label="CTA de asesor"
              icon={<Headphones className="w-4 h-4 text-[#4654CD]" />}
              configKey="advisorCTAVersion"
              labelsKey="advisorCTA"
              config={config}
              onConfigChange={onConfigChange}
            />

            <VersionSelector
              label="Mensaje del asesor"
              icon={<Quote className="w-4 h-4 text-[#4654CD]" />}
              configKey="advisorMessageVersion"
              labelsKey="advisorMessage"
              config={config}
              onConfigChange={onConfigChange}
            />
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
