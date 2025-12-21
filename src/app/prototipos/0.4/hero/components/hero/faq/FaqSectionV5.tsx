'use client';

/**
 * FaqSectionV5 - Busqueda + Acordeon
 * Campo de busqueda con filtrado en tiempo real
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Accordion, AccordionItem, Chip } from '@nextui-org/react';
import { Search, HelpCircle, X } from 'lucide-react';
import { FaqSectionProps } from '../../../types/hero';
import { mockFaqData } from '../../../data/mockHeroData';
import { UnderlinedText } from '../common/UnderlinedText';

export const FaqSectionV5: React.FC<FaqSectionProps> = ({ data = mockFaqData, underlineStyle = 4 }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return data.items;

    const query = searchQuery.toLowerCase();
    return data.items.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );
  }, [data.items, searchQuery]);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[#03DBD0]/30 text-neutral-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 font-['Baloo_2'] mb-4">
            ¿Tienes dudas?
          </h2>
          <p className="text-neutral-600 mb-8">Busca lo que necesitas saber</p>

          {/* Buscador */}
          <div className="max-w-md mx-auto">
            <Input
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Escribe tu pregunta..."
              size="lg"
              startContent={<Search className="w-5 h-5 text-neutral-400" />}
              endContent={
                searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-neutral-100 rounded-full cursor-pointer"
                  >
                    <X className="w-4 h-4 text-neutral-400" />
                  </button>
                )
              }
              classNames={{
                base: 'bg-white',
                inputWrapper:
                  'bg-neutral-50 border-2 border-neutral-200 hover:border-[#4654CD]/50 focus-within:border-[#4654CD] shadow-sm focus-within:ring-0',
                input: 'text-neutral-800 focus:outline-none',
                innerWrapper: 'focus-within:ring-0',
              }}
            />
          </div>
        </motion.div>

        {/* Resultados */}
        <AnimatePresence mode="wait">
          <motion.div
            key={searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {searchQuery && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-neutral-500">
                  {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} para "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-[#4654CD] hover:underline cursor-pointer"
                >
                  Limpiar busqueda
                </button>
              </div>
            )}

            {filteredItems.length > 0 ? (
              <Accordion
                variant="splitted"
                selectionMode="multiple"
                className="gap-3"
                itemClasses={{
                  base: 'bg-neutral-50 border border-neutral-200 rounded-xl px-4 hover:border-[#4654CD]/30 transition-colors',
                  title: 'font-medium text-neutral-800 text-left',
                  trigger: 'py-4 data-[hover=true]:bg-transparent cursor-pointer',
                  indicator: 'text-[#4654CD]',
                  content: 'pb-4 pt-0 text-neutral-600',
                }}
              >
                {filteredItems.map((item) => (
                  <AccordionItem
                    key={item.id}
                    aria-label={item.question}
                    title={
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{highlightMatch(item.question, searchQuery)}</span>
                        {item.category && (
                          <Chip
                            size="sm"
                            radius="sm"
                            classNames={{
                              base: 'bg-[#4654CD]/10 px-2 py-0.5 h-auto',
                              content: 'text-[#4654CD] text-xs',
                            }}
                          >
                            {item.category}
                          </Chip>
                        )}
                      </div>
                    }
                  >
                    {highlightMatch(item.answer, searchQuery)}
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-neutral-300" />
                </div>
                <p className="text-neutral-600 mb-2">No encontramos resultados</p>
                <p className="text-sm text-neutral-400">
                  Intenta con otras palabras o{' '}
                  <a href="#contacto" className="text-[#4654CD] hover:underline">
                    escribenos
                  </a>
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FaqSectionV5;
