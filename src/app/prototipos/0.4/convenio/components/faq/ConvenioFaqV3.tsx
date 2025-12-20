'use client';

/**
 * ConvenioFaqV3 - Grid de cards expandibles
 * Version: V3 - FAQ en formato grid con cards que se expanden
 */

import React, { useState } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ConvenioFaqProps } from '../../types/convenio';
import { getFaqsByConvenio } from '../../data/mockConvenioData';

export const ConvenioFaqV3: React.FC<ConvenioFaqProps> = ({
  convenio,
  faqs,
}) => {
  const faqsList = faqs || getFaqsByConvenio(convenio);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section id="faq" className="py-16 bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            ¿Cómo funciona?
          </h2>
          <p className="text-neutral-600">
            Encuentra respuestas rápidas sobre el convenio {convenio.nombreCorto}.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {faqsList.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);

            return (
              <Card
                key={faq.id}
                className={`border cursor-pointer transition-all ${
                  isExpanded
                    ? 'border-[#4654CD]/30 shadow-md'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                isPressable
                onPress={() => toggleExpanded(faq.id)}
              >
                <CardBody className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className={`font-medium ${
                        isExpanded ? 'text-[#4654CD]' : 'text-neutral-800'
                      }`}
                    >
                      {faq.pregunta}
                    </h3>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#4654CD] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    )}
                  </div>

                  {isExpanded && (
                    <p className="text-neutral-600 text-sm mt-4 pt-4 border-t border-neutral-100 leading-relaxed">
                      {faq.respuesta}
                    </p>
                  )}

                  {!isExpanded && (
                    <p className="text-neutral-400 text-xs mt-2">
                      Clic para ver respuesta
                    </p>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Expand all button */}
        <div className="text-center mt-8">
          <button
            onClick={() => {
              if (expandedIds.size === faqsList.length) {
                setExpandedIds(new Set());
              } else {
                setExpandedIds(new Set(faqsList.map((f) => f.id)));
              }
            }}
            className="text-sm text-[#4654CD] hover:underline cursor-pointer"
          >
            {expandedIds.size === faqsList.length ? 'Cerrar todas' : 'Ver todas las respuestas'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ConvenioFaqV3;
