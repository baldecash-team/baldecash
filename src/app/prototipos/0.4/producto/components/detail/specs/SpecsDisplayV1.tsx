'use client';

/**
 * SpecsDisplayV1 - Acordeón con spacing corregido (PREFERIDO)
 * Version: V1 - Accordion with py-1.5 spacing between items
 */

import React from 'react';
import { Accordion, AccordionItem, Tooltip } from '@nextui-org/react';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Battery,
  Wifi,
  HelpCircle,
  ChevronDown
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

export const SpecsDisplayV1: React.FC<SpecsProps> = ({ specs }) => {
  return (
    <div className="w-full">
      <Accordion
        variant="splitted"
        defaultExpandedKeys={[specs[0]?.category]}
        className="px-0"
      >
        {specs.map((specCategory) => {
          const IconComponent = iconMap[specCategory.icon] || HelpCircle;

          return (
            <AccordionItem
              key={specCategory.category}
              aria-label={specCategory.category}
              title={
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-[#4654CD]" />
                  </div>
                  <span className="font-semibold text-neutral-900 font-['Asap']">
                    {specCategory.category}
                  </span>
                </div>
              }
              indicator={<ChevronDown className="w-5 h-5 text-neutral-400" />}
              classNames={{
                base: "bg-white shadow-sm rounded-xl mb-2",
                title: "text-base",
                trigger: "py-4 px-5",
                content: "pb-4 px-5",
              }}
            >
              <div className="space-y-2 py-2">
                {specCategory.specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between py-1.5 ${
                      spec.highlight
                        ? 'bg-[#4654CD]/5 -mx-2 px-2 rounded-lg'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600 font-['Asap']">
                        {spec.label}
                      </span>
                      {spec.tooltip && (
                        <Tooltip
                          content={spec.tooltip}
                          classNames={{
                            content: 'bg-white shadow-lg border border-neutral-200 font-["Asap"]',
                          }}
                        >
                          <HelpCircle className="w-4 h-4 text-neutral-400 cursor-pointer hover:text-[#4654CD] transition-colors" />
                        </Tooltip>
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
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default SpecsDisplayV1;
