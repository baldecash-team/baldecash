'use client';

/**
 * DetailTabsV2 - Acordeon Colapsable
 *
 * Caracteristicas:
 * - Todas las secciones visibles
 * - Expandibles individualmente
 * - Multiples pueden estar abiertas
 * - Ideal para: mobile, contenido completo
 */

import React, { useState } from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Cpu, FileText, Calendar, Settings, Battery, Wifi, ChevronDown } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';

export const DetailTabsV2: React.FC<DetailTabsProps> = ({
  product,
  specsVersion,
  tooltipsVersion,
}) => {
  const iconMap: Record<string, React.ElementType> = {
    Cpu,
    Battery,
    Wifi,
    MemoryStick: Cpu,
    HardDrive: Settings,
    Monitor: Settings,
  };

  return (
    <div className="w-full">
      <Accordion
        selectionMode="multiple"
        defaultExpandedKeys={['specs', 'features']}
        className="px-0 gap-4"
        itemClasses={{
          base: 'border border-neutral-200 rounded-xl mb-3 px-0 shadow-none data-[open=true]:border-[#4654CD]/30',
          trigger: 'px-6 py-4 data-[hover=true]:bg-neutral-50 rounded-xl cursor-pointer',
          title: 'text-neutral-800 font-semibold',
          content: 'px-6 pb-6 pt-0',
          indicator: 'text-neutral-400',
        }}
      >
        {/* Especificaciones */}
        <AccordionItem
          key="specs"
          aria-label="Especificaciones"
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-[#4654CD]" />
              </div>
              <span>Especificaciones tecnicas</span>
            </div>
          }
        >
          <div className="space-y-6">
            {product.specs.map((category) => {
              const IconComponent = iconMap[category.icon] || Cpu;
              return (
                <div key={category.category}>
                  <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    {category.category}
                  </h4>
                  <div className="space-y-2">
                    {category.specs.map((spec, index) => (
                      <div
                        key={index}
                        className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                          spec.highlight
                            ? 'bg-[#4654CD]/5 border border-[#4654CD]/20'
                            : 'hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-neutral-600">{spec.label}</span>
                        <span className={`font-medium ${spec.highlight ? 'text-[#4654CD]' : 'text-neutral-800'}`}>
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </AccordionItem>

        {/* Caracteristicas */}
        <AccordionItem
          key="features"
          aria-label="Caracteristicas"
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#03DBD0]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#03DBD0]" />
              </div>
              <span>Caracteristicas destacadas</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.features.map((feature, index) => (
              <div key={index} className="flex gap-3 p-4 bg-neutral-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-5 h-5 text-[#4654CD]" />
                </div>
                <div>
                  <p className="font-medium text-neutral-800">{feature.title}</p>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </AccordionItem>

        {/* Descripcion */}
        <AccordionItem
          key="description"
          aria-label="Descripcion"
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <span>Descripcion del producto</span>
            </div>
          }
        >
          <p className="text-neutral-700 leading-relaxed">{product.description}</p>
        </AccordionItem>

        {/* Puertos */}
        <AccordionItem
          key="ports"
          aria-label="Puertos"
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Settings className="w-4 h-4 text-neutral-600" />
              </div>
              <span>Puertos y conectividad</span>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Diagrama de puertos */}
            <div className="bg-neutral-50 rounded-xl p-6">
              <div className="flex items-center justify-center gap-8">
                {/* Lado izquierdo */}
                <div className="text-center">
                  <p className="text-xs text-neutral-500 mb-2">Izquierda</p>
                  <div className="flex flex-col gap-2">
                    {product.ports
                      .filter((p) => p.position === 'left')
                      .map((port, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 bg-white rounded-lg border border-neutral-200 text-sm"
                        >
                          {port.name} ({port.count}x)
                        </div>
                      ))}
                  </div>
                </div>

                {/* Laptop icon */}
                <div className="w-32 h-20 bg-neutral-200 rounded-lg flex items-center justify-center">
                  <span className="text-neutral-500 text-xs">Laptop</span>
                </div>

                {/* Lado derecho */}
                <div className="text-center">
                  <p className="text-xs text-neutral-500 mb-2">Derecha</p>
                  <div className="flex flex-col gap-2">
                    {product.ports
                      .filter((p) => p.position === 'right')
                      .map((port, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 bg-white rounded-lg border border-neutral-200 text-sm"
                        >
                          {port.name} ({port.count}x)
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de puertos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.ports.map((port, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg"
                >
                  <Settings className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-700">{port.name}</span>
                  <span className="text-xs text-neutral-400 ml-auto">{port.count}x</span>
                </div>
              ))}
            </div>
          </div>
        </AccordionItem>

        {/* Software */}
        <AccordionItem
          key="software"
          aria-label="Software"
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <span>Software incluido</span>
              {product.hasOS && (
                <span className="ml-auto px-2 py-0.5 bg-[#22c55e] text-white text-xs rounded-full">
                  Con Windows
                </span>
              )}
            </div>
          }
        >
          <div className="space-y-3">
            {product.software.map((sw, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  sw.included ? 'bg-[#22c55e]/5 border border-[#22c55e]/20' : 'bg-neutral-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    sw.included ? 'bg-[#22c55e]/10' : 'bg-neutral-200'
                  }`}
                >
                  <Settings className={`w-5 h-5 ${sw.included ? 'text-[#22c55e]' : 'text-neutral-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-800">{sw.name}</p>
                  {sw.description && (
                    <p className="text-sm text-neutral-500">{sw.description}</p>
                  )}
                </div>
                {sw.included ? (
                  <span className="text-xs text-[#22c55e] font-medium">Incluido</span>
                ) : (
                  <span className="text-xs text-neutral-400">Opcional</span>
                )}
              </div>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DetailTabsV2;
