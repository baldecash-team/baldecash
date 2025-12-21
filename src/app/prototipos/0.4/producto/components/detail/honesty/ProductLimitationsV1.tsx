'use client';

import { useState } from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { AlertCircle, Info, ChevronDown } from 'lucide-react';

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
  ChevronDown,
};

export default function ProductLimitationsV1({ limitations }: ProductLimitationsProps) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));

  if (!limitations || limitations.length === 0) return null;

  const getSeverityColors = (severity: 'info' | 'warning') => {
    return severity === 'warning'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="w-full">
      <Accordion
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
        className="px-0"
      >
        <AccordionItem
          key="limitations"
          aria-label="Ver limitaciones"
          title={
            <div className="flex items-center gap-2 cursor-pointer">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-gray-700">Ver limitaciones</span>
              <span className="text-sm text-gray-500">({limitations.length})</span>
            </div>
          }
          className="border border-gray-200 rounded-lg px-4"
        >
          <div className="space-y-3 pb-4">
            {limitations.map((limitation, index) => {
              const IconComponent = iconMap[limitation.icon] || Info;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getSeverityColors(limitation.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{limitation.category}</h4>
                      <p className="text-sm mb-2">{limitation.description}</p>
                      {limitation.alternative && (
                        <div className="mt-2 pt-2 border-t border-current/20">
                          <p className="text-sm font-medium">
                            Alternativa: {limitation.alternative}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
