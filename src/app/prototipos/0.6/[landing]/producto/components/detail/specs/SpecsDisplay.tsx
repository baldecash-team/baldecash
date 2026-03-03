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
  HelpCircle,
  Scale,
  Camera,
  Shield,
  Smartphone,
  Fingerprint,
  Gauge,
  Zap,
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
  // PascalCase fallbacks
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Battery,
  Wifi,
  HelpCircle,
};

// Tooltip component for specs (estilo 0.5: fondo blanco, borde, sombra)
const SpecTooltip: React.FC<{
  content: string;
  children: React.ReactNode;
}> = ({ content, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const handleToggle = () => setIsVisible(!isVisible);
  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleToggle}
    >
      {children}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-white border border-neutral-200 shadow-lg rounded-lg w-64 z-[9999] transition-all duration-200 ${
          isVisible ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <p className="text-sm text-neutral-700 leading-relaxed">{content}</p>
        {/* Arrow with border effect */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-neutral-200" />
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-white" />
      </div>
    </div>
  );
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
                <div className="w-10 h-10 rounded-lg bg-[rgba(var(--color-primary-rgb),0.10)] flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-[var(--color-primary)]" />
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
                        ? 'bg-[rgba(var(--color-primary-rgb),0.05)] -mx-2 px-2 py-1.5 rounded-lg'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600 font-['Asap']">
                        {spec.label}
                      </span>
                      {spec.tooltip && (
                        <SpecTooltip content={spec.tooltip}>
                          <HelpCircle className="w-4 h-4 text-neutral-400 hover:text-[var(--color-primary)] transition-colors cursor-help" />
                        </SpecTooltip>
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium font-['Asap'] ${
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
  );
};

export default SpecsDisplay;
