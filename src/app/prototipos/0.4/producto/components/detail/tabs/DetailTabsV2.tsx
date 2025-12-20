'use client';

/**
 * DetailTabsV2 - Tabs Horizontales Clásicos
 *
 * Classic horizontal tabs layout using NextUI Tabs component.
 * Clean and familiar interface pattern.
 */

import React from 'react';
import { Tabs, Tab, Accordion, AccordionItem } from '@nextui-org/react';
import { Cpu, FileText, Award } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';
import { mockCertifications } from '../../../data/mockDetailData';

export const DetailTabsV2: React.FC<DetailTabsProps> = ({ product }) => {
  return (
    <div className="w-full">
      <Tabs
        aria-label="Product details tabs"
        color="primary"
        variant="underlined"
        classNames={{
          tabList: 'gap-6 w-full relative rounded-none p-0 border-b border-neutral-200',
          cursor: 'w-full bg-[#4654CD]',
          tab: 'max-w-fit px-0 h-12 cursor-pointer',
          tabContent: 'group-data-[selected=true]:text-[#4654CD]',
        }}
      >
        {/* Especificaciones Tab */}
        <Tab
          key="specs"
          title={
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span className="font-medium">Especificaciones</span>
            </div>
          }
        >
          <div className="py-6">
            <Accordion variant="bordered" className="px-0">
              {product.specs.map((specCategory, index) => (
                <AccordionItem
                  key={index}
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">
                        {specCategory.category}
                      </span>
                    </div>
                  }
                  classNames={{
                    base: 'border-neutral-200',
                    title: 'text-sm',
                    content: 'pb-4',
                  }}
                >
                  <div className="space-y-3">
                    {specCategory.specs.map((spec, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start gap-4 py-2"
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
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Tab>

        {/* Descripción Tab */}
        <Tab
          key="description"
          title={
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Descripción</span>
            </div>
          }
        >
          <div className="py-6">
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
          </div>
        </Tab>

        {/* Certificaciones Tab */}
        <Tab
          key="certifications"
          title={
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="font-medium">Certificaciones</span>
            </div>
          }
        >
          <div className="py-6">
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
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default DetailTabsV2;
