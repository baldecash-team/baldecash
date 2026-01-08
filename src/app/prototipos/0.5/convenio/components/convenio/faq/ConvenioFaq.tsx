'use client';

/**
 * ConvenioFaq - Acordeón con iconos de categoría (basado en V2)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Percent, UserCheck, Clock, Truck, HelpCircle } from 'lucide-react';
import { ConvenioData } from '../../../types/convenio';
import { getFaqsByConvenio } from '../../../data/mockConvenioData';

interface ConvenioFaqProps {
  convenio: ConvenioData;
}

const categoryIcons: Record<string, React.ElementType> = {
  descuento: Percent,
  verificacion: UserCheck,
  proceso: Clock,
  entrega: Truck,
  general: HelpCircle,
};

export const ConvenioFaq: React.FC<ConvenioFaqProps> = ({ convenio }) => {
  const faqs = getFaqsByConvenio(convenio);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 md:py-24 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            Preguntas frecuentes
          </h2>
          <p className="text-neutral-600">
            Resolvemos tus dudas sobre el convenio {convenio.nombreCorto}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const Icon = categoryIcons[faq.categoria || 'general'] || HelpCircle;
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
              >
                <button
                  className="w-full flex items-center gap-4 p-5 text-left cursor-pointer hover:bg-neutral-50 transition-colors"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${convenio.colorPrimario}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: convenio.colorPrimario }} />
                  </div>
                  <span className="flex-1 font-medium text-neutral-800">
                    {faq.pregunta}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pl-[4.5rem]">
                        <p className="text-neutral-600 leading-relaxed">
                          {faq.respuesta}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ConvenioFaq;
