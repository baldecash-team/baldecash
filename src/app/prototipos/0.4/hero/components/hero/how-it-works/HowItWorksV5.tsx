'use client';

/**
 * HowItWorksV5 - Con Requisitos Expandido
 * Pasos + requisitos detallados con iconos
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Chip } from '@nextui-org/react';
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
} from 'lucide-react';
import { HowItWorksProps } from '../../../types/hero';
import { mockHowItWorksData } from '../../../data/mockHeroData';

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

export const HowItWorksV5: React.FC<HowItWorksProps> = ({ data = mockHowItWorksData }) => {
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
            Así de fácil
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Todo lo que necesitas saber para obtener tu equipo
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Columna: Pasos */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#4654CD] text-white flex items-center justify-center text-sm font-bold">
                1
              </span>
              El proceso
            </h3>
            <div className="space-y-4">
              {data.steps.map((step, i) => {
                const IconComponent = stepIconMap[step.icon] || Search;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border border-neutral-200 hover:border-[#4654CD]/30 transition-colors">
                      <CardBody className="p-4 flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${step.color}15` }}
                        >
                          <IconComponent className="w-6 h-6" style={{ color: step.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-400">
                              PASO {step.id}
                            </span>
                          </div>
                          <h4 className="font-semibold text-neutral-800">{step.title}</h4>
                          <p className="text-sm text-neutral-600 truncate">{step.description}</p>
                        </div>
                        {i < data.steps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-neutral-300 flex-shrink-0 hidden sm:block" />
                        )}
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
              Requisitos
            </h3>
            <div className="space-y-4 mb-8">
              {data.requirements.map((req, i) => {
                const IconComponent = reqIconMap[req.icon || 'Check'] || Check;
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border border-neutral-200 hover:border-[#03DBD0]/30 transition-colors">
                      <CardBody className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#03DBD0]/10 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-[#03DBD0]" />
                        </div>
                        <span className="text-neutral-700">{req.text}</span>
                        <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 ml-auto" />
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Plazos */}
            <Card className="bg-neutral-50 border-none">
              <CardBody className="p-6">
                <p className="text-sm text-neutral-500 mb-3">Plazos disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {data.availableTerms.map((term, i) => (
                    <motion.div
                      key={term}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <Chip
                        radius="sm"
                        classNames={{
                          base: 'bg-[#4654CD] px-4 py-2 h-auto',
                          content: 'text-white font-semibold',
                        }}
                      >
                        {term} meses
                      </Chip>
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksV5;
