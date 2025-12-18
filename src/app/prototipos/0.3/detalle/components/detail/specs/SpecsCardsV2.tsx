'use client';

/**
 * SpecsCardsV2 - Cards Grid con Icono + Label
 *
 * Caracteristicas:
 * - Cards individuales por spec
 * - Iconos prominentes
 * - Grid responsive
 * - Ideal para: visual, scannable
 */

import React, { useState } from 'react';
import { Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, Button } from '@nextui-org/react';
import { HelpCircle, Cpu, Battery, Monitor, HardDrive, Wifi, X, Zap, MemoryStick } from 'lucide-react';
import { SpecsProps, SpecItem } from '../../../types/detail';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Battery,
  Monitor,
  HardDrive,
  Wifi,
  Zap,
  MemoryStick: MemoryStick,
};

export const SpecsCardsV2: React.FC<SpecsProps> = ({ specs, tooltipsVersion }) => {
  const [selectedSpec, setSelectedSpec] = useState<SpecItem | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Aplanar todas las specs para mostrarlas en grid
  const allSpecs = specs.flatMap((category) =>
    category.specs.map((spec) => ({
      ...spec,
      categoryIcon: category.icon,
      categoryName: category.category,
    }))
  );

  const visibleSpecs = showAll ? allSpecs : allSpecs.slice(0, 12);
  const remainingCount = allSpecs.length - 12;

  return (
    <div className="space-y-6">
      {/* Grid de cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visibleSpecs.map((spec, index) => {
          const IconComponent = iconMap[spec.categoryIcon] || Cpu;

          return (
            <Card
              key={index}
              isPressable={!!spec.tooltip && tooltipsVersion === 2}
              onPress={() => spec.tooltip && tooltipsVersion === 2 && setSelectedSpec(spec)}
              className={`border transition-all cursor-pointer ${
                spec.highlight
                  ? 'border-[#4654CD]/30 bg-[#4654CD]/5'
                  : 'border-neutral-200 hover:border-[#4654CD]/30'
              }`}
            >
              <CardBody className="p-4 text-center">
                {/* Icono */}
                <div
                  className={`w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${
                    spec.highlight ? 'bg-[#4654CD]/20' : 'bg-neutral-100'
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 ${
                      spec.highlight ? 'text-[#4654CD]' : 'text-neutral-500'
                    }`}
                  />
                </div>

                {/* Valor */}
                <p
                  className={`text-lg font-bold mb-1 ${
                    spec.highlight ? 'text-[#4654CD]' : 'text-neutral-800'
                  }`}
                >
                  {spec.value}
                </p>

                {/* Label */}
                <p className="text-xs text-neutral-500 flex items-center justify-center gap-1">
                  {spec.label}
                  {spec.tooltip && tooltipsVersion === 1 && (
                    <HelpCircle className="w-3 h-3 text-neutral-400" />
                  )}
                </p>

                {/* Texto explicativo siempre visible (version 3) */}
                {spec.tooltip && tooltipsVersion === 3 && (
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                    {spec.tooltip}
                  </p>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Ver mas */}
      {!showAll && remainingCount > 0 && (
        <div className="text-center">
          <Button
            variant="flat"
            onPress={() => setShowAll(true)}
            className="bg-[#4654CD]/10 text-[#4654CD] font-medium cursor-pointer"
          >
            Ver {remainingCount} especificaciones mas
          </Button>
        </div>
      )}

      {showAll && allSpecs.length > 12 && (
        <div className="text-center">
          <Button
            variant="flat"
            onPress={() => setShowAll(false)}
            className="bg-neutral-100 text-neutral-600 font-medium cursor-pointer"
          >
            Mostrar menos
          </Button>
        </div>
      )}

      {/* Modal de explicacion (version 2) */}
      <Modal
        isOpen={!!selectedSpec && tooltipsVersion === 2}
        onClose={() => setSelectedSpec(null)}
        backdrop="blur"
        scrollBehavior="outside"
        placement="center"
        classNames={{
          base: 'bg-white my-8',
          wrapper: 'items-center justify-center py-8 min-h-full',
          backdrop: 'bg-black/50',
          closeButton: 'cursor-pointer',
        }}
      >
        <ModalContent className="bg-white">
          <ModalHeader className="flex items-center gap-3 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800">{selectedSpec?.label}</h3>
              <p className="text-sm text-neutral-500">{selectedSpec?.value}</p>
            </div>
          </ModalHeader>
          <ModalBody className="bg-white py-6">
            <p className="text-neutral-700 leading-relaxed">{selectedSpec?.tooltip}</p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SpecsCardsV2;
