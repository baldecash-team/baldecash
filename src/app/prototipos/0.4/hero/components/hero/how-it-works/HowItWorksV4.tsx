'use client';

/**
 * HowItWorksV4 - Minimal
 * Solo iconos con texto hover/tap
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chip } from '@nextui-org/react';
import { Search, FileText, Clock, GraduationCap, Check } from 'lucide-react';
import { HowItWorksProps } from '../../../types/hero';
import { mockHowItWorksData } from '../../../data/mockHeroData';

const iconMap: Record<string, React.ElementType> = {
  Search,
  FileText,
  Clock,
  GraduationCap,
};

export const HowItWorksV4: React.FC<HowItWorksProps> = ({ data = mockHowItWorksData }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800 font-['Baloo_2']">
            4 pasos simples
          </h2>
          <p className="text-neutral-600">Toca cada icono para ver mas</p>
        </motion.div>

        {/* Iconos minimalistas */}
        <div className="flex justify-center items-center gap-4 md:gap-8 mb-12">
          {data.steps.map((step, i) => {
            const IconComponent = iconMap[step.icon] || Search;
            const isActive = activeStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveStep(isActive ? null : step.id)}
                  className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'shadow-lg shadow-[#4654CD]/30'
                      : 'hover:shadow-md'
                  }`}
                  style={{
                    backgroundColor: isActive ? step.color : `${step.color}15`,
                  }}
                >
                  <IconComponent
                    className={`w-7 h-7 md:w-8 md:h-8 transition-colors ${
                      isActive ? 'text-white' : ''
                    }`}
                    style={{ color: isActive ? 'white' : step.color }}
                  />
                  <span
                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      isActive ? 'bg-white text-[#4654CD]' : 'bg-[#4654CD] text-white'
                    }`}
                  >
                    {step.id}
                  </span>
                </motion.button>

                {/* Conector */}
                {i < data.steps.length - 1 && (
                  <div className="hidden md:block w-12 h-0.5 bg-neutral-200" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Detalle expandido */}
        <AnimatePresence mode="wait">
          {activeStep && (
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {data.steps
                .filter((s) => s.id === activeStep)
                .map((step) => (
                  <div
                    key={step.id}
                    className="bg-white rounded-2xl p-6 md:p-8 text-center border border-neutral-200 max-w-xl mx-auto"
                  >
                    <h3 className="font-semibold text-xl text-neutral-800 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600">{step.description}</p>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requisitos inline */}
        <div className="mt-16 text-center">
          <p className="text-sm text-neutral-500 mb-4">Requisitos basicos</p>
          <div className="flex flex-wrap justify-center gap-3">
            {data.requirements.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-neutral-200"
              >
                <Check className="w-4 h-4 text-[#22c55e]" />
                <span className="text-sm text-neutral-700">{req.text}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {data.availableTerms.map((term) => (
              <Chip
                key={term}
                size="sm"
                radius="sm"
                classNames={{
                  base: 'bg-[#4654CD]/10 px-2 py-0.5 h-auto',
                  content: 'text-[#4654CD] text-xs font-medium',
                }}
              >
                {term}m
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksV4;
