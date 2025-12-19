'use client';

/**
 * HeroBannerV9 - Storytelling (Narrativa Emocional)
 *
 * Concepto: Timeline del journey estudiantil, testimonios integrados
 * Layout: Copy emocional + Timeline + Testimonio destacado
 * Referencia: Duolingo, Headspace, Calm
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardBody } from '@nextui-org/react';
import { ArrowRight, Monitor, FileText, Clock, Package, Quote } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';

const steps = [
  { id: 1, title: 'Elige tu laptop', icon: Monitor },
  { id: 2, title: 'Solicita en 5 min', icon: FileText },
  { id: 3, title: 'Aprobacion 24h', icon: Clock },
  { id: 4, title: 'Recibe y estudia', icon: Package },
];

const testimonial = {
  quote: 'Gracias a BaldeCash pude terminar mi tesis a tiempo. El proceso fue super rapido y la cuota se ajusto a mi presupuesto de estudiante.',
  name: 'Maria Garcia',
  institution: 'UPN - Ing. Sistemas',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
};

export const HeroBannerV9: React.FC<HeroBannerProps> = ({
  minQuota,
  primaryCta,
}) => {
  return (
    <section className="min-h-[90vh] bg-neutral-50 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emotional Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-['Baloo_2'] text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-4 leading-tight">
            De estudiante sin laptop
            <br />
            <span className="text-[#4654CD]">a profesional exitoso</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Tu historia empieza aqui. Financiamiento estudiantil sin historial bancario.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            {/* Line */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-neutral-200 z-0" />
            <div className="hidden md:block absolute top-8 left-0 h-1 bg-[#4654CD] z-10" style={{ width: '75%' }} />

            {/* Steps */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="relative z-20 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#4654CD] text-white flex items-center justify-center shadow-lg">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <p className="text-sm md:text-base font-medium text-neutral-800">{step.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Testimonial + Price */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-white border border-neutral-200 shadow-sm">
              <CardBody className="p-6 md:p-8">
                <Quote className="w-10 h-10 text-[#4654CD]/30 mb-4" />
                <p className="text-lg text-neutral-700 italic mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                    <p className="text-neutral-500 text-sm">{testimonial.institution}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Price + CTA */}
          <motion.div
            className="text-center md:text-left"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-neutral-500 text-lg mb-2">Cuotas desde</p>
            <p className="text-5xl md:text-6xl font-bold text-[#4654CD] mb-6">
              S/{minQuota}<span className="text-xl font-normal text-neutral-400">/mes</span>
            </p>
            <p className="text-neutral-600 mb-8">
              Sin historial crediticio. Sin aval ni garante. Aprobacion en 24 horas.
            </p>
            <Button
              size="lg"
              className="bg-[#4654CD] text-white font-semibold px-10 cursor-pointer hover:bg-[#3a47b3] transition-colors"
              endContent={<ArrowRight className="w-5 h-5" />}
            >
              {primaryCta?.text || 'Empezar mi historia'}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroBannerV9;
