'use client';

/**
 * FaqSectionV3 - Grid de Cards
 * Preview visible, expande al click
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, Button } from '@nextui-org/react';
import { HelpCircle, ChevronDown, X } from 'lucide-react';
import { FaqSectionProps } from '../../../types/hero';
import { mockFaqData } from '../../../data/mockHeroData';

export const FaqSectionV3: React.FC<FaqSectionProps> = ({ data = mockFaqData }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
            Tienes dudas?
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
                layout
                className={isExpanded ? 'md:col-span-2 lg:col-span-3' : ''}
              >
                <Card
                  isPressable={!isExpanded}
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  className={`border transition-all cursor-pointer h-full ${
                    isExpanded
                      ? 'border-[#4654CD] shadow-lg shadow-[#4654CD]/10'
                      : 'border-neutral-200 hover:border-[#4654CD]/30 hover:shadow-md'
                  }`}
                >
                  <CardBody className="p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isExpanded ? 'bg-[#4654CD]' : 'bg-[#4654CD]/10'
                        }`}
                      >
                        <HelpCircle
                          className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-[#4654CD]'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-neutral-800 text-left">
                            {item.question}
                          </h3>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0"
                          >
                            {isExpanded ? (
                              <X className="w-5 h-5 text-[#4654CD]" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-neutral-400" />
                            )}
                          </motion.div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p className="text-neutral-600 mt-3 text-left">{item.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {!isExpanded && (
                          <p className="text-sm text-neutral-400 mt-1 line-clamp-1 text-left">
                            {item.answer}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
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
