'use client';

/**
 * DetailTabsV4 - Tabs con Iconos Animados
 *
 * Horizontal tabs with animated icons that scale and change color
 * on selection. Engaging and modern interaction pattern.
 */

import React, { useState } from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Cpu, FileText, Award } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';
import { mockCertifications } from '../../../data/mockDetailData';

type TabId = 'specs' | 'description' | 'certifications';

export const DetailTabsV4: React.FC<DetailTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<TabId>('specs');

  const tabs = [
    { id: 'specs' as TabId, label: 'Especificaciones', icon: Cpu },
    { id: 'description' as TabId, label: 'Descripción', icon: FileText },
    { id: 'certifications' as TabId, label: 'Certificaciones', icon: Award },
  ];

  return (
    <div className="w-full">
      {/* Animated Icon Tabs */}
      <div className="border-b border-neutral-200 mb-6">
        <div className="flex gap-2 md:gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#4654CD] text-[#4654CD]'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                <Icon
                  className={`transition-all duration-300 ${
                    isActive
                      ? 'w-5 h-5 scale-110 animate-pulse'
                      : 'w-4 h-4'
                  }`}
                />
                <span className={`font-medium text-sm md:text-base ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {/* Especificaciones Content */}
        {activeTab === 'specs' && (
          <div className="animate-in fade-in duration-300">
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
        )}

        {/* Descripción Content */}
        {activeTab === 'description' && (
          <div className="animate-in fade-in duration-300">
            <div className="prose prose-sm max-w-none">
              <p className="text-neutral-700 leading-relaxed">{product.description}</p>

              {product.features.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-200 hover:border-[#4654CD] transition-colors cursor-pointer"
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
        )}

        {/* Certificaciones Content */}
        {activeTab === 'certifications' && (
          <div className="animate-in fade-in duration-300">
            <div className="space-y-4">
              {mockCertifications.map((cert) => (
                <div
                  key={cert.code}
                  className="flex gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200 hover:border-[#4654CD] transition-colors cursor-pointer"
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
                        className="text-xs text-[#4654CD] hover:underline mt-2 inline-block"
                      >
                        Más información
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailTabsV4;
