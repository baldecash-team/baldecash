'use client';

/**
 * SpecsDisplay - Cards grid por categoria (basado en V2)
 */

import React from 'react';
import { Card, CardBody, Tooltip } from '@nextui-org/react';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Battery,
  Wifi,
  HelpCircle,
  Scale,
  Camera,
  Shield,
  Smartphone,
  Fingerprint,
  Gauge,
  Zap,
  Bluetooth,
  Settings,
  Volume2,
  Keyboard,
} from 'lucide-react';
import { SpecsProps } from '../../../types/detail';

// Map API icon names (lowercase) to Lucide components
const iconMap: Record<string, React.ElementType> = {
  // Lowercase keys from API
  cpu: Cpu,
  memory: MemoryStick,
  storage: HardDrive,
  monitor: Monitor,
  battery: Battery,
  wifi: Wifi,
  scale: Scale,
  camera: Camera,
  shield: Shield,
  smartphone: Smartphone,
  fingerprint: Fingerprint,
  gauge: Gauge,
  zap: Zap,
  bluetooth: Bluetooth,
  settings: Settings,
  'volume-2': Volume2,
  keyboard: Keyboard,
  // PascalCase fallbacks
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Battery,
  Wifi,
  HelpCircle,
  Bluetooth,
  Settings,
  Volume2,
  Keyboard,
};


export const SpecsDisplay: React.FC<SpecsProps> = ({ specs }) => {
  return (
    <div className="space-y-4">
      {/* Grid de specs */}
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
                <div className="w-10 h-10 rounded-lg bg-[rgba(var(--color-primary-rgb),0.10)] flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-semibold text-neutral-900 font-['Asap',_sans-serif]">
                  {specCategory.category}
                </h3>
              </div>

              {/* Specs List */}
              <div className="space-y-3">
                {specCategory.specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start justify-between gap-2 ${
                      spec.highlight
                        ? 'bg-[rgba(var(--color-primary-rgb),0.05)] -mx-2 px-2 py-1.5 rounded-lg'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600 font-['Asap',_sans-serif]">
                        {spec.label}
                      </span>
                      {spec.tooltip && (
                        <Tooltip
                          content={spec.tooltip}
                          placement="top"
                          classNames={{
                            content: 'bg-white text-neutral-700 border border-neutral-200 shadow-lg px-3 py-2 max-w-[min(16rem,calc(100vw-2rem))] text-sm',
                          }}
                        >
                          <span className="cursor-help">
                            <HelpCircle className="w-4 h-4 text-neutral-400 hover:text-[var(--color-primary)] transition-colors" />
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium font-['Asap',_sans-serif] text-right max-w-[40%] ${
                        spec.highlight
                          ? 'text-[var(--color-primary)]'
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
    </div>
  );
};

export default SpecsDisplay;
