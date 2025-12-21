'use client';

/**
 * SpecsDisplayV6 - Tabla con toggles expandibles
 * Version: V6 - Table with expandable rows
 */

import React, { useState } from 'react';
import { Tooltip } from '@nextui-org/react';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Battery,
  Wifi,
  HelpCircle,
  ChevronDown,
  ChevronRight
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

export const SpecsDisplayV6: React.FC<SpecsProps> = ({ specs }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([specs[0]?.category])
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <tbody>
          {specs.map((specCategory, catIdx) => {
            const IconComponent = iconMap[specCategory.icon] || HelpCircle;
            const isExpanded = expandedCategories.has(specCategory.category);

            return (
              <React.Fragment key={catIdx}>
                {/* Category Header Row - Clickable */}
                <tr
                  onClick={() => toggleCategory(specCategory.category)}
                  className="bg-[#4654CD]/5 hover:bg-[#4654CD]/10 cursor-pointer transition-colors"
                >
                  <td
                    colSpan={2}
                    className="px-5 py-4 border-b border-neutral-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-[#4654CD]" />
                        </div>
                        <span className="font-semibold text-neutral-900 font-['Asap']">
                          {specCategory.category}
                        </span>
                        <span className="text-xs text-neutral-500 font-['Asap']">
                          ({specCategory.specs.length} especificaciones)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-neutral-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-neutral-400" />
                        )}
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Expandable Specs Rows */}
                {isExpanded && specCategory.specs.map((spec, idx) => (
                  <tr
                    key={idx}
                    className={`
                      border-b border-neutral-100 hover:bg-neutral-50 transition-colors
                      ${spec.highlight ? 'bg-[#4654CD]/5' : ''}
                      ${idx === specCategory.specs.length - 1 ? '' : ''}
                    `}
                  >
                    <td className="px-5 py-3 pl-16 w-1/2">
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

      {/* Expand All / Collapse All Footer */}
      <div className="border-t border-neutral-200 bg-neutral-50 px-5 py-3">
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setExpandedCategories(new Set(specs.map(s => s.category)))}
            className="text-sm text-[#4654CD] hover:underline cursor-pointer font-['Asap']"
          >
            Expandir todas
          </button>
          <span className="text-neutral-300">|</span>
          <button
            onClick={() => setExpandedCategories(new Set())}
            className="text-sm text-[#4654CD] hover:underline cursor-pointer font-['Asap']"
          >
            Colapsar todas
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecsDisplayV6;
