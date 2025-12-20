'use client';

/**
 * SpecsDisplayV4 - Chips flotantes con valores
 * Version: V4 - Floating chips showing key specs
 */

import React, { useState } from 'react';
import { Card, CardBody, Tooltip, Chip } from '@nextui-org/react';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Battery,
  Wifi,
  HelpCircle
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

export const SpecsDisplayV4: React.FC<SpecsProps> = ({ specs }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    specs[0]?.category || null
  );

  const selectedSpecs = specs.find(s => s.category === selectedCategory);

  return (
    <div className="w-full space-y-4">
      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        {specs.map((specCategory) => {
          const IconComponent = iconMap[specCategory.icon] || HelpCircle;
          const isSelected = selectedCategory === specCategory.category;

          return (
            <Chip
              key={specCategory.category}
              onClick={() => setSelectedCategory(specCategory.category)}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#4654CD] text-white shadow-md'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 shadow-sm'
              }`}
              startContent={
                <IconComponent
                  className={`w-4 h-4 ${
                    isSelected ? 'text-white' : 'text-[#4654CD]'
                  }`}
                />
              }
              size="lg"
            >
              <span className="font-['Asap'] font-medium">
                {specCategory.category}
              </span>
            </Chip>
          );
        })}
      </div>

      {/* Selected Category Specs */}
      {selectedSpecs && (
        <Card className="bg-white shadow-sm">
          <CardBody className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedSpecs.specs.map((spec, idx) => (
                <div
                  key={idx}
                  className={`
                    flex flex-col gap-1 p-3 rounded-lg transition-all
                    ${spec.highlight
                      ? 'bg-[#4654CD]/10 ring-2 ring-[#4654CD]/20'
                      : 'bg-neutral-50 hover:bg-neutral-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
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
                    className={`text-base font-semibold font-['Asap'] ${
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
      )}
    </div>
  );
};

export default SpecsDisplayV4;
