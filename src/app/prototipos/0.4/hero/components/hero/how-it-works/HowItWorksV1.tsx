'use client';

/**
 * HowItWorksV1 - Timeline Horizontal Premium
 *
 * Concepto: Timeline visual con pasos conectados y animaciones fluidas
 * Estilo: Cards elevadas, iconos grandes, línea de progreso animada
 * Mobile: Stack vertical con indicadores de paso
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import {
  Search,
  FileText,
  Clock,
  GraduationCap,
  Check,
  ArrowRight,
  Sparkles,
  CreditCard,
  Mail,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { HowItWorksProps } from '../../../types/hero';
import { mockHowItWorksData } from '../../../data/mockHeroData';
import { UnderlinedText } from '../common/UnderlinedText';

const iconMap: Record<string, React.ElementType> = {
  Search,
  FileText,
  Clock,
  GraduationCap,
  CreditCard,
  Mail,
  Smartphone,
};

export const HowItWorksV1: React.FC<HowItWorksProps> = ({ data = mockHowItWorksData, underlineStyle = 4 }) => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-neutral-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <Chip
            startContent={<Sparkles className="w-3.5 h-3.5" />}
            classNames={{
              base: 'bg-[#4654CD]/10 px-4 py-2 h-auto mb-4',
              content: 'text-[#4654CD] text-sm font-medium',
            }}
          >
            Proceso simple
          </Chip>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-neutral-800 font-['Baloo_2']">
            ¿Cómo{' '}
            <UnderlinedText style={underlineStyle} color="primary">
              funciona
            </UnderlinedText>
            ?
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Obtén tu laptop en 4 pasos simples. 100% digital.
          </p>
        </motion.div>

        {/* Timeline - Desktop */}
        <div className="hidden md:block relative mb-16">
          {/* Connection Line */}
          <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-neutral-200" />
          <motion.div
            className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#4654CD] via-[#03DBD0] to-[#22c55e] origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />

          <div className="grid grid-cols-4 gap-6">
            {data.steps.map((step, i) => {
              const IconComponent = iconMap[step.icon] || Search;
              return (
                <motion.div
                  key={step.id}
                  className="relative flex flex-col items-center text-center"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.4 }}
                >
                  {/* Icon Circle */}
                  <motion.div
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-lg relative z-10"
                    style={{ backgroundColor: step.color }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <IconComponent className="w-10 h-10 text-white" />
                    {/* Step number badge */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-sm font-bold text-neutral-700">
                      {step.id}
                    </div>
                  </motion.div>

                  {/* Content */}
                  <h3 className="font-bold text-lg text-neutral-800 mb-2">{step.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed px-2">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Timeline - Mobile */}
        <div className="md:hidden space-y-6 mb-12">
          {data.steps.map((step, i) => {
            const IconComponent = iconMap[step.icon] || Search;
            const isLast = i === data.steps.length - 1;

            return (
              <motion.div
                key={step.id}
                className="flex gap-4"
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                {/* Left: Icon + Line */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                    style={{ backgroundColor: step.color }}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  {!isLast && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-neutral-300 to-transparent mt-2" />
                  )}
                </div>

                {/* Right: Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-neutral-400">PASO {step.id}</span>
                  </div>
                  <h3 className="font-bold text-neutral-800 mb-1">{step.title}</h3>
                  <p className="text-sm text-neutral-500">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Requisitos Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#4654CD] to-[#3a47b3] rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            {/* Left - Requirements */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-white">Solo necesitas</h3>
              </div>

              <div className="space-y-3">
                {data.requirements.map((req, i) => {
                  const ReqIcon = (req.icon && iconMap[req.icon]) || Check;
                  return (
                    <motion.div
                      key={req.id}
                      className="flex items-center gap-3 bg-white/10 rounded-xl p-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#03DBD0]/30 flex items-center justify-center flex-shrink-0">
                        <ReqIcon className="w-4 h-4 text-[#03DBD0]" />
                      </div>
                      <span className="text-white text-sm font-medium">{req.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right - Terms & CTA */}
            <div className="bg-white/5 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-white/70 text-sm font-medium mb-3">Plazos disponibles</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {data.availableTerms.map((term, i) => (
                    <motion.div
                      key={term}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                    >
                      <span className="inline-block bg-white/20 border border-white/30 rounded-full px-4 py-2 text-white font-bold">
                        {term} meses
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Check className="w-4 h-4 text-[#03DBD0]" />
                  <span>Sin penalidad por adelanto</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Check className="w-4 h-4 text-[#03DBD0]" />
                  <span>20% descuento pago total</span>
                </div>

                <Button
                  size="lg"
                  radius="lg"
                  className="w-full bg-white text-[#4654CD] font-bold h-12 cursor-pointer hover:bg-neutral-100 transition-colors mt-2"
                  endContent={<ArrowRight className="w-5 h-5" />}
                >
                  Solicitar ahora
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksV1;
