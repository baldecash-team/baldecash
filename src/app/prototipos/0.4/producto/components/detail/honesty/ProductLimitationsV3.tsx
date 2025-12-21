'use client';

import { useState } from 'react';
import { Tooltip } from '@nextui-org/react';
import { AlertCircle, Info } from 'lucide-react';

export interface ProductLimitation {
  category: string;
  description: string;
  severity: 'info' | 'warning';
  alternative?: string;
  icon: string;
}

export interface ProductLimitationsProps {
  limitations: ProductLimitation[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertCircle,
  Info,
};

export default function ProductLimitationsV3({ limitations }: ProductLimitationsProps) {
  if (!limitations || limitations.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3">
        {limitations.map((limitation, index) => {
          const IconComponent = iconMap[limitation.icon] || Info;
          const severityColor = limitation.severity === 'warning' ? 'amber' : 'blue';

          return (
            <Tooltip
              key={index}
              content={
                <div className="max-w-xs p-2">
                  <h4 className="font-semibold mb-2 text-gray-900">
                    {limitation.category}
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    {limitation.description}
                  </p>
                  {limitation.alternative && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-800">
                        💡 {limitation.alternative}
                      </p>
                    </div>
                  )}
                </div>
              }
              className="bg-white shadow-lg border border-gray-200"
              placement="top"
              delay={0}
              closeDelay={0}
            >
              <div
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full
                  cursor-pointer transition-all hover:scale-105
                  ${limitation.severity === 'warning'
                    ? 'bg-amber-100 text-amber-700 border-2 border-amber-300 hover:bg-amber-200'
                    : 'bg-blue-100 text-blue-700 border-2 border-blue-300 hover:bg-blue-200'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-semibold">{limitation.category}</span>
              </div>
            </Tooltip>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-3 italic">
        Pasa el cursor sobre las etiquetas para ver más detalles
      </p>
    </div>
  );
}
