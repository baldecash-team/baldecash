'use client';

/**
 * ConvenioFaqV4 - Tabs por categoría
 * Version: V4 - FAQ organizado en tabs según categoría
 */

import React, { useState } from 'react';
import { Tabs, Tab, Accordion, AccordionItem } from '@nextui-org/react';
import { Percent, UserCheck, ClipboardList, Truck, HelpCircle } from 'lucide-react';
import { ConvenioFaqProps } from '../../types/convenio';
import { getFaqsByConvenio } from '../../data/mockConvenioData';

const categories = [
  { key: 'all', label: 'Todas', icon: HelpCircle },
  { key: 'descuento', label: 'Descuento', icon: Percent },
  { key: 'verificacion', label: 'Verificación', icon: UserCheck },
  { key: 'proceso', label: 'Proceso', icon: ClipboardList },
  { key: 'entrega', label: 'Entrega', icon: Truck },
  { key: 'general', label: 'General', icon: HelpCircle },
];

export const ConvenioFaqV4: React.FC<ConvenioFaqProps> = ({
  convenio,
  faqs,
}) => {
  const faqsList = faqs || getFaqsByConvenio(convenio);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFaqs = selectedCategory === 'all'
    ? faqsList
    : faqsList.filter((faq) => faq.categoria === selectedCategory);

  return (
    <section id="faq" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            Preguntas frecuentes
          </h2>
          <p className="text-neutral-600">
            Filtra por categoría para encontrar rápidamente lo que buscas.
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs
          selectedKey={selectedCategory}
          onSelectionChange={(key) => setSelectedCategory(key as string)}
          classNames={{
            base: 'w-full mb-8',
            tabList: 'gap-2 w-full flex-wrap relative rounded-xl p-1 bg-neutral-100',
            cursor: 'bg-white shadow-sm',
            tab: 'px-4 h-10',
            tabContent: 'group-data-[selected=true]:text-[#4654CD]',
          }}
          variant="solid"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Tab
                key={category.key}
                title={
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </div>
                }
              />
            );
          })}
        </Tabs>

        {/* FAQ Accordion */}
        {filteredFaqs.length > 0 ? (
          <Accordion
            variant="splitted"
            selectionMode="multiple"
            className="gap-3"
          >
            {filteredFaqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                aria-label={faq.pregunta}
                title={
                  <span className="text-neutral-800 font-medium">{faq.pregunta}</span>
                }
                classNames={{
                  base: 'bg-white shadow-sm border border-neutral-100',
                  trigger: 'py-4 px-5',
                  title: 'text-base',
                  content: 'px-5 pb-4 pt-0 text-neutral-600',
                }}
              >
                <p className="text-sm leading-relaxed">{faq.respuesta}</p>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-12 bg-neutral-50 rounded-xl">
            <HelpCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No hay preguntas en esta categoría.</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-10 pt-6 border-t border-neutral-100 flex items-center justify-center gap-6 text-sm text-neutral-500">
          <span>{faqsList.length} preguntas frecuentes</span>
          <span>•</span>
          <span>Convenio {convenio.nombreCorto}</span>
        </div>
      </div>
    </section>
  );
};

export default ConvenioFaqV4;
