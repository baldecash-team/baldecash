'use client';

/**
 * FaqSectionV4 - Tabs por Categoria
 * Navegacion por pestanas de categoria
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, Tab, Accordion, AccordionItem, Chip } from '@nextui-org/react';
import { HelpCircle, FileText, CreditCard, Truck, ClipboardCheck } from 'lucide-react';
import { FaqSectionProps } from '../../../types/hero';
import { mockFaqData } from '../../../data/mockHeroData';
import { UnderlinedText } from '../common/UnderlinedText';

const categoryIcons: Record<string, React.ElementType> = {
  Requisitos: ClipboardCheck,
  Proceso: FileText,
  Pagos: CreditCard,
  Envio: Truck,
};

export const FaqSectionV4: React.FC<FaqSectionProps> = ({ data = mockFaqData, underlineStyle = 4 }) => {
  const [selectedCategory, setSelectedCategory] = useState(data.categories?.[0] || 'Requisitos');

  const filteredItems = useMemo(() => {
    return data.items.filter((item) => item.category === selectedCategory);
  }, [data.items, selectedCategory]);

  const getCategoryCount = (category: string) => {
    return data.items.filter((item) => item.category === category).length;
  };

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 font-['Baloo_2'] mb-4">
            ¿Tienes dudas?
          </h2>
          <p className="text-neutral-600">Selecciona una categoria</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            selectedKey={selectedCategory}
            onSelectionChange={(key) => setSelectedCategory(key as string)}
            variant="underlined"
            classNames={{
              base: 'w-full',
              tabList: 'gap-4 w-full justify-center border-b border-neutral-200 pb-0',
              cursor: 'bg-[#4654CD]',
              tab: 'max-w-fit px-4 h-12 cursor-pointer',
              tabContent: 'group-data-[selected=true]:text-[#4654CD] text-neutral-500',
            }}
          >
            {data.categories?.map((category) => {
              const IconComponent = categoryIcons[category] || HelpCircle;
              return (
                <Tab
                  key={category}
                  title={
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{category}</span>
                      <Chip
                        size="sm"
                        radius="full"
                        classNames={{
                          base: 'bg-neutral-200 group-data-[selected=true]:bg-[#4654CD]/20 px-2 min-w-5 h-5',
                          content: 'text-xs text-neutral-600 group-data-[selected=true]:text-[#4654CD]',
                        }}
                      >
                        {getCategoryCount(category)}
                      </Chip>
                    </div>
                  }
                />
              );
            })}
          </Tabs>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <Accordion
              variant="splitted"
              selectionMode="multiple"
              className="gap-3"
              itemClasses={{
                base: 'bg-white border border-neutral-200 rounded-xl px-4 shadow-sm',
                title: 'font-medium text-neutral-800',
                trigger: 'py-4 data-[hover=true]:bg-transparent cursor-pointer',
                indicator: 'text-[#4654CD]',
                content: 'pb-4 pt-0 text-neutral-600',
              }}
            >
              {filteredItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  aria-label={item.question}
                  title={item.question}
                >
                  {item.answer}
                </AccordionItem>
              ))}
            </Accordion>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                <p>No hay preguntas en esta categoria</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FaqSectionV4;
