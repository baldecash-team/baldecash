'use client';

/**
 * ProductLimitationsV2 - Collapsible "Ver limitaciones"
 *
 * Caracteristicas:
 * - Oculto por defecto
 * - Menos prominente
 * - Expandible
 * - Ideal para: usuarios avanzados
 */

import React, { useState } from 'react';
import { Button, Chip, Accordion, AccordionItem } from '@nextui-org/react';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Monitor,
  HardDrive,
  Gamepad2,
  Cpu,
  Battery,
} from 'lucide-react';
import { ProductLimitationsProps } from '../../../types/detail';

const iconMap: Record<string, React.ElementType> = {
  Monitor,
  HardDrive,
  Gamepad2,
  Cpu,
  Battery,
};

export const ProductLimitationsV2: React.FC<ProductLimitationsProps> = ({ limitations }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (limitations.length === 0) return null;

  const warningCount = limitations.filter((l) => l.severity === 'warning').length;

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
            <Info className="w-4 h-4 text-neutral-500" />
          </div>
          <span className="text-neutral-700 font-medium">Ver limitaciones del producto</span>

          {warningCount > 0 && (
            <Chip
              size="sm"
              radius="sm"
              classNames={{
                base: 'bg-amber-100 h-5 px-1.5',
                content: 'text-amber-700 text-xs px-0',
              }}
            >
              {warningCount}
            </Chip>
          )}
        </div>

        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-neutral-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-400" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-4 pt-0 space-y-4">
          <p className="text-sm text-neutral-500 pb-2 border-b border-neutral-100">
            Queremos que tomes una decision informada. Estos son los aspectos a considerar:
          </p>

          <Accordion
            selectionMode="multiple"
            className="px-0"
            itemClasses={{
              base: 'border-b border-neutral-100 last:border-0',
              trigger: 'py-3 cursor-pointer',
              title: 'text-sm',
              content: 'pb-4 pt-0',
            }}
          >
            {limitations.map((limitation, index) => {
              const IconComponent = iconMap[limitation.icon] || AlertCircle;

              return (
                <AccordionItem
                  key={index}
                  aria-label={limitation.category}
                  title={
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`w-4 h-4 ${
                          limitation.severity === 'warning'
                            ? 'text-amber-500'
                            : 'text-neutral-400'
                        }`}
                      />
                      <span className="font-medium text-neutral-700">
                        {limitation.category}
                      </span>
                      {limitation.severity === 'warning' && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                  }
                >
                  <div className="pl-7 space-y-3">
                    <p className="text-neutral-600">{limitation.description}</p>

                    {limitation.alternative && (
                      <div className="flex items-start gap-2 p-3 bg-[#4654CD]/5 rounded-lg">
                        <Lightbulb className="w-4 h-4 text-[#4654CD] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-[#4654CD] font-medium mb-0.5">
                            Alternativa
                          </p>
                          <p className="text-sm text-neutral-600">{limitation.alternative}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Trust message */}
          <div className="p-3 bg-neutral-50 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-500">
              En BaldeCash creemos en la transparencia. Preferimos que conozcas estos
              detalles antes de tu compra.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductLimitationsV2;
