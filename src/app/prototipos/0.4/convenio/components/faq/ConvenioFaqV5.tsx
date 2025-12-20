'use client';

/**
 * ConvenioFaqV5 - Búsqueda + acordeón
 * Version: V5 - FAQ con barra de búsqueda para filtrar preguntas
 */

import React, { useState, useMemo } from 'react';
import { Input, Accordion, AccordionItem } from '@nextui-org/react';
import { Search, HelpCircle, X } from 'lucide-react';
import { ConvenioFaqProps } from '../../types/convenio';
import { getFaqsByConvenio } from '../../data/mockConvenioData';

export const ConvenioFaqV5: React.FC<ConvenioFaqProps> = ({
  convenio,
  faqs,
}) => {
  const faqsList = faqs || getFaqsByConvenio(convenio);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqsList;

    const query = searchQuery.toLowerCase();
    return faqsList.filter(
      (faq) =>
        faq.pregunta.toLowerCase().includes(query) ||
        faq.respuesta.toLowerCase().includes(query)
    );
  }, [faqsList, searchQuery]);

  return (
    <section id="faq" className="py-16 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            ¿Tienes dudas?
          </h2>
          <p className="text-neutral-600">
            Busca tu pregunta o explora las más frecuentes.
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <Input
            placeholder="Buscar pregunta..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search className="w-5 h-5 text-neutral-400" />}
            endContent={
              searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="cursor-pointer hover:bg-neutral-100 p-1 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              )
            }
            classNames={{
              base: 'w-full',
              inputWrapper: 'bg-white border border-neutral-200 hover:border-[#4654CD]/50 h-14 shadow-sm',
              input: 'text-base',
            }}
          />
          {searchQuery && (
            <p className="text-sm text-neutral-500 mt-2">
              {filteredFaqs.length} resultado{filteredFaqs.length !== 1 ? 's' : ''} para "{searchQuery}"
            </p>
          )}
        </div>

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
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
            <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 mb-2">No encontramos resultados para "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#4654CD] text-sm hover:underline cursor-pointer"
            >
              Ver todas las preguntas
            </button>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-10 p-6 bg-white rounded-xl border border-neutral-200 text-center">
          <p className="text-neutral-600 mb-3">
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

export default ConvenioFaqV5;
