'use client';

/**
 * HowItWorksV1 - Timeline Horizontal Premium
 * Iconos grandes + pasos con linea de progreso animada + mejor storytelling
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Chip, Button } from '@nextui-org/react';
import { Search, FileText, Clock, GraduationCap, Check, ArrowRight, Sparkles, CreditCard, Mail, Smartphone, ChevronRight } from 'lucide-react';
import { HowItWorksProps } from '../../../types/hero';
import { mockHowItWorksData } from '../../../data/mockHeroData';

const iconMap: Record<string, React.ElementType> = {
  Search,
  FileText,
  Clock,
  GraduationCap,
  CreditCard,
  Mail,
  Smartphone,
};

export const HowItWorksV1: React.FC<HowItWorksProps> = ({ data = mockHowItWorksData }) => {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-neutral-50/50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hiw-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#4654CD" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hiw-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Chip
            startContent={<Sparkles className="w-3.5 h-3.5" />}
            classNames={{
              base: 'bg-[#4654CD]/10 px-4 py-2 h-auto mb-6',
              content: 'text-[#4654CD] text-sm font-medium',
            }}
          >
            Proceso simple
          </Chip>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-neutral-800 font-['Baloo_2']">
            Como{' '}
            <span className="text-[#4654CD] relative">
              funciona
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 150 8" fill="none">
                <path d="M2 6C40 2 110 2 148 6" stroke="#03DBD0" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Obtener tu equipo es mas facil de lo que piensas. Solo 4 pasos y listo.
          </p>
        </motion.div>

        {/* Timeline horizontal */}
        <div className="relative mb-20">
          {/* Connection Line - Desktop */}
          <div className="absolute top-16 left-[12%] right-[12%] h-1 bg-neutral-200 rounded-full hidden lg:block" />
          <motion.div
            className="absolute top-16 left-[12%] right-[12%] h-1 bg-gradient-to-r from-[#4654CD] via-[#03DBD0] to-[#22c55e] rounded-full hidden lg:block origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {data.steps.map((step, i) => {
              const IconComponent = iconMap[step.icon] || Search;
              return (
                <motion.div
                  key={step.id}
                  className="relative"
                  initial={{ y: 40, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                >
                  <Card className="bg-white border border-neutral-100 shadow-sm hover:shadow-xl hover:border-[#4654CD]/20 transition-all duration-300 h-full group">
                    <CardBody className="p-6 text-center">
                      {/* Step Number */}
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-400 group-hover:bg-[#4654CD] group-hover:text-white transition-colors">
                        {step.id}
                      </div>

                      {/* Icon */}
                      <motion.div
                        className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-lg"
                        style={{ backgroundColor: step.color }}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <IconComponent className="w-7 h-7 text-white" />
                      </motion.div>

                      {/* Content */}
                      <h3 className="font-bold text-lg text-neutral-800 mb-2">{step.title}</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">{step.description}</p>

                      {/* Arrow for desktop - between cards */}
                      {i < data.steps.length - 1 && (
                        <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-20">
                          <ChevronRight className="w-6 h-6 text-neutral-300" />
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Requisitos Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-[#4654CD] to-[#3a47b3] border-none shadow-xl overflow-hidden">
            <CardBody className="p-0">
              <div className="grid lg:grid-cols-2">
                {/* Left - Requirements */}
                <div className="p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-white">Requisitos simples</h3>
                  </div>

                  <div className="space-y-4">
                    {data.requirements.map((req, i) => {
                      const ReqIcon = iconMap[req.icon] || Check;
                      return (
                        <motion.div
                          key={req.id}
                          className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#03DBD0]/30 flex items-center justify-center flex-shrink-0">
                            <ReqIcon className="w-5 h-5 text-[#03DBD0]" />
                          </div>
                          <span className="text-white font-medium">{req.text}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Right - Terms & CTA */}
                <div className="bg-white/5 backdrop-blur-sm p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <h4 className="text-white/80 text-sm font-medium mb-4">Plazos de financiamiento</h4>
                    <div className="flex flex-wrap gap-3 mb-8">
                      {data.availableTerms.map((term, i) => (
                        <motion.div
                          key={term}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                        >
                          <Chip
                            radius="lg"
                            classNames={{
                              base: 'bg-white/20 border border-white/30 px-5 py-3 h-auto',
                              content: 'text-white font-bold text-lg',
                            }}
                          >
                            {term} meses
                          </Chip>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Check className="w-4 h-4 text-[#03DBD0]" />
                      <span>Sin penalidad por adelanto de cuotas</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Check className="w-4 h-4 text-[#03DBD0]" />
                      <span>20% descuento por pago adelantado total</span>
                    </div>

                    <Button
                      size="lg"
                      radius="lg"
                      className="w-full bg-white text-[#4654CD] font-bold h-14 cursor-pointer hover:bg-neutral-100 hover:scale-[1.02] transition-all mt-4"
                      endContent={<ArrowRight className="w-5 h-5" />}
                    >
                      Solicitar ahora
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksV1;
