'use client';

/**
 * FaqSectionV1 - Acordeon Simple
 * Basico con animaciones suaves
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { HelpCircle } from 'lucide-react';
import { FaqSectionProps } from '../../../types/hero';
import { mockFaqData } from '../../../data/mockHeroData';
import { UnderlinedText } from '../common/UnderlinedText';

export const FaqSectionV1: React.FC<FaqSectionProps> = ({ data = mockFaqData, underlineStyle = 4 }) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#4654CD]/10 text-[#4654CD] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>¿Tienes dudas?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 font-['Baloo_2']">
            Preguntas{' '}
            <UnderlinedText style={underlineStyle} color="primary">
              frecuentes
            </UnderlinedText>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Accordion
            variant="splitted"
            selectionMode="multiple"
            className="gap-3"
            itemClasses={{
              base: 'bg-neutral-50 border border-neutral-200 rounded-xl px-4 hover:border-[#4654CD]/30 transition-colors',
              title: 'font-medium text-neutral-800',
              trigger: 'py-4 data-[hover=true]:bg-transparent cursor-pointer',
              indicator: 'text-[#4654CD]',
              content: 'pb-4 pt-0 text-neutral-600',
            }}
          >
            {data.items.map((item, i) => (
              <AccordionItem
                key={item.id}
                aria-label={item.question}
                title={item.question}
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.answer}
                </motion.div>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* CTA de contacto */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <p className="text-neutral-600">
            No encontraste tu respuesta?{' '}
            <a
              href="#contacto"
              className="text-[#4654CD] font-medium hover:underline"
            >
              Escribenos por WhatsApp
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSectionV1;
