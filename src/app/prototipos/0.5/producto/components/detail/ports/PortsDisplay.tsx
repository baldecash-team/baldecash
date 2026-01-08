'use client';

/**
 * PortsDisplay - Visual Laptop Ports Layout (basado en V1)
 * Shows ports organized by position with a visual representation.
 */

import React from 'react';
import {
  Usb,
  Monitor,
  Headphones,
  CreditCard,
  Laptop,
  HelpCircle,
} from 'lucide-react';
import { PortsDisplayProps, ProductPort } from '../../../types/detail';

const iconMap: Record<string, React.ElementType> = {
  Usb,
  Monitor,
  Headphones,
  CreditCard,
  Laptop,
  HelpCircle,
};

export const PortsDisplay: React.FC<PortsDisplayProps> = ({ ports }) => {
  const leftPorts = ports.filter(p => p.position === 'left');
  const rightPorts = ports.filter(p => p.position === 'right');
  const backPorts = ports.filter(p => p.position === 'back');

  const renderPort = (port: ProductPort, index: number) => {
    const IconComponent = iconMap[port.icon] || HelpCircle;
    return (
      <div
        key={index}
        className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200"
      >
        <IconComponent className="w-4 h-4 text-[#4654CD]" />
        <span className="text-sm font-medium text-neutral-700">{port.name}</span>
        {port.count > 1 && (
          <span className="text-xs text-neutral-500">×{port.count}</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
          <Usb className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Puertos y Conectividad</h3>
          <p className="text-sm text-neutral-500">Distribución de puertos en el equipo</p>
        </div>
      </div>

      {/* Visual Layout */}
      <div className="relative flex items-center justify-center gap-4">
        {/* Left Side */}
        <div className="flex flex-col gap-2 items-end">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Izquierda</span>
          {leftPorts.map((port, idx) => renderPort(port, idx))}
        </div>

        {/* Laptop Visual */}
        <div className="flex-shrink-0 w-32 h-24 bg-gradient-to-b from-neutral-200 to-neutral-300 rounded-lg flex items-center justify-center relative">
          <Laptop className="w-12 h-12 text-neutral-500" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#4654CD]/30 rounded-r" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#4654CD]/30 rounded-l" />
          {backPorts.length > 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#4654CD]/30 rounded-b" />
          )}
        </div>

        {/* Right Side */}
        <div className="flex flex-col gap-2 items-start">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Derecha</span>
          {rightPorts.map((port, idx) => renderPort(port, idx))}
        </div>
      </div>

      {/* Back Ports (if any) */}
      {backPorts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Parte trasera</span>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {backPorts.map((port, idx) => renderPort(port, idx))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-3 py-1 bg-[#4654CD]/10 text-[#4654CD] rounded-full text-xs font-medium">
            {ports.reduce((acc, p) => acc + p.count, 0)} puertos totales
          </span>
          <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">
            {leftPorts.length} izquierda • {rightPorts.length} derecha
          </span>
        </div>
      </div>
    </div>
  );
};

export default PortsDisplay;
