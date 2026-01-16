'use client';

/**
 * SpecsDisplay - Cards grid por categoria (basado en V2)
 */

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Battery,
  Wifi,
  HelpCircle
} from 'lucide-react';
import { FieldTooltip } from '@/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields';
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

export const SpecsDisplay: React.FC<SpecsProps> = ({ specs }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {specs.map((specCategory, catIdx) => {
        const IconComponent = iconMap[specCategory.icon] || HelpCircle;

        return (
          <Card
            key={catIdx}
            className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardBody className="p-5">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-neutral-200">
                <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-[#4654CD]" />
                </div>
                <h3 className="font-semibold text-neutral-900 font-['Asap']">
                  {specCategory.category}
                </h3>
              </div>

              {/* Specs List */}
              <div className="space-y-3">
                {specCategory.specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between ${
                      spec.highlight
                        ? 'bg-[#4654CD]/5 -mx-2 px-2 py-1.5 rounded-lg'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600 font-['Asap']">
                        {spec.label}
                      </span>
                      {spec.tooltip && (
                        <FieldTooltip
                          content={spec.tooltip}
                          icon={<HelpCircle className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] transition-colors" />}
                        />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium font-['Asap'] ${
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
  );
};

export default SpecsDisplay;
