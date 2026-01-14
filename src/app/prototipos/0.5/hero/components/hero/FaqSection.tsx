'use client';

/**
 * FaqSection - Acordeón con Iconos categorizado (basado en V2 de 0.4)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionItem, Chip } from '@nextui-org/react';
import {
  HelpCircle,
  FileText,
  CreditCard,
  Truck,
  ClipboardCheck,
} from 'lucide-react';
import { FaqSectionProps } from '../../types/hero';
import { mockFaqData } from '../../data/mockHeroData';

const categoryIcons: Record<string, React.ElementType> = {
  Requisitos: ClipboardCheck,
  Proceso: FileText,
  Pagos: CreditCard,
  Envío: Truck,
  General: HelpCircle,
  Garantía: ClipboardCheck,
};

const categoryColors: Record<string, string> = {
  Requisitos: '#4654CD',
  Proceso: '#5B68D8',
  Pagos: '#03DBD0',
  Envío: '#22c55e',
  General: '#4654CD',
  Garantía: '#f59e0b',
};

export const FaqSection: React.FC<FaqSectionProps> = ({ data = mockFaqData, underlineStyle = 4 }) => {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 font-['Baloo_2'] mb-4">
            ¿Tienes dudas?
          </h2>
          <p className="text-neutral-600">Respuestas a las preguntas más comunes</p>
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
              base: 'bg-white border border-neutral-200 rounded-xl px-4 shadow-sm hover:shadow-md transition-all',
              title: 'font-medium text-neutral-800 text-left',
              trigger: 'py-4 data-[hover=true]:bg-transparent cursor-pointer',
              indicator: 'text-[#4654CD] transition-transform data-[open=true]:rotate-90',
              content: 'pb-4 pt-0 text-neutral-600',
            }}
          >
            {data.items.map((item) => {
              const IconComponent = categoryIcons[item.category || 'General'] || HelpCircle;
              const color = categoryColors[item.category || 'General'] || '#4654CD';

              return (
                <AccordionItem
                  key={item.id}
                  aria-label={item.question}
                  startContent={
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <IconComponent className="w-5 h-5" style={{ color }} />
                    </div>
                  }
                  title={
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{item.question}</span>
                      <Chip
                        size="sm"
                        radius="sm"
                        classNames={{
                          base: 'px-2 py-0.5 h-auto',
                          content: 'text-xs font-medium',
                        }}
                        style={{
                          backgroundColor: `${color}15`,
                          color: color,
                        }}
                      >
                        {item.category}
                      </Chip>
                    </div>
                  }
                >
                  <div className="pl-14">{item.answer}</div>
                </AccordionItem>
              );
            })}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          {data.categories?.map((cat) => {
            const IconComponent = categoryIcons[cat] || HelpCircle;
            const color = categoryColors[cat] || '#4654CD';
            return (
              <div key={cat} className="flex items-center gap-2 text-sm text-neutral-600">
                <IconComponent className="w-4 h-4" style={{ color }} />
                <span>{cat}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSection;
