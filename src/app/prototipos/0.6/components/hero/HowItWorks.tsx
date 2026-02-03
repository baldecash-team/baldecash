'use client';

/**
 * HowItWorks - Con Requisitos Expandido (basado en V5 de 0.4)
 * Pasos + requisitos detallados con iconos y hover interactivo
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody } from '@nextui-org/react';
import {
  Search,
  FileText,
  Clock,
  GraduationCap,
  Check,
  CreditCard,
  Mail,
  Smartphone,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { HowItWorksProps } from '../../types/hero';

const stepIconMap: Record<string, React.ElementType> = {
  Search,
  FileText,
  Clock,
  GraduationCap,
};

const reqIconMap: Record<string, React.ElementType> = {
  GraduationCap,
  CreditCard,
  Mail,
  Smartphone,
};

export const HowItWorks: React.FC<HowItWorksProps> = ({ data, underlineStyle = 4 }) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [hoveredReq, setHoveredReq] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800 font-['Baloo_2']">
            {data.title || ''}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {data.subtitle || ''}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Columna: Pasos */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#4654CD] text-white flex items-center justify-center text-sm font-bold">
                1
              </span>
              {data.stepsTitle || ''}
            </h3>
            <div className="space-y-4">
              {data.steps.map((step, i) => {
                const IconComponent = stepIconMap[step.icon] || Search;
                const isHovered = hoveredStep === step.id;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onMouseEnter={() => setHoveredStep(step.id)}
                    onMouseLeave={() => setHoveredStep(null)}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`overflow-hidden transition-all duration-300 ${
                        isHovered
                          ? 'shadow-lg shadow-[#4654CD]/15 border-[#4654CD]'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      style={{
                        borderWidth: 2,
                        borderColor: isHovered ? step.color : undefined,
                      }}
                    >
                      <CardBody className="p-0">
                        <div className="flex items-stretch">
                          <div
                            className="w-20 flex items-center justify-center transition-all duration-300 flex-shrink-0"
                            style={{
                              backgroundColor: isHovered ? step.color : `${step.color}15`,
                            }}
                          >
                            <IconComponent
                              className="w-7 h-7 transition-colors duration-300"
                              style={{ color: isHovered ? 'white' : step.color }}
                            />
                          </div>
                          <div className="flex-1 p-4 min-w-0">
                            <span className="text-xs font-bold text-neutral-400">
                              {data.stepLabel || 'PASO'} {step.id}
                            </span>
                            <h4 className="font-semibold text-neutral-800 mt-0.5">{step.title}</h4>
                            <AnimatePresence>
                              {isHovered && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-sm text-neutral-600 mt-1 overflow-hidden"
                                >
                                  {step.description}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          {i < data.steps.length - 1 && (
                            <div className="flex items-center pr-4">
                              <ArrowRight className={`w-4 h-4 transition-colors duration-300 ${isHovered ? 'text-[#4654CD]' : 'text-neutral-300'}`} />
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Columna: Requisitos */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#03DBD0] text-white flex items-center justify-center text-sm font-bold">
                2
              </span>
              {data.requirementsTitle || ''}
            </h3>
            <div className="space-y-4 mb-8">
              {data.requirements.map((req, i) => {
                const IconComponent = reqIconMap[req.icon || 'Check'] || Check;
                const isHovered = hoveredReq === req.id;
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onMouseEnter={() => setHoveredReq(req.id)}
                    onMouseLeave={() => setHoveredReq(null)}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`overflow-hidden transition-all duration-300 ${
                        isHovered
                          ? 'shadow-lg shadow-[#03DBD0]/15 border-[#03DBD0]'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      style={{
                        borderWidth: 2,
                        borderColor: isHovered ? '#03DBD0' : undefined,
                      }}
                    >
                      <CardBody className="p-0">
                        <div className="flex items-stretch">
                          <div
                            className={`w-16 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                              isHovered ? 'bg-[#03DBD0]' : 'bg-[#03DBD0]/10'
                            }`}
                          >
                            <IconComponent
                              className={`w-6 h-6 transition-colors duration-300 ${
                                isHovered ? 'text-white' : 'text-[#03DBD0]'
                              }`}
                            />
                          </div>
                          <div className="flex-1 p-4 flex items-center gap-3">
                            <span className="text-neutral-700 flex-1">{req.text}</span>
                            <CheckCircle2
                              className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${
                                isHovered ? 'text-[#03DBD0]' : 'text-[#22c55e]'
                              }`}
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
