'use client';

/**
 * DetailTabsV5 - Split Layout
 *
 * Information on the left, tab content on the right.
 * Desktop-optimized layout for larger screens.
 */

import React, { useState } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Cpu, FileText, Award, ChevronRight } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';
import { mockCertifications } from '../../../data/mockDetailData';

type TabId = 'specs' | 'description' | 'certifications';

export const DetailTabsV5: React.FC<DetailTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<TabId>('specs');

  const tabs = [
    { id: 'specs' as TabId, label: 'Especificaciones', icon: Cpu },
    { id: 'description' as TabId, label: 'Descripción', icon: FileText },
    { id: 'certifications' as TabId, label: 'Certificaciones', icon: Award },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side - Navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-neutral-50 border border-neutral-200">
            <CardBody className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#4654CD] text-white'
                          : 'text-neutral-600 hover:bg-white hover:text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{tab.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </CardBody>
          </Card>
        </div>

        {/* Right Side - Content */}
        <div className="lg:col-span-3">
          <Card className="border border-neutral-200">
            <CardBody className="p-6">
              {/* Especificaciones Content */}
              {activeTab === 'specs' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Especificaciones Técnicas
                  </h3>
                  <div className="space-y-6">
                    {product.specs.map((specCategory, index) => (
                      <div key={index}>
                        <h4 className="text-sm font-semibold text-[#4654CD] mb-3">
                          {specCategory.category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {specCategory.specs.map((spec, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center py-2 px-3 rounded-lg bg-neutral-50"
                            >
                              <span className="text-sm text-neutral-600">
                                {spec.label}
                              </span>
                              <span
                                className={`text-sm ${
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
                </div>
              )}

              {/* Descripción Content */}
              {activeTab === 'description' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Descripción del Producto
                  </h3>
                  <p className="text-neutral-700 leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {product.features.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold text-[#4654CD] mb-3">
                        Características Destacadas
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex gap-3 p-4 rounded-lg bg-neutral-50"
                          >
                            <div className="shrink-0 w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                              <span className="text-lg">{feature.icon}</span>
                            </div>
                            <div>
                              <h5 className="text-sm font-semibold text-neutral-900">
                                {feature.title}
                              </h5>
                              <p className="text-xs text-neutral-600 mt-1">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Certificaciones Content */}
              {activeTab === 'certifications' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Certificaciones y Garantías
                  </h3>
                  <div className="space-y-4">
                    {mockCertifications.map((cert) => (
                      <div
                        key={cert.code}
                        className="flex gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200"
                      >
                        <div className="shrink-0 w-14 h-14 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                          <Award className="w-7 h-7 text-[#4654CD]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-neutral-900 mb-1">
                            {cert.name}
                          </h4>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {cert.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DetailTabsV5;
