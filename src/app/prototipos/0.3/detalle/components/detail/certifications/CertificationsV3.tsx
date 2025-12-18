'use client';

/**
 * CertificationsV3 - Cards Expandibles con Detalle
 *
 * Caracteristicas:
 * - Cards individuales
 * - Descripcion completa
 * - Links externos
 * - Ideal para: info completa, educativo
 */

import React, { useState } from 'react';
import { Card, CardBody, Button, Accordion, AccordionItem } from '@nextui-org/react';
import { Shield, Award, Leaf, Zap, ExternalLink, ChevronRight, Check } from 'lucide-react';
import { CertificationsProps } from '../../../types/detail';

const certIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'energy-star': Zap,
  epeat: Leaf,
  tco: Shield,
  default: Award,
};

const certBenefits: Record<string, string[]> = {
  'energy-star': [
    'Consume menos energia electrica',
    'Reduce tu recibo de luz',
    'Menor impacto ambiental',
  ],
  epeat: [
    'Fabricado con materiales reciclables',
    'Proceso de produccion sostenible',
    'Facil de reciclar al final de su vida util',
  ],
  tco: [
    'Cumple estandares de salud',
    'Materiales seguros',
    'Condiciones laborales justas en fabricacion',
  ],
};

export const CertificationsV3: React.FC<CertificationsProps> = ({ certifications }) => {
  if (certifications.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800">Certificaciones</h3>
            <p className="text-sm text-neutral-500">
              Este producto cumple con estandares internacionales
            </p>
          </div>
        </div>
      </div>

      {/* Certification cards */}
      <Accordion
        selectionMode="multiple"
        className="px-0 gap-3"
        itemClasses={{
          base: 'border border-neutral-200 rounded-xl px-0 shadow-none data-[open=true]:border-green-200 data-[open=true]:bg-green-50/30',
          trigger: 'px-4 py-3 hover:bg-neutral-50 cursor-pointer',
          title: 'text-neutral-800',
          content: 'px-4 pb-4 pt-0',
        }}
      >
        {certifications.map((cert) => {
          const IconComponent = certIconMap[cert.code] || certIconMap.default;
          const benefits = certBenefits[cert.code] || [];

          return (
            <AccordionItem
              key={cert.code}
              aria-label={cert.name}
              title={
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">{cert.name}</p>
                    <p className="text-xs text-neutral-500">{cert.code.toUpperCase()}</p>
                  </div>
                </div>
              }
            >
              <div className="space-y-4 pl-13">
                {/* Description */}
                <p className="text-neutral-600">{cert.description}</p>

                {/* Benefits */}
                {benefits.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-700">Beneficios para ti:</p>
                    <ul className="space-y-1">
                      {benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Learn more */}
                {cert.learnMoreUrl && (
                  <a
                    href={cert.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#4654CD] hover:underline"
                  >
                    Conocer mas sobre {cert.name}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Summary badge */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
        <Shield className="w-8 h-8 text-green-600" />
        <div>
          <p className="font-medium text-green-800">
            {certifications.length} certificaciones verificadas
          </p>
          <p className="text-sm text-green-600">
            Este producto cumple con los mas altos estandares de calidad y sostenibilidad
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificationsV3;
