'use client';

import { motion } from 'framer-motion';
import { Laptop, FileText, CheckCircle, Package } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { howItWorksSteps } from '../../../data/mockMacbookNeoData';
import type { HowItWorksStep } from '../../../types/macbook-neo';

const iconMap: Record<string, LucideIcon> = {
  Laptop,
  FileText,
  CheckCircle,
  Package,
};

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0 }}
          className="font-['Baloo_2'] text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-16"
        >
          ¿Cómo funciona?
        </motion.h2>

        {/* Desktop: horizontal row. Mobile: vertical list */}
        <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-0">
          {howItWorksSteps.map((step: HowItWorksStep, index: number) => {
            const Icon = iconMap[step.icon] ?? Laptop;
            const isLast = index === howItWorksSteps.length - 1;

            return (
              <div key={step.id} className="flex md:flex-col md:flex-1 items-start md:items-center gap-4 md:gap-0">
                {/* Step header: number + connector */}
                <div className="flex md:flex-row items-center w-full md:w-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.15 }}
                    className="flex flex-col items-center gap-2 shrink-0"
                  >
                    {/* Number circle */}
                    <div className="w-10 h-10 rounded-full bg-[#4654CD] text-white font-bold flex items-center justify-center text-sm">
                      {step.numero}
                    </div>
                    {/* Icon below number */}
                    <Icon className="w-5 h-5 text-[#4654CD]" />
                  </motion.div>

                  {/* Connecting line (desktop, between steps) */}
                  {!isLast && (
                    <div className="hidden md:block h-0.5 bg-neutral-200 flex-1 mx-2 mt-[-1.25rem]" />
                  )}
                  {/* Connecting line (mobile, vertical below icon) */}
                  {!isLast && (
                    <div className="md:hidden w-0.5 bg-neutral-200 h-8 ml-[1.125rem] mt-2 self-stretch" />
                  )}
                </div>

                {/* Text content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 + 0.05 }}
                  className="md:text-center md:px-4 md:mt-4 pb-2"
                >
                  <p className="font-['Baloo_2'] font-bold text-neutral-900 text-base mb-1">
                    {step.titulo}
                  </p>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {step.descripcion}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
