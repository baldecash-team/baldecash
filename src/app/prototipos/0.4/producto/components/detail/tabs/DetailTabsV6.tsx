'use client';

/**
 * DetailTabsV6 - Tabs con Preview on Hover
 *
 * Modern tabs with content preview on hover.
 * Shows a tooltip-like preview before clicking.
 */

import React, { useState } from 'react';
import { Tooltip } from '@nextui-org/react';
import { Cpu, FileText, Award, Eye } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';
import { mockCertifications } from '../../../data/mockDetailData';

type TabId = 'specs' | 'description' | 'certifications';

export const DetailTabsV6: React.FC<DetailTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<TabId>('specs');

  const tabs = [
    {
      id: 'specs' as TabId,
      label: 'Especificaciones',
      icon: Cpu,
      preview: `${product.specs.length} categorías · ${product.specs.reduce(
        (acc, cat) => acc + cat.specs.length,
        0
      )} especificaciones`,
    },
    {
      id: 'description' as TabId,
      label: 'Descripción',
      icon: FileText,
      preview: product.shortDescription || product.description.substring(0, 80) + '...',
    },
    {
      id: 'certifications' as TabId,
      label: 'Certificaciones',
      icon: Award,
      preview: `${mockCertifications.length} certificaciones verificadas`,
    },
  ];

  return (
    <div className="w-full">
      {/* Tabs with Hover Preview */}
      <div className="border-b border-neutral-200 mb-6">
        <div className="flex gap-2 md:gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Tooltip
                key={tab.id}
                content={
                  <div className="p-3 max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-[#4654CD]" />
                      <span className="text-xs font-semibold text-neutral-700">Vista previa</span>
                    </div>
                    <p className="text-xs text-neutral-600">{tab.preview}</p>
                  </div>
                }
                classNames={{
                  content: 'bg-white shadow-lg border border-neutral-200',
                }}
                delay={300}
                closeDelay={0}
              >
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#4654CD] text-[#4654CD]'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={`font-medium text-sm md:text-base ${isActive ? 'font-semibold' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {/* Especificaciones Content */}
        {activeTab === 'specs' && (
          <div className="animate-in fade-in duration-300">
            <div className="space-y-6">
              {product.specs.map((specCategory, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                    <h3 className="text-sm font-semibold text-neutral-900">
                      {specCategory.category}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {specCategory.specs.map((spec, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-2 hover:bg-neutral-50 px-2 rounded transition-colors"
                        >
                          <span className="text-sm text-neutral-600">
                            {spec.label}
                          </span>
                          <span
                            className={`text-sm ${
                              spec.highlight
                                ? 'font-semibold text-neutral-900 bg-[#4654CD]/10 px-2 py-0.5 rounded'
                                : 'text-neutral-700'
                            }`}
                          >
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Descripción Content */}
        {activeTab === 'description' && (
          <div className="animate-in fade-in duration-300">
            <div className="prose prose-sm max-w-none">
              <p className="text-neutral-700 leading-relaxed text-base">
                {product.description}
              </p>

              {product.features.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Características Destacadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.features.map((feature, index) => (
                      <Tooltip
                        key={index}
                        content={
                          <div className="p-2 max-w-xs">
                            <p className="text-xs text-neutral-600">{feature.description}</p>
                          </div>
                        }
                        classNames={{
                          content: 'bg-white shadow-lg border border-neutral-200',
                        }}
                      >
                        <div className="flex gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer">
                          <div className="shrink-0 w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                            <span className="text-lg">{feature.icon}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-neutral-900">
                              {feature.title}
                            </h4>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              Hover para más info
                            </p>
                          </div>
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certificaciones Content */}
        {activeTab === 'certifications' && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCertifications.map((cert) => (
                <Tooltip
                  key={cert.code}
                  content={
                    <div className="p-3 max-w-xs">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {cert.description}
                      </p>
                      {cert.learnMoreUrl && (
                        <p className="text-xs text-[#4654CD] mt-2">Click para más información</p>
                      )}
                    </div>
                  }
                  classNames={{
                    content: 'bg-white shadow-lg border border-neutral-200',
                  }}
                >
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all cursor-pointer text-center">
                    <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-[#4654CD]" />
                    </div>
                    <h4 className="text-sm font-semibold text-neutral-900">
                      {cert.name}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1">
                      Hover para detalles
                    </p>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailTabsV6;
