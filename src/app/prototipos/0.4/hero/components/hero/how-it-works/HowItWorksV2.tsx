'use client';

/**
 * HowItWorksV2 - Cards Grid
 * 3 columnas con cards elevadas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { Search, FileText, Clock, GraduationCap, Check, ArrowRight } from 'lucide-react';
import { HowItWorksProps } from '../../../types/hero';
import { mockHowItWorksData } from '../../../data/mockHeroData';
import { UnderlinedText } from '../common/UnderlinedText';

const iconMap: Record<string, React.ElementType> = {
  Search,
  FileText,
  Clock,
  GraduationCap,
};

export const HowItWorksV2: React.FC<HowItWorksProps> = ({ data = mockHowItWorksData, underlineStyle = 4 }) => {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800 font-['Baloo_2']">
            ¿Cómo{' '}
            <UnderlinedText style={underlineStyle} color="primary">
              funciona
            </UnderlinedText>
            ?
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            4 pasos simples para obtener tu equipo
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {data.steps.map((step, i) => {
            const IconComponent = iconMap[step.icon] || Search;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border border-neutral-200 hover:border-[#4654CD]/30 hover:shadow-lg transition-all cursor-default">
                  <CardBody className="p-6 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${step.color}15` }}
                    >
                      <IconComponent className="w-7 h-7" style={{ color: step.color }} />
                    </div>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Paso {step.id}
                    </span>
                    <h3 className="font-semibold text-lg text-neutral-800 mt-2 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-neutral-600">{step.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Requisitos en linea */}
        <div className="bg-white rounded-2xl p-8 border border-neutral-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg text-neutral-800 mb-2">Solo necesitas</h3>
              <div className="flex flex-wrap gap-4">
                {data.requirements.slice(0, 3).map((req) => (
                  <div key={req.id} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#22c55e]" />
                    <span className="text-sm text-neutral-700">{req.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {data.availableTerms.map((term) => (
                <Chip
                  key={term}
                  radius="sm"
                  size="sm"
                  classNames={{
                    base: 'bg-[#4654CD]/10 px-3 py-1 h-auto',
                    content: 'text-[#4654CD] text-xs font-medium',
                  }}
                >
                  {term} meses
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksV2;
