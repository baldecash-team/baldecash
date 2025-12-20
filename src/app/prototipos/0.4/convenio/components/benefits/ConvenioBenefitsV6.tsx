'use client';

/**
 * ConvenioBenefitsV6 - Tabs de beneficios
 * Version: V6 - Beneficios organizados en tabs por categoría
 */

import React, { useState } from 'react';
import { Tabs, Tab, Card, CardBody } from '@nextui-org/react';
import { Percent, Clock, Shield, Truck, CreditCard, Calendar, Wallet, GraduationCap, Zap } from 'lucide-react';
import { ConvenioBenefitsProps } from '../../types/convenio';
import { getBenefitsByConvenio } from '../../data/mockConvenioData';

const iconMap: Record<string, React.ElementType> = {
  Percent,
  Clock,
  Shield,
  Truck,
  CreditCard,
  Calendar,
};

interface BenefitCategory {
  key: string;
  label: string;
  icon: React.ElementType;
  benefits: number[]; // indices of benefits
}

export const ConvenioBenefitsV6: React.FC<ConvenioBenefitsProps> = ({
  convenio,
  benefits,
}) => {
  const beneficiosList = benefits || getBenefitsByConvenio(convenio);
  const [selectedTab, setSelectedTab] = useState('ahorro');

  // Categorize benefits
  const categories: BenefitCategory[] = [
    {
      key: 'ahorro',
      label: 'Ahorro',
      icon: Wallet,
      benefits: [0, 4], // First and fifth benefit
    },
    {
      key: 'proceso',
      label: 'Proceso',
      icon: Zap,
      benefits: [1, 3], // Second and fourth benefit
    },
    {
      key: 'requisitos',
      label: 'Requisitos',
      icon: GraduationCap,
      benefits: [2, 5], // Third and sixth benefit
    },
  ];

  const getCurrentBenefits = () => {
    const category = categories.find((c) => c.key === selectedTab);
    if (!category) return [];
    return category.benefits.map((i) => beneficiosList[i]).filter(Boolean);
  };

  return (
    <section id="beneficios" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            Descubre tus beneficios
          </h2>
          <p className="text-neutral-600">
            Explora las ventajas exclusivas de tu convenio {convenio.nombreCorto}.
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          classNames={{
            base: 'w-full',
            tabList: 'gap-2 w-full relative rounded-xl p-1 bg-neutral-100',
            cursor: 'bg-white shadow-sm',
            tab: 'max-w-fit px-6 h-10',
            tabContent: 'group-data-[selected=true]:text-[#4654CD]',
          }}
          variant="solid"
        >
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <Tab
                key={category.key}
                title={
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </div>
                }
              />
            );
          })}
        </Tabs>

        {/* Benefits content */}
        <div className="mt-8 space-y-4">
          {getCurrentBenefits().map((beneficio) => {
            const IconComponent = iconMap[beneficio.icon] || Shield;

            return (
              <Card key={beneficio.id} className="border border-neutral-200">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${convenio.colorPrimario}15` }}
                    >
                      <IconComponent
                        className="w-6 h-6"
                        style={{ color: convenio.colorPrimario }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800 mb-2">
                        {beneficio.titulo}
                      </h3>
                      <p className="text-neutral-600 text-sm">
                        {beneficio.descripcion}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Bottom badge */}
        <div className="mt-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm"
            style={{ backgroundColor: convenio.colorPrimario }}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Todos los beneficios disponibles para @{convenio.dominioEmail}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConvenioBenefitsV6;
