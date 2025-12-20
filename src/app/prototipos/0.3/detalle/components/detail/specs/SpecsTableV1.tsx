'use client';

/**
 * SpecsTableV1 - Tabla 2 Columnas (Spec | Valor)
 *
 * Caracteristicas:
 * - Formato tabla tradicional
 * - Headers de seccion
 * - Filas alternadas
 * - Ideal para: lectura rapida, comparacion
 */

import React, { useState } from 'react';
import { Tooltip, Button, Chip } from '@nextui-org/react';
import { HelpCircle, ChevronDown, ChevronUp, Cpu, Battery, Monitor, HardDrive, Wifi } from 'lucide-react';
import { SpecsProps } from '../../../types/detail';

const iconMap: Record<string, React.ElementType> = {
  Cpu,
  Battery,
  Monitor,
  HardDrive,
  Wifi,
  MemoryStick: Cpu,
};

export const SpecsTableV1: React.FC<SpecsProps> = ({ specs, tooltipsVersion }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    specs.map((s) => s.category)
  );
  const [showAll, setShowAll] = useState(false);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Mostrar solo top 15 specs si no showAll
  const getVisibleSpecs = () => {
    if (showAll) return specs;

    let count = 0;
    const maxSpecs = 15;
    const filtered = specs.map((category) => ({
      ...category,
      specs: category.specs.filter(() => {
        if (count >= maxSpecs) return false;
        count++;
        return true;
      }),
    })).filter((cat) => cat.specs.length > 0);

    return filtered;
  };

  const visibleSpecs = getVisibleSpecs();
  const totalSpecs = specs.reduce((acc, cat) => acc + cat.specs.length, 0);

  const renderTooltip = (spec: { tooltip?: string; label: string }) => {
    if (!spec.tooltip) return null;

    if (tooltipsVersion === 1) {
      return (
        <Tooltip
          content={spec.tooltip}
          classNames={{
            base: 'max-w-xs',
            content: 'bg-neutral-800 text-white text-sm py-2 px-3 rounded-lg',
          }}
        >
          <button className="ml-1 cursor-help">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400 hover:text-[#4654CD] transition-colors" />
          </button>
        </Tooltip>
      );
    }

    if (tooltipsVersion === 2) {
      return (
        <button className="ml-2 text-xs text-[#4654CD] hover:underline cursor-pointer">
          ¿Que significa?
        </button>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {visibleSpecs.map((category) => {
        const IconComponent = iconMap[category.icon] || Cpu;
        const isExpanded = expandedCategories.includes(category.category);

        return (
          <div
            key={category.category}
            className="border border-neutral-200 rounded-xl overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.category)}
              className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-[#4654CD]" />
                </div>
                <span className="font-semibold text-neutral-800">{category.category}</span>
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: 'bg-neutral-200 h-5',
                    content: 'text-neutral-600 text-xs font-medium px-0',
                  }}
                >
                  {category.specs.length}
                </Chip>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-neutral-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              )}
            </button>

            {/* Specs Table */}
            {isExpanded && (
              <div className="divide-y divide-neutral-100">
                {category.specs.map((spec, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 ${
                      spec.highlight
                        ? 'bg-[#4654CD]/5'
                        : index % 2 === 0
                        ? 'bg-white'
                        : 'bg-neutral-50/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-neutral-600">{spec.label}</span>
                      {renderTooltip(spec)}
                    </div>
                    <span
                      className={`font-medium ${
                        spec.highlight ? 'text-[#4654CD]' : 'text-neutral-800'
                      }`}
                    >
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Texto explicativo siempre visible (version 3) */}
      {tooltipsVersion === 3 && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Las especificaciones resaltadas son las mas importantes
            para el uso universitario tipico.
          </p>
        </div>
      )}

      {/* Ver todas las specs */}
      {!showAll && totalSpecs > 15 && (
        <div className="text-center pt-4">
          <Button
            variant="flat"
            onPress={() => setShowAll(true)}
            className="bg-[#4654CD]/10 text-[#4654CD] font-medium cursor-pointer"
          >
            Ver todas las especificaciones ({totalSpecs - 15} mas)
          </Button>
        </div>
      )}

      {showAll && (
        <div className="text-center pt-4">
          <Button
            variant="flat"
            onPress={() => setShowAll(false)}
            className="bg-neutral-100 text-neutral-600 font-medium cursor-pointer"
          >
            Mostrar menos
          </Button>
        </div>
      )}
    </div>
  );
};

export default SpecsTableV1;
