'use client';

/**
 * CatalogSettingsModal - Modal de configuracion de versiones v0.4
 *
 * Permite seleccionar entre 10 versiones de layout y 10 versiones de filtro de marca
 * para pruebas A/B y demos
 */

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
} from '@nextui-org/react';
import { Settings, RotateCcw, Layout, Filter, CreditCard } from 'lucide-react';
import { CatalogConfig, defaultCatalogConfig, versionDescriptions } from '../../types/catalog';

interface CatalogSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CatalogConfig;
  onConfigChange: (config: CatalogConfig) => void;
}

interface VersionSelectorProps {
  label: string;
  value: number;
  options: number[];
  descriptions: Record<number, string>;
  onChange: (value: number) => void;
  columns?: number;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  label,
  value,
  options,
  descriptions,
  onChange,
  columns = 5,
}) => {
  return (
    <div className="mb-6">
      <label className="text-sm font-medium text-neutral-700 mb-3 block">
        {label}
      </label>
      <div className={`grid gap-2 mb-3`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-center ${
              value === option
                ? 'bg-[#4654CD] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            V{option}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg">
        {descriptions[value]}
      </p>
    </div>
  );
};

export const CatalogSettingsModal: React.FC<CatalogSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [activeTab, setActiveTab] = useState<string>('layout');

  const handleReset = () => {
    onConfigChange(defaultCatalogConfig);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="outside"
      backdrop="blur"
      placement="center"
      classNames={{
        base: 'bg-white my-8',
        wrapper: 'items-center justify-center py-8 min-h-full',
        backdrop: 'bg-black/50',
        header: 'border-b border-neutral-200 bg-white py-4 pr-12',
        body: 'bg-white max-h-[60vh] overflow-y-auto overscroll-contain scrollbar-hide',
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
            Configuracion del Catalogo v0.4
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Version 0.4 incluye 10 variantes de layout y 10 variantes de filtro de marca
            para pruebas A/B exhaustivas.
          </p>

          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            classNames={{
              tabList: 'gap-2 w-full bg-neutral-100 p-1 rounded-lg',
              cursor: 'bg-white shadow-sm',
              tab: 'h-10 px-4',
              tabContent: 'group-data-[selected=true]:text-[#4654CD]',
            }}
          >
            <Tab
              key="layout"
              title={
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  <span>Layout (10)</span>
                </div>
              }
            >
              <div className="pt-6">
                <VersionSelector
                  label="B.1-B.3 - Layout del Catalogo"
                  value={config.layoutVersion}
                  options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                  descriptions={versionDescriptions.layout}
                  onChange={(v) =>
                    onConfigChange({
                      ...config,
                      layoutVersion: v as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
                    })
                  }
                />
              </div>
            </Tab>

            <Tab
              key="filters"
              title={
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Marca (10)</span>
                </div>
              }
            >
              <div className="pt-6">
                <VersionSelector
                  label="B.13 - Filtro de Marca"
                  value={config.brandFilterVersion}
                  options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                  descriptions={versionDescriptions.brandFilter}
                  onChange={(v) =>
                    onConfigChange({
                      ...config,
                      brandFilterVersion: v as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
                    })
                  }
                />
              </div>
            </Tab>

            <Tab
              key="cards"
              title={
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Cards (3)</span>
                </div>
              }
            >
              <div className="pt-6">
                <VersionSelector
                  label="B.37 - Tarjeta de Producto"
                  value={config.cardVersion}
                  options={[1, 2, 3]}
                  descriptions={versionDescriptions.card}
                  onChange={(v) =>
                    onConfigChange({ ...config, cardVersion: v as 1 | 2 | 3 })
                  }
                  columns={3}
                />
              </div>
            </Tab>
          </Tabs>

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-500">
                <strong>Configuracion actual:</strong> Layout V{config.layoutVersion} +
                Marca V{config.brandFilterVersion} + Card V{config.cardVersion}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Total combinaciones posibles: 10 x 10 x 3 = 300 variantes
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

export default CatalogSettingsModal;
