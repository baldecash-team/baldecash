'use client';

/**
 * SocialProofV7 - Timeline de Convenios
 *
 * Concepto: Linea temporal mostrando crecimiento
 * Estilo: "2020: Primera alianza", visual de progreso
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Building, Users, Award, Rocket } from 'lucide-react';
import { SocialProofProps } from '../../../types/hero';

const milestones = [
  {
    year: '2020',
    title: 'Nace BaldeCash',
    description: 'Fundamos la empresa con la mision de democratizar el acceso a tecnologia',
    icon: Rocket,
    highlight: true,
  },
  {
    year: '2021',
    title: 'Primeras alianzas',
    description: '5 instituciones se unen como convenios fundadores',
    icon: Building,
    count: 5,
  },
  {
    year: '2022',
    title: 'Expansion nacional',
    description: 'Llegamos a 15 convenios en Lima y provincias',
    icon: Building,
    count: 15,
  },
  {
    year: '2023',
    title: '5,000 estudiantes',
    description: 'Alcanzamos este hito con 25 instituciones aliadas',
    icon: Users,
    count: 25,
  },
  {
    year: '2024',
    title: 'Líderes en fintech educativa',
    description: '+32 convenios y +10,000 estudiantes beneficiados',
    icon: Award,
    count: 32,
    highlight: true,
  },
];

export const SocialProofV7: React.FC<SocialProofProps> = ({ data }) => {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Nuestra historia de crecimiento
          </h2>
          <p className="text-neutral-600">
            {data.yearsInMarket} anos democratizando el acceso a tecnologia
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-neutral-200 -translate-x-1/2 hidden md:block" />

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div
                    className={`inline-block p-6 rounded-2xl ${
                      milestone.highlight
                        ? 'bg-[#4654CD] text-white'
                        : 'bg-white border border-neutral-200'
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        milestone.highlight ? 'text-white/80' : 'text-[#4654CD]'
                      }`}
                    >
                      {milestone.year}
                    </span>
                    <h3
                      className={`text-lg font-bold mt-1 ${
                        milestone.highlight ? 'text-white' : 'text-neutral-900'
                      }`}
                    >
                      {milestone.title}
                    </h3>
                    <p
                      className={`text-sm mt-2 ${
                        milestone.highlight ? 'text-white/80' : 'text-neutral-600'
                      }`}
                    >
                      {milestone.description}
                    </p>
                    {milestone.count && (
                      <p
                        className={`text-2xl font-bold mt-2 ${
                          milestone.highlight ? 'text-white' : 'text-[#03DBD0]'
                        }`}
                      >
                        {milestone.count} convenios
                      </p>
                    )}
                  </div>
                </div>

                {/* Circle */}
                <div
                  className={`hidden md:flex w-12 h-12 rounded-full items-center justify-center flex-shrink-0 ${
                    milestone.highlight
                      ? 'bg-[#4654CD] text-white'
                      : 'bg-white border-2 border-[#4654CD] text-[#4654CD]'
                  }`}
                >
                  <milestone.icon className="w-5 h-5" />
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofV7;
