'use client';

/**
 * HowItWorks - Con Requisitos Expandido (basado en V5 de 0.4)
 * Pasos + requisitos detallados con iconos y hover interactivo
 */

import React, { useState, useEffect } from 'react';
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
  ArrowDown,
  CheckCircle2,
  Send,
  CheckCircle,
  User,
  Shield,
  Package,
  Truck,
  Building,
  Briefcase,
  Star,
} from 'lucide-react';
import { HowItWorksProps } from '../../types/hero';

// Íconos disponibles para pasos (sincronizado con admin)
const stepIconMap: Record<string, React.ElementType> = {
  Search,
  FileText,
  Clock,
  Send,
  CheckCircle,
  CreditCard,
  Smartphone,
  Mail,
  User,
  Shield,
  Package,
  Truck,
  GraduationCap,
  Building,
  Briefcase,
  Star,
};

// Íconos disponibles para requisitos (sincronizado con admin)
const reqIconMap: Record<string, React.ElementType> = {
  GraduationCap,
  CreditCard,
  Mail,
  Smartphone,
  User,
  Building,
  Briefcase,
  FileText,
  Shield,
  Star,
  CheckCircle,
  Clock,
};

export const HowItWorks: React.FC<HowItWorksProps> = ({ data, underlineStyle = 4 }) => {
  // On desktop, hover reveals the step description; on touch devices we fall
  // back to click/tap toggle so iOS doesn't leave a sticky :hover permanently
  // applied to the last tapped card.
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activeReq, setActiveReq] = useState<number | null>(null);
  // Lazy initializer reads matchMedia synchronously during state construction,
  // which avoids the "set-state inside effect" lint error and gives the correct
  // value on first render without a flash of wrong variant.
  const [isHoverCapable, setIsHoverCapable] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handler = (e: MediaQueryListEvent) => setIsHoverCapable(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Filtrar pasos y requisitos visibles
  const visibleSteps = data.steps.filter((step) => step.is_visible !== false);
  const visibleRequirements = data.requirements.filter((req) => req.is_visible !== false);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-neutral-800 font-['Baloo_2',_sans-serif] leading-tight">
            {data.title || ''}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
            {data.subtitle || ''}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Columna: Pasos */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-6 flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
              >
                1
              </span>
              {data.stepsTitle || ''}
            </h3>
            <div className="space-y-4">
              {visibleSteps.map((step, i) => {
                const IconComponent = stepIconMap[step.icon] || Search;
                const isActive = activeStep === step.id;

                // Hover-capable devices (desktop): reveal on mouseenter/leave.
                // Touch devices (mobile/tablet): tap toggles the description.
                const interactionHandlers = isHoverCapable
                  ? {
                      onMouseEnter: () => setActiveStep(step.id),
                      onMouseLeave: () => setActiveStep(null),
                    }
                  : {
                      onClick: () => setActiveStep(isActive ? null : step.id),
                    };

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ delay: i * 0.08 }}
                    {...interactionHandlers}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`overflow-hidden transition-all duration-300 ${
                        isActive
                          ? 'shadow-lg'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      style={{
                        borderWidth: 2,
                        borderColor: isActive ? step.color : undefined,
                        boxShadow: isActive ? '0 10px 15px -3px color-mix(in srgb, var(--color-primary, #4654CD) 15%, transparent)' : undefined,
                      }}
                    >
                      <CardBody className="p-0">
                        <div className="flex items-stretch">
                          <div
                            className="w-16 sm:w-20 flex items-center justify-center transition-all duration-300 flex-shrink-0"
                            style={{
                              backgroundColor: isActive ? step.color : `${step.color}15`,
                            }}
                          >
                            <IconComponent
                              className="w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300"
                              style={{ color: isActive ? 'white' : step.color }}
                            />
                          </div>
                          <div className="flex-1 p-3 sm:p-4 min-w-0">
                            <span className="text-[10px] sm:text-xs font-bold text-neutral-400">
                              {data.stepLabel || 'PASO'} {i + 1}
                            </span>
                            <h4 className="font-semibold text-neutral-800 mt-0.5 text-sm sm:text-base">{step.title}</h4>
                            <AnimatePresence>
                              {isActive && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-xs sm:text-sm text-neutral-600 mt-1 overflow-hidden"
                                >
                                  {step.description}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          {i < visibleSteps.length - 1 && (
                            <div className="flex items-center pr-3 sm:pr-4 flex-shrink-0">
                              {/* Arrow points down on mobile (cards stacked vertically)
                                  and right on larger viewports */}
                              <ArrowDown
                                className="w-4 h-4 sm:hidden transition-colors duration-300"
                                style={{ color: isActive ? 'var(--color-primary, #4654CD)' : '#d4d4d4' }}
                              />
                              <ArrowRight
                                className="hidden sm:block w-4 h-4 transition-colors duration-300"
                                style={{ color: isActive ? 'var(--color-primary, #4654CD)' : '#d4d4d4' }}
                              />
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
              <span
                className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--color-secondary, #03DBD0)' }}
              >
                2
              </span>
              {data.requirementsTitle || ''}
            </h3>
            <div className="space-y-4 mb-8">
              {visibleRequirements.map((req, i) => {
                const IconComponent = reqIconMap[req.icon || 'Check'] || Check;
                const isActive = activeReq === req.id;

                const interactionHandlers = isHoverCapable
                  ? {
                      onMouseEnter: () => setActiveReq(req.id),
                      onMouseLeave: () => setActiveReq(null),
                    }
                  : {
                      onClick: () => setActiveReq(isActive ? null : req.id),
                    };

                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ delay: i * 0.08 }}
                    {...interactionHandlers}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`overflow-hidden transition-all duration-300 ${
                        isActive
                          ? 'shadow-lg'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      style={{
                        borderWidth: 2,
                        borderColor: isActive ? 'var(--color-secondary, #03DBD0)' : undefined,
                        boxShadow: isActive ? '0 10px 15px -3px color-mix(in srgb, var(--color-secondary, #03DBD0) 15%, transparent)' : undefined,
                      }}
                    >
                      <CardBody className="p-0">
                        <div className="flex items-stretch">
                          <div
                            className="w-14 sm:w-16 flex items-center justify-center transition-all duration-300 flex-shrink-0"
                            style={{
                              backgroundColor: isActive
                                ? 'var(--color-secondary, #03DBD0)'
                                : 'color-mix(in srgb, var(--color-secondary, #03DBD0) 10%, transparent)',
                            }}
                          >
                            <IconComponent
                              className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300"
                              style={{
                                color: isActive ? 'white' : 'var(--color-secondary, #03DBD0)',
                              }}
                            />
                          </div>
                          <div className="flex-1 p-3 sm:p-4 flex items-center gap-3 min-w-0">
                            <span className="text-sm sm:text-base text-neutral-700 flex-1 min-w-0">{req.text}</span>
                            <CheckCircle2
                              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors duration-300"
                              style={{
                                color: isActive ? 'var(--color-secondary, #03DBD0)' : '#22c55e',
                              }}
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
