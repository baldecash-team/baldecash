'use client';

/**
 * DetalleSettingsModal - Modal de Configuracion de Detalle
 *
 * Permite seleccionar las versiones de cada componente:
 * - Galeria (V1, V2, V3)
 * - Tabs (V1, V2, V3)
 * - Specs Display (V1, V2, V3)
 * - Tooltips (V1, V2, V3)
 * - Limitaciones (V1, V2, V3)
 * - Productos similares (V1, V2, V3)
 * - Certificaciones (V1, V2, V3)
 */

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
  Chip,
} from '@nextui-org/react';
import { Settings, Image, Layers, List, HelpCircle, AlertCircle, Scale, Shield, RotateCcw } from 'lucide-react';
import { DetailConfig, defaultDetailConfig, versionDescriptions } from '../types/detail';

interface DetalleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DetailConfig;
  onConfigChange: (config: DetailConfig) => void;
}

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  value: 1 | 2 | 3;
  onChange: (value: 1 | 2 | 3) => void;
  descriptions: Record<number, string>;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  icon,
  value,
  onChange,
  descriptions,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium text-neutral-800">{title}</span>
      </div>

      <RadioGroup
        value={value.toString()}
        onValueChange={(v) => onChange(parseInt(v) as 1 | 2 | 3)}
        classNames={{
          wrapper: 'gap-2',
        }}
      >
        {[1, 2, 3].map((v) => (
          <Radio
            key={v}
            value={v.toString()}
            classNames={{
              base: `flex-row-reverse justify-between w-full max-w-full p-3 rounded-lg border cursor-pointer transition-colors
                ${value === v
                  ? 'border-[#4654CD] bg-[#4654CD]/5'
                  : 'border-neutral-200 hover:border-neutral-300'
                }`,
              label: 'text-sm text-neutral-700',
              wrapper: 'group-data-[selected=true]:border-[#4654CD] group-data-[selected=true]:bg-[#4654CD]',
            }}
          >
            <div className="flex items-center gap-2">
              <Chip
                size="sm"
                radius="sm"
                classNames={{
                  base: `h-5 px-1.5 ${value === v ? 'bg-[#4654CD]' : 'bg-neutral-200'}`,
                  content: `text-xs font-medium px-0 ${value === v ? 'text-white' : 'text-neutral-600'}`,
                }}
              >
                V{v}
              </Chip>
              <span className={value === v ? 'text-[#4654CD]' : 'text-neutral-600'}>
                {descriptions[v]}
              </span>
            </div>
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
};

export const DetalleSettingsModal: React.FC<DetalleSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const updateConfig = (key: keyof DetailConfig, value: 1 | 2 | 3) => {
    onConfigChange({ ...config, [key]: value });
  };

  const resetConfig = () => {
    onConfigChange(defaultDetailConfig);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      scrollBehavior="outside"
      placement="center"
      classNames={{
        base: 'bg-white my-8',
        wrapper: 'items-center justify-center py-8 min-h-full',
        backdrop: 'bg-black/50',
        body: 'bg-white max-h-[70vh] overflow-y-auto',
        closeButton: 'cursor-pointer',
      }}
    >
      <ModalContent className="bg-white">
        <ModalHeader className="flex items-center gap-3 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">
              Configuracion de Detalle
            </h2>
            <p className="text-sm text-neutral-500">
              Selecciona las versiones de cada componente
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-6 py-6">
          {/* Galeria */}
          <SettingsSection
            title="Galeria de imagenes"
            icon={<Image className="w-5 h-5 text-[#4654CD]" />}
            value={config.galleryVersion}
            onChange={(v) => updateConfig('galleryVersion', v)}
            descriptions={versionDescriptions.gallery}
          />

          <div className="border-t border-neutral-100" />

          {/* Tabs */}
          <SettingsSection
            title="Organizacion de contenido"
            icon={<Layers className="w-5 h-5 text-[#03DBD0]" />}
            value={config.tabsVersion}
            onChange={(v) => updateConfig('tabsVersion', v)}
            descriptions={versionDescriptions.tabs}
          />

          <div className="border-t border-neutral-100" />

          {/* Specs Display */}
          <SettingsSection
            title="Visualizacion de specs"
            icon={<List className="w-5 h-5 text-amber-500" />}
            value={config.specsDisplayVersion}
            onChange={(v) => updateConfig('specsDisplayVersion', v)}
            descriptions={versionDescriptions.specsDisplay}
          />

          <div className="border-t border-neutral-100" />

          {/* Tooltips */}
          <SettingsSection
            title="Ayuda contextual"
            icon={<HelpCircle className="w-5 h-5 text-blue-500" />}
            value={config.tooltipsVersion}
            onChange={(v) => updateConfig('tooltipsVersion', v)}
            descriptions={versionDescriptions.tooltips}
          />

          <div className="border-t border-neutral-100" />

          {/* Limitaciones */}
          <SettingsSection
            title="Limitaciones del producto"
            icon={<AlertCircle className="w-5 h-5 text-orange-500" />}
            value={config.limitationsVersion}
            onChange={(v) => updateConfig('limitationsVersion', v)}
            descriptions={versionDescriptions.limitations}
          />

          <div className="border-t border-neutral-100" />

          {/* Similar Products */}
          <SettingsSection
            title="Productos similares"
            icon={<Scale className="w-5 h-5 text-purple-500" />}
            value={config.similarProductsVersion}
            onChange={(v) => updateConfig('similarProductsVersion', v)}
            descriptions={versionDescriptions.similarProducts}
          />

          <div className="border-t border-neutral-100" />

          {/* Certificaciones */}
          <SettingsSection
            title="Certificaciones"
            icon={<Shield className="w-5 h-5 text-green-500" />}
            value={config.certificationsVersion}
            onChange={(v) => updateConfig('certificationsVersion', v)}
            descriptions={versionDescriptions.certifications}
          />
        </ModalBody>

        <ModalFooter className="border-t border-neutral-100">
          <Button
            variant="flat"
            onPress={resetConfig}
            startContent={<RotateCcw className="w-4 h-4" />}
            className="bg-neutral-100 text-neutral-600 cursor-pointer"
          >
            Restaurar
          </Button>
          <Button
            onPress={onClose}
            className="bg-[#4654CD] text-white font-medium cursor-pointer"
          >
            Aplicar cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DetalleSettingsModal;
