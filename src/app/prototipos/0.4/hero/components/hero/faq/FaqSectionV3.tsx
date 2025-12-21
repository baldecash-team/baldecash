'use client';

/**
 * FaqSectionV3 - Grid de Cards
 *
 * Concepto: Cards con preview que expanden en su lugar
 * Estilo: Grid limpio, expansión suave sin reflow
 * Uso: Visualización compacta con acceso rápido a respuestas
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { HelpCircle, Plus, Minus } from 'lucide-react';
import { FaqSectionProps } from '../../../types/hero';
import { mockFaqData } from '../../../data/mockHeroData';
import { UnderlinedText } from '../common/UnderlinedText';

export const FaqSectionV3: React.FC<FaqSectionProps> = ({ data = mockFaqData, underlineStyle = 4 }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 font-['Baloo_2'] mb-4">
            ¿Tienes{' '}
            <UnderlinedText style={underlineStyle} color="primary">
              dudas
            </UnderlinedText>
            ?
          </h2>
          <p className="text-neutral-600">Haz click en una pregunta para ver la respuesta</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((item, i) => {
            const isExpanded = expandedId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="h-fit"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className={`w-full text-left bg-white rounded-xl border p-5 transition-all duration-200 cursor-pointer ${
                    isExpanded
                      ? 'border-[#4654CD] shadow-lg shadow-[#4654CD]/10 ring-1 ring-[#4654CD]/20'
                      : 'border-neutral-200 hover:border-[#4654CD]/40 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        isExpanded ? 'bg-[#4654CD] scale-105' : 'bg-[#4654CD]/10'
                      }`}
                    >
                      <HelpCircle
                        className={`w-5 h-5 transition-colors ${isExpanded ? 'text-white' : 'text-[#4654CD]'}`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className={`font-medium transition-colors ${
                            isExpanded ? 'text-[#4654CD]' : 'text-neutral-800'
                          }`}
                        >
                          {item.question}
                        </h3>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                            isExpanded ? 'bg-[#4654CD] rotate-0' : 'bg-neutral-100 rotate-0'
                          }`}
                        >
                          {isExpanded ? (
                            <Minus className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-neutral-500" />
                          )}
                        </div>
                      </div>

                      {/* Preview (when collapsed) */}
                      <AnimatePresence mode="wait">
                        {!isExpanded && (
                          <motion.p
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="text-sm text-neutral-400 mt-2 line-clamp-2"
                          >
                            {item.answer}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Full answer (when expanded) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 border-t border-neutral-100">
                              <p className="text-neutral-600 leading-relaxed">{item.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <Button
            variant="bordered"
            radius="lg"
            className="border-[#4654CD] text-[#4654CD] hover:bg-[#4654CD]/5 cursor-pointer"
          >
            Ver todas las preguntas
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSectionV3;
