'use client';

/**
 * HowItWorksV3 - Vertical con Linea
 * Timeline vertical con scroll reveal animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { Search, FileText, Clock, GraduationCap, Check, ArrowDown } from 'lucide-react';
import { HowItWorksProps } from '../../../types/hero';
import { mockHowItWorksData } from '../../../data/mockHeroData';

const iconMap: Record<string, React.ElementType> = {
  Search,
  FileText,
  Clock,
  GraduationCap,
};

export const HowItWorksV3: React.FC<HowItWorksProps> = ({ data = mockHowItWorksData }) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800 font-['Baloo_2']">
            Como funciona
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Un proceso simple y transparente
          </p>
        </motion.div>

        {/* Timeline Vertical */}
        <div className="relative">
          {/* Linea central */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-neutral-200 transform md:-translate-x-1/2" />

          {data.steps.map((step, i) => {
            const IconComponent = iconMap[step.icon] || Search;
            const isEven = i % 2 === 0;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`relative flex items-center mb-12 last:mb-0 ${
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Contenido */}
                <div className={`ml-20 md:ml-0 md:w-5/12 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <Card className="border border-neutral-200 hover:border-[#4654CD]/30 hover:shadow-md transition-all">
                    <CardBody className="p-5">
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: step.color }}
                      >
                        Paso {step.id}
                      </span>
                      <h3 className="font-semibold text-lg text-neutral-800 mt-1 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-neutral-600">{step.description}</p>
                    </CardBody>
                  </Card>
                </div>

                {/* Icono central */}
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                    style={{ backgroundColor: step.color }}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </motion.div>
                </div>

                {/* Espacio para el otro lado */}
                <div className="hidden md:block md:w-5/12" />
              </motion.div>
            );
          })}
        </div>

        {/* Requisitos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <Card className="bg-neutral-50 border-none">
            <CardBody className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="font-semibold text-lg text-neutral-800 mb-4">
                    Solo necesitas
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.requirements.map((req) => (
                      <div key={req.id} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                        <span className="text-sm text-neutral-700">{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.availableTerms.map((term) => (
                    <Chip
                      key={term}
                      radius="sm"
                      classNames={{
                        base: 'bg-[#4654CD]/10 px-3 py-1 h-auto',
                        content: 'text-[#4654CD] text-sm font-medium',
                      }}
                    >
                      {term} meses
                    </Chip>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksV3;
