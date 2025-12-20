'use client';

/**
 * ConvenioFaqV1 - Acordeón simple
 * Version: V1 - FAQ en formato acordeón básico
 */

import React from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { HelpCircle } from 'lucide-react';
import { ConvenioFaqProps } from '../../types/convenio';
import { getFaqsByConvenio } from '../../data/mockConvenioData';

export const ConvenioFaqV1: React.FC<ConvenioFaqProps> = ({
  convenio,
  faqs,
}) => {
  const faqsList = faqs || getFaqsByConvenio(convenio);

  return (
    <section id="faq" className="py-16 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            ¿Tienes dudas?
          </h2>
          <p className="text-neutral-600">
            Respuestas a las preguntas más frecuentes sobre el convenio {convenio.nombreCorto}.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion
          variant="splitted"
          selectionMode="multiple"
          className="gap-3"
        >
          {faqsList.map((faq) => (
            <AccordionItem
              key={faq.id}
              aria-label={faq.pregunta}
              title={
                <span className="text-neutral-800 font-medium">{faq.pregunta}</span>
              }
              startContent={
                <HelpCircle
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: convenio.colorPrimario }}
                />
              }
              classNames={{
                base: 'bg-white shadow-sm',
                trigger: 'py-4 px-5',
                title: 'text-base',
                content: 'px-5 pb-4 pt-0 text-neutral-600',
              }}
            >
              <p className="text-sm leading-relaxed">{faq.respuesta}</p>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-10 text-center">
          <p className="text-neutral-500 text-sm mb-3">
            ¿No encontraste lo que buscabas?
          </p>
          <a
            href="https://wa.me/51999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#4654CD] font-medium hover:underline cursor-pointer"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default ConvenioFaqV1;
