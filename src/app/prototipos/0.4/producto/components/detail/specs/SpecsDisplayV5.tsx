'use client';

/**
 * SpecsDisplayV5 - Grid filtrable por nivel técnico
 * Version: V5 - Grid with basic/advanced toggle
 */

import React, { useState } from 'react';
import { Card, CardBody, Tooltip, Button, ButtonGroup } from '@nextui-org/react';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Battery,
  Wifi,
  HelpCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { SpecsProps } from '../../../types/detail';

const iconMap: Record<string, React.ElementType> = {
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Battery,
  Wifi,
  HelpCircle,
};

type TechnicalLevel = 'basic' | 'all';

export const SpecsDisplayV5: React.FC<SpecsProps> = ({ specs }) => {
  const [level, setLevel] = useState<TechnicalLevel>('basic');

  // Show only highlighted specs in basic mode
  const filteredSpecs = level === 'basic'
    ? specs.map(cat => ({
        ...cat,
        specs: cat.specs.filter(spec => spec.highlight)
      })).filter(cat => cat.specs.length > 0)
    : specs;

  return (
    <div className="w-full space-y-4">
      {/* Level Toggle */}
      <div className="flex justify-center">
        <ButtonGroup>
          <Button
            onClick={() => setLevel('basic')}
            className={`cursor-pointer font-['Asap'] ${
              level === 'basic'
                ? 'bg-[#4654CD] text-white'
                : 'bg-white text-neutral-700'
            }`}
            startContent={<Sparkles className="w-4 h-4" />}
          >
            Especificaciones básicas
          </Button>
          <Button
            onClick={() => setLevel('all')}
            className={`cursor-pointer font-['Asap'] ${
              level === 'all'
                ? 'bg-[#4654CD] text-white'
                : 'bg-white text-neutral-700'
            }`}
            startContent={<Zap className="w-4 h-4" />}
          >
            Especificaciones completas
          </Button>
        </ButtonGroup>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpecs.map((specCategory, catIdx) => {
          const IconComponent = iconMap[specCategory.icon] || HelpCircle;

          return (
            <Card
              key={catIdx}
              className="bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <CardBody className="p-4">
                {/* Category Icon & Title */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200">
                  <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-[#4654CD]" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 font-['Asap']">
                    {specCategory.category}
                  </h3>
                </div>

                {/* Specs */}
                <div className="space-y-2">
                  {specCategory.specs.map((spec, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-neutral-600 font-['Asap']">
                          {spec.label}
                        </span>
                        {spec.tooltip && (
                          <Tooltip
                            content={spec.tooltip}
                            classNames={{
                              content: 'bg-white shadow-lg border border-neutral-200 font-["Asap"]',
                            }}
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-neutral-400 cursor-pointer hover:text-[#4654CD] transition-colors" />
                          </Tooltip>
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium font-['Asap'] block ${
                          spec.highlight
                            ? 'text-[#4654CD]'
                            : 'text-neutral-900'
                        }`}
                      >
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Info Message */}
      {level === 'basic' && (
        <p className="text-center text-sm text-neutral-500 font-['Asap']">
          Mostrando solo las especificaciones más importantes.
          Cambia a "Especificaciones completas" para ver todos los detalles técnicos.
        </p>
      )}
    </div>
  );
};

export default SpecsDisplayV5;
