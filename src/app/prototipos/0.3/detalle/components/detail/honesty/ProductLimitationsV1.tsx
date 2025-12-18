'use client';

/**
 * ProductLimitationsV1 - Seccion "Considera que..." Lista
 *
 * Caracteristicas:
 * - Lista visible siempre
 * - Framing positivo
 * - Alternativas sugeridas
 * - Ideal para: transparencia, confianza
 */

import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import {
  AlertCircle,
  Info,
  Lightbulb,
  Monitor,
  HardDrive,
  Gamepad2,
  Cpu,
  Battery,
} from 'lucide-react';
import { ProductLimitationsProps } from '../../../types/detail';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor,
  HardDrive,
  Gamepad2,
  Cpu,
  Battery,
};

export const ProductLimitationsV1: React.FC<ProductLimitationsProps> = ({ limitations }) => {
  if (limitations.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Info className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-800">Considera que...</h3>
          <p className="text-sm text-neutral-500">Para que tomes la mejor decision</p>
        </div>
      </div>

      {/* Lista de limitaciones */}
      <div className="space-y-3">
        {limitations.map((limitation, index) => {
          const IconComponent = iconMap[limitation.icon] || AlertCircle;

          return (
            <Card
              key={index}
              className={`border ${
                limitation.severity === 'warning'
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-neutral-200 bg-neutral-50/50'
              }`}
            >
              <CardBody className="p-4">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      limitation.severity === 'warning'
                        ? 'bg-amber-100'
                        : 'bg-neutral-100'
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 ${
                        limitation.severity === 'warning'
                          ? 'text-amber-600'
                          : 'text-neutral-500'
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-neutral-600">
                        {limitation.category}
                      </span>
                      {limitation.severity === 'warning' && (
                        <Chip
                          size="sm"
                          radius="sm"
                          classNames={{
                            base: 'bg-amber-100 h-5 px-1.5',
                            content: 'text-amber-700 text-xs px-0',
                          }}
                        >
                          Importante
                        </Chip>
                      )}
                    </div>

                    <p className="text-neutral-700 mb-2">{limitation.description}</p>

                    {limitation.alternative && (
                      <div className="flex items-start gap-2 p-2 bg-white rounded-lg border border-neutral-200">
                        <Lightbulb className="w-4 h-4 text-[#4654CD] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-neutral-600">{limitation.alternative}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-xs text-neutral-400 flex items-center gap-2">
        <Info className="w-3 h-3" />
        Mostramos esta informacion porque creemos en la transparencia
      </p>
    </div>
  );
};

export default ProductLimitationsV1;
