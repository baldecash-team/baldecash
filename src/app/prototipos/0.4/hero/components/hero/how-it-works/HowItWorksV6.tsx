'use client';

/**
 * HowItWorksV6 - Interactivo
 * Hover reveal con animaciones elaboradas
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, Chip, Button } from '@nextui-org/react';
import { Search, FileText, Clock, GraduationCap, Check, ChevronRight } from 'lucide-react';
import { HowItWorksProps } from '../../../types/hero';
import { mockHowItWorksData } from '../../../data/mockHeroData';

const iconMap: Record<string, React.ElementType> = {
  Search,
  FileText,
  Clock,
  GraduationCap,
};

export const HowItWorksV6: React.FC<HowItWorksProps> = ({ data = mockHowItWorksData }) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [showRequirements, setShowRequirements] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800 font-['Baloo_2']">
            Explora el proceso
          </h2>
          <p className="text-neutral-600">Pasa el cursor sobre cada paso</p>
        </motion.div>

        {/* Grid interactivo */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {data.steps.map((step, i) => {
            const IconComponent = iconMap[step.icon] || Search;
            const isHovered = hoveredStep === step.id;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
                className="relative cursor-pointer"
              >
                <Card
                  className={`overflow-hidden transition-all duration-300 ${
                    isHovered
                      ? 'shadow-xl shadow-[#4654CD]/20 border-[#4654CD]'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  style={{
                    borderWidth: 2,
                    borderColor: isHovered ? step.color : undefined,
                  }}
                >
                  <CardBody className="p-0">
                    {/* Header con icono */}
                    <div
                      className="p-6 transition-all duration-300"
                      style={{
                        backgroundColor: isHovered ? step.color : `${step.color}10`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <IconComponent
                          className={`w-8 h-8 transition-colors duration-300 ${
                            isHovered ? 'text-white' : ''
                          }`}
                          style={{ color: isHovered ? 'white' : step.color }}
                        />
                        <span
                          className={`text-3xl font-black transition-colors duration-300 ${
                            isHovered ? 'text-white/30' : 'text-neutral-200'
                          }`}
                        >
                          {step.id}
                        </span>
                      </div>
                    </div>

                    {/* Contenido expandible */}
                    <div className="p-5">
                      <h3 className="font-semibold text-neutral-800 mb-2">{step.title}</h3>
                      <AnimatePresence>
                        {isHovered && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-sm text-neutral-600 overflow-hidden"
                          >
                            {step.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Requisitos colapsable */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Button
            variant="light"
            radius="lg"
            className="w-full justify-between text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            endContent={
              <motion.div
                animate={{ rotate: showRequirements ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            }
            onPress={() => setShowRequirements(!showRequirements)}
          >
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#22c55e]" />
              Ver requisitos
            </span>
          </Button>

          <AnimatePresence>
            {showRequirements && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Card className="mt-4 border border-neutral-200">
                  <CardBody className="p-6">
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      {data.requirements.map((req, i) => (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-[#22c55e]" />
                          </div>
                          <span className="text-sm text-neutral-700">{req.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-neutral-100">
                      <p className="text-xs text-neutral-500 mb-3">Plazos de financiamiento</p>
                      <div className="flex flex-wrap gap-2">
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
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksV6;
