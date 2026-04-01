'use client';

/**
 * ConvenioFaq - Acordeón con iconos de categoría estilo convenio
 * Adaptado de v0.5 al sistema API-driven de v0.6
 * - Acordeón nativo (sin NextUI Accordion para estilo limpio)
 * - Iconos de categoría con color primario
 * - Datos desde API (landing_faq)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Percent,
  UserCheck,
  Clock,
  Truck,
  HelpCircle,
  CreditCard,
  Shield,
  FileText,
  ClipboardCheck,
} from 'lucide-react';
import type { FaqData, AgreementData } from '../../../types/hero';

interface ConvenioFaqProps {
  data: FaqData;
  agreementData: AgreementData;
}

const categoryIcons: Record<string, React.ElementType> = {
  // Spanish categories
  descuento: Percent,
  descuentos: Percent,
  verificacion: UserCheck,
  verificación: UserCheck,
  proceso: Clock,
  entrega: Truck,
  envío: Truck,
  envio: Truck,
  general: HelpCircle,
  pagos: CreditCard,
  requisitos: ClipboardCheck,
  garantía: Shield,
  garantia: Shield,
  documentos: FileText,
  // English categories (from backend)
  Descuento: Percent,
  Verificación: UserCheck,
  Proceso: Clock,
  Entrega: Truck,
  General: HelpCircle,
  Pagos: CreditCard,
  Requisitos: ClipboardCheck,
  Garantía: Shield,
  Envío: Truck,
};

export const ConvenioFaq: React.FC<ConvenioFaqProps> = ({ data, agreementData }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const institutionShortName = agreementData.institution_short_name || agreementData.institution_name || '';

  const getIcon = (category?: string): React.ElementType => {
    if (!category) return HelpCircle;
    // Try custom icons from backend first
    if (data.categoryIcons) {
      const backendIcon = data.categoryIcons[category];
      if (backendIcon && categoryIcons[backendIcon]) return categoryIcons[backendIcon];
    }
    return categoryIcons[category] || categoryIcons[category.toLowerCase()] || HelpCircle;
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-neutral-50 scroll-mt-24">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 font-['Baloo_2']"
            style={{ color: 'var(--color-primary, #4654CD)' }}
          >
            {data.title || 'Preguntas frecuentes'}
          </h2>
          <p className="text-neutral-600">
            {data.subtitle || `Resolvemos tus dudas sobre el convenio ${institutionShortName}`}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {data.items.map((faq, index) => {
            const Icon = getIcon(faq.category);
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
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: 'var(--color-primary, #4654CD)' }} />
                  </div>
                  <span className="flex-1 font-medium text-neutral-800">
                    {faq.question}
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
                      <div
                        className="px-5 pb-5 pl-[4.5rem]"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
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
