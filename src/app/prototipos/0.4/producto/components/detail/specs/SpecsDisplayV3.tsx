'use client';

/**
 * SpecsDisplayV3 - Tabla 2 columnas clásica
 * Version: V3 - Classic 2-column table layout
 */

import React from 'react';
import { Tooltip } from '@nextui-org/react';
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

export const SpecsDisplayV3: React.FC<SpecsProps> = ({ specs }) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <tbody>
          {specs.map((specCategory, catIdx) => {
            const IconComponent = iconMap[specCategory.icon] || HelpCircle;

            return (
              <React.Fragment key={catIdx}>
                {/* Category Header Row */}
                <tr className="bg-[#4654CD]/5">
                  <td
                    colSpan={2}
                    className="px-5 py-3 border-b border-neutral-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-[#4654CD]" />
                      </div>
                      <span className="font-semibold text-neutral-900 font-['Asap']">
                        {specCategory.category}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Specs Rows */}
                {specCategory.specs.map((spec, idx) => (
                  <tr
                    key={idx}
                    className={`
                      border-b border-neutral-100 hover:bg-neutral-50 transition-colors
                      ${spec.highlight ? 'bg-[#4654CD]/5' : ''}
                      ${idx === specCategory.specs.length - 1 && catIdx === specs.length - 1 ? 'border-b-0' : ''}
                    `}
                  >
                    <td className="px-5 py-3 w-1/2">
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
                    </td>
                    <td className="px-5 py-3 w-1/2 text-right">
                      <span
                        className={`text-sm font-medium font-['Asap'] ${
                          spec.highlight
                            ? 'text-[#4654CD]'
                            : 'text-neutral-900'
                        }`}
                      >
                        {spec.value}
                      </span>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SpecsDisplayV3;
