'use client';

/**
 * ConvenioFaqV2 - Acordeón con iconos de categoría
 * Version: V2 - FAQ con iconos que representan cada categoría
 */

import React from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Percent, UserCheck, ClipboardList, Truck, HelpCircle } from 'lucide-react';
import { ConvenioFaqProps } from '../../types/convenio';
import { getFaqsByConvenio } from '../../data/mockConvenioData';

const categoryIcons: Record<string, React.ElementType> = {
  descuento: Percent,
  verificacion: UserCheck,
  proceso: ClipboardList,
  entrega: Truck,
  general: HelpCircle,
};

export const ConvenioFaqV2: React.FC<ConvenioFaqProps> = ({
  convenio,
  faqs,
}) => {
  const faqsList = faqs || getFaqsByConvenio(convenio);

  return (
    <section id="faq" className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            Preguntas frecuentes
          </h2>
          <p className="text-neutral-600">
            Todo lo que necesitas saber sobre el convenio {convenio.nombreCorto}.
          </p>
        </div>

        {/* FAQ Accordion with category icons */}
        <Accordion
          variant="bordered"
          selectionMode="multiple"
          className="border-none"
        >
          {faqsList.map((faq) => {
            const IconComponent = categoryIcons[faq.categoria || 'general'] || HelpCircle;

            return (
              <AccordionItem
                key={faq.id}
                aria-label={faq.pregunta}
                title={
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${convenio.colorPrimario}15` }}
                    >
                      <IconComponent
                        className="w-4 h-4"
                        style={{ color: convenio.colorPrimario }}
                      />
                    </div>
                    <span className="text-neutral-800 font-medium text-left">
                      {faq.pregunta}
                    </span>
                  </div>
                }
                classNames={{
                  base: 'border-b border-neutral-100',
                  trigger: 'py-5',
                  title: 'text-base',
                  content: 'pb-5 pt-0 text-neutral-600',
                  indicator: 'text-neutral-400',
                }}
              >
                <p className="text-sm leading-relaxed pl-11">{faq.respuesta}</p>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Category legend */}
        <div className="mt-8 pt-6 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 mb-3">Categorías:</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(categoryIcons).map(([key, Icon]) => (
              <div key={key} className="flex items-center gap-1 text-xs text-neutral-500">
                <Icon className="w-3 h-3" />
                <span className="capitalize">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConvenioFaqV2;
