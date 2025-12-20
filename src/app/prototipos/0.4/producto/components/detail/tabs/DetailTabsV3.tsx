'use client';

/**
 * DetailTabsV3 - Acordeón Colapsable
 *
 * All sections in a single accordion layout. Each section can be
 * collapsed/expanded independently. Great for mobile-first design.
 */

import React from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Cpu, FileText, Award, ChevronDown } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';
import { mockCertifications } from '../../../data/mockDetailData';

export const DetailTabsV3: React.FC<DetailTabsProps> = ({ product }) => {
  return (
    <div className="w-full">
      <Accordion
        variant="splitted"
        defaultExpandedKeys={['specs']}
        className="px-0"
        itemClasses={{
          base: 'bg-white border border-neutral-200 rounded-lg shadow-sm',
          title: 'font-semibold text-neutral-900 font-["Baloo_2"]',
          trigger: 'py-4 px-5 cursor-pointer hover:bg-neutral-50',
          content: 'px-5 pb-5',
        }}
      >
        {/* Especificaciones Accordion */}
        <AccordionItem
          key="specs"
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#4654CD]" />
              </div>
              <span className="text-base">Especificaciones Técnicas</span>
            </div>
          }
          indicator={<ChevronDown className="w-5 h-5 text-neutral-500" />}
        >
          <div className="space-y-3">
            {product.specs.map((specCategory, index) => (
              <div key={index} className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {specCategory.category}
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {specCategory.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start gap-4 py-1"
                    >
                      <span className="text-sm text-neutral-600 min-w-[120px]">
                        {spec.label}
                      </span>
                      <span
                        className={`text-sm text-right ${
                          spec.highlight
                            ? 'font-semibold text-neutral-900'
                            : 'text-neutral-700'
                        }`}
                      >
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AccordionItem>

        {/* Descripción Accordion */}
        <AccordionItem
          key="description"
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#4654CD]" />
              </div>
              <span className="text-base">Descripción del Producto</span>
            </div>
          }
          indicator={<ChevronDown className="w-5 h-5 text-neutral-500" />}
        >
          <div className="prose prose-sm max-w-none">
            <p className="text-neutral-700 leading-relaxed">{product.description}</p>

            {product.features.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-200"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                      <span className="text-lg">{feature.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-neutral-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AccordionItem>

        {/* Certificaciones Accordion */}
        <AccordionItem
          key="certifications"
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#4654CD]" />
              </div>
              <span className="text-base">Certificaciones</span>
            </div>
          }
          indicator={<ChevronDown className="w-5 h-5 text-neutral-500" />}
        >
          <div className="space-y-4">
            {mockCertifications.map((cert) => (
              <div
                key={cert.code}
                className="flex gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200"
              >
                <div className="shrink-0 w-16 h-16 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                  <Award className="w-8 h-8 text-[#4654CD]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {cert.description}
                  </p>
                  {cert.learnMoreUrl && (
                    <a
                      href={cert.learnMoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#4654CD] hover:underline mt-2 inline-block cursor-pointer"
                    >
                      Más información
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DetailTabsV3;
