'use client';

/**
 * DetailTabsV1 - Tabs Horizontales Tradicionales
 *
 * Caracteristicas:
 * - Tabs horizontales arriba del contenido
 * - Transicion suave entre secciones
 * - Iconos + texto en cada tab
 * - Ideal para: navegacion clara entre categorias
 */

import React, { useState } from 'react';
import { Tabs, Tab, Card, CardBody } from '@nextui-org/react';
import { Cpu, FileText, Calendar, MessageSquare, Settings } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';

// Importar componentes de specs cuando esten disponibles
// import { SpecsTableV1, SpecsCardsV2, SpecsListV3 } from '../specs';

export const DetailTabsV1: React.FC<DetailTabsProps> = ({
  product,
  specsVersion,
  tooltipsVersion,
}) => {
  const [activeTab, setActiveTab] = useState('specs');

  const tabs = [
    { key: 'specs', label: 'Especificaciones', icon: Cpu },
    { key: 'description', label: 'Descripcion', icon: FileText },
    { key: 'schedule', label: 'Cronograma', icon: Calendar },
    { key: 'ports', label: 'Puertos', icon: Settings },
  ];

  return (
    <div className="w-full">
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        variant="underlined"
        classNames={{
          base: 'w-full',
          tabList: 'gap-4 w-full relative rounded-none p-0 border-b border-neutral-200',
          tab: 'max-w-fit px-4 h-12 cursor-pointer',
          tabContent: 'text-neutral-600 group-data-[selected=true]:text-[#4654CD] group-data-[selected=true]:font-semibold',
          cursor: 'w-full bg-[#4654CD]',
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            title={
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </div>
            }
          >
            <Card className="mt-6 border border-neutral-200 shadow-none">
              <CardBody className="p-6">
                {tab.key === 'specs' && (
                  <div className="space-y-6">
                    {product.specs.map((category) => (
                      <div key={category.category}>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-[#4654CD]" />
                          </span>
                          {category.category}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {category.specs.map((spec, index) => (
                            <div
                              key={index}
                              className={`flex justify-between items-center py-2 border-b border-neutral-100 ${
                                spec.highlight ? 'bg-[#4654CD]/5 px-3 rounded-lg border-none' : ''
                              }`}
                            >
                              <span className="text-neutral-600">{spec.label}</span>
                              <span className="font-medium text-neutral-800">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab.key === 'description' && (
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-700 leading-relaxed">{product.description}</p>

                    <h4 className="text-lg font-semibold mt-6 mb-4 text-neutral-800">
                      Caracteristicas destacadas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex gap-3 p-4 bg-neutral-50 rounded-lg">
                          <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
                            <Cpu className="w-5 h-5 text-[#4654CD]" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">{feature.title}</p>
                            <p className="text-sm text-neutral-600">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab.key === 'schedule' && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                    <p className="text-neutral-500">
                      Usa la calculadora de cuotas para ver el cronograma de pagos
                    </p>
                  </div>
                )}

                {tab.key === 'ports' && (
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-4">Puertos disponibles</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {product.ports.map((port, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-[#4654CD]" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">{port.name}</p>
                            <p className="text-sm text-neutral-500">
                              {port.count}x - {port.position}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default DetailTabsV1;
