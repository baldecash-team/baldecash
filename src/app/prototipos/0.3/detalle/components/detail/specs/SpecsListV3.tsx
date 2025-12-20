'use client';

/**
 * SpecsListV3 - Lista con Iconos Inline
 *
 * Caracteristicas:
 * - Lista compacta
 * - Iconos inline con valores
 * - Agrupacion por relevancia
 * - Ideal para: mobile, compacto
 */

import React, { useState } from 'react';
import { Tooltip, Button, Chip } from '@nextui-org/react';
import {
  HelpCircle,
  Cpu,
  Battery,
  Monitor,
  HardDrive,
  Wifi,
  ChevronRight,
  Star,
  Layers,
  Settings,
} from 'lucide-react';
import { SpecsProps, ProductSpec, SpecItem } from '../../../types/detail';

const iconMap: Record<string, React.ElementType> = {
  Cpu,
  Battery,
  Monitor,
  HardDrive,
  Wifi,
  MemoryStick: Cpu,
};

interface GroupedSpecs {
  essential: { category: string; spec: SpecItem; icon: string }[];
  advanced: { category: string; spec: SpecItem; icon: string }[];
  technical: { category: string; spec: SpecItem; icon: string }[];
}

export const SpecsListV3: React.FC<SpecsProps> = ({ specs, tooltipsVersion }) => {
  const [activeGroup, setActiveGroup] = useState<'essential' | 'advanced' | 'technical'>('essential');

  // Agrupar specs por relevancia
  const groupedSpecs: GroupedSpecs = {
    essential: [],
    advanced: [],
    technical: [],
  };

  specs.forEach((category) => {
    category.specs.forEach((spec, index) => {
      const specWithMeta = { category: category.category, spec, icon: category.icon };

      if (spec.highlight) {
        groupedSpecs.essential.push(specWithMeta);
      } else if (index < 2) {
        groupedSpecs.advanced.push(specWithMeta);
      } else {
        groupedSpecs.technical.push(specWithMeta);
      }
    });
  });

  const groups = [
    {
      key: 'essential' as const,
      label: 'Esencial',
      icon: Star,
      color: 'text-[#4654CD]',
      bgColor: 'bg-[#4654CD]/10',
      description: 'Lo mas importante para tu uso diario',
    },
    {
      key: 'advanced' as const,
      label: 'Avanzado',
      icon: Layers,
      color: 'text-[#03DBD0]',
      bgColor: 'bg-[#03DBD0]/10',
      description: 'Caracteristicas adicionales',
    },
    {
      key: 'technical' as const,
      label: 'Tecnico',
      icon: Settings,
      color: 'text-neutral-600',
      bgColor: 'bg-neutral-100',
      description: 'Especificaciones detalladas',
    },
  ];

  const renderTooltip = (spec: SpecItem) => {
    if (!spec.tooltip) return null;

    if (tooltipsVersion === 1) {
      return (
        <Tooltip
          content={spec.tooltip}
          classNames={{
            content: 'max-w-xs bg-neutral-800 text-white text-sm py-2 px-3 rounded-lg',
          }}
        >
          <button className="ml-2 cursor-help">
            <HelpCircle className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] transition-colors" />
          </button>
        </Tooltip>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Tabs de grupos */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {groups.map((group) => (
          <button
            key={group.key}
            onClick={() => setActiveGroup(group.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeGroup === group.key
                ? `${group.bgColor} ${group.color} font-medium`
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <group.icon className="w-4 h-4" />
            <span className="text-sm">{group.label}</span>
            <Chip
              size="sm"
              radius="full"
              classNames={{
                base: `h-5 ${activeGroup === group.key ? 'bg-white/50' : 'bg-neutral-200'}`,
                content: 'text-xs font-medium px-0',
              }}
            >
              {groupedSpecs[group.key].length}
            </Chip>
          </button>
        ))}
      </div>

      {/* Descripcion del grupo */}
      <p className="text-sm text-neutral-500">
        {groups.find((g) => g.key === activeGroup)?.description}
      </p>

      {/* Lista de specs */}
      <div className="space-y-2">
        {groupedSpecs[activeGroup].map((item, index) => {
          const IconComponent = iconMap[item.icon] || Cpu;
          const group = groups.find((g) => g.key === activeGroup)!;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                item.spec.highlight
                  ? 'bg-[#4654CD]/5 border border-[#4654CD]/20'
                  : 'bg-neutral-50 hover:bg-neutral-100'
              }`}
            >
              {/* Icono */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.spec.highlight ? 'bg-[#4654CD]/10' : group.bgColor
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 ${item.spec.highlight ? 'text-[#4654CD]' : group.color}`}
                />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500">{item.spec.label}</span>
                  {renderTooltip(item.spec)}
                </div>
                <p
                  className={`font-semibold ${
                    item.spec.highlight ? 'text-[#4654CD]' : 'text-neutral-800'
                  }`}
                >
                  {item.spec.value}
                </p>

                {/* Texto explicativo siempre visible (version 3) */}
                {item.spec.tooltip && tooltipsVersion === 3 && (
                  <p className="text-xs text-neutral-400 mt-1">{item.spec.tooltip}</p>
                )}
              </div>

              {/* Categoria */}
              <span className="text-xs text-neutral-400 hidden sm:block">{item.category}</span>

              <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Resumen de lo que tienes */}
      {activeGroup === 'essential' && (
        <div className="p-4 bg-[#4654CD]/5 border border-[#4654CD]/20 rounded-xl">
          <h4 className="font-medium text-[#4654CD] mb-2">Lo que tienes con esta laptop:</h4>
          <div className="flex flex-wrap gap-2">
            {groupedSpecs.essential.slice(0, 4).map((item, index) => (
              <Chip
                key={index}
                size="sm"
                radius="sm"
                classNames={{
                  base: 'bg-white border border-[#4654CD]/20',
                  content: 'text-[#4654CD] text-xs font-medium',
                }}
              >
                {item.spec.value}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecsListV3;
