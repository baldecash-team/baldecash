'use client';

/**
 * FaqSection - Acordeón con Iconos categorizado (basado en V2 de 0.4)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionItem, Chip } from '@nextui-org/react';
import {
  HelpCircle,
  FileText,
  CreditCard,
  Truck,
  ClipboardCheck,
  Shield,
  Clock,
  Star,
  Heart,
  Zap,
  Users,
  Settings,
} from 'lucide-react';
import { FaqSectionProps } from '../../types/hero';

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, React.ElementType> = {
  HelpCircle,
  CreditCard,
  Truck,
  FileText,
  ClipboardCheck,
  Shield,
  Clock,
  Star,
  Heart,
  Zap,
  Users,
  Settings,
};

// Fallback icons por categoría (si no viene de backend)
const defaultCategoryIcons: Record<string, string> = {
  Requisitos: 'ClipboardCheck',
  Proceso: 'FileText',
  Pagos: 'CreditCard',
  Envío: 'Truck',
  General: 'HelpCircle',
  Garantía: 'ClipboardCheck',
};

// Fallback colors por categoría (si no viene de backend)
const defaultCategoryColors: Record<string, string> = {
  Requisitos: '#4654CD',
  Proceso: '#5B68D8',
  Pagos: '#03DBD0',
  Envío: '#22c55e',
  General: '#4654CD',
  Garantía: '#f59e0b',
};

export const FaqSection: React.FC<FaqSectionProps> = ({ data, underlineStyle = 4 }) => {
  // Evitar hydration mismatch con Accordion IDs
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Usar iconos y colores de backend con fallback a defaults
  const categoryIcons = data.categoryIcons || defaultCategoryIcons;
  const categoryColors = data.categoryColors || defaultCategoryColors;

  // Helper para obtener el componente de icono
  const getIconComponent = (category: string): React.ElementType => {
    const iconName = categoryIcons[category] || categoryIcons['General'] || 'HelpCircle';
    return iconMap[iconName] || HelpCircle;
  };

  // Helper para obtener el color
  const getColor = (category: string): string => {
    return categoryColors[category] || categoryColors['General'] || '#4654CD';
  };

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 font-['Baloo_2'] mb-4">
            {data.title || ''}
          </h2>
          <p className="text-neutral-600">{data.subtitle || ''}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {isMounted ? (
            <Accordion
              variant="splitted"
              selectionMode="multiple"
              className="gap-3"
              itemClasses={{
                base: 'bg-white border border-neutral-200 rounded-xl px-4 shadow-sm hover:shadow-md transition-all',
                title: 'font-medium text-neutral-800 text-left',
                trigger: 'py-4 data-[hover=true]:bg-transparent cursor-pointer',
                indicator: 'text-[#4654CD] transition-transform data-[open=true]:rotate-90',
                content: 'pb-4 pt-0 text-neutral-600',
              }}
            >
              {data.items.map((item) => {
                const IconComponent = getIconComponent(item.category || 'General');
                const color = getColor(item.category || 'General');

                return (
                  <AccordionItem
                    key={item.id}
                    aria-label={item.question}
                    startContent={
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color }} />
                      </div>
                    }
                    title={
                      <div className="flex items-center justify-between gap-3 w-full">
                        <span className="flex-1">{item.question}</span>
                        <Chip
                          size="sm"
                          radius="sm"
                          classNames={{
                            base: 'px-2 py-0.5 h-auto flex-shrink-0',
                            content: 'text-xs font-medium',
                          }}
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                          }}
                        >
                          {item.category}
                        </Chip>
                      </div>
                    }
                  >
                    <div className="pl-14" dangerouslySetInnerHTML={{ __html: item.answer }} />
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="space-y-3">
              {data.items.map((item) => (
                <div key={item.id} className="bg-white border border-neutral-200 rounded-xl px-4 py-4 shadow-sm">
                  <div className="font-medium text-neutral-800">{item.question}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          {data.categories?.map((cat) => {
            const IconComponent = getIconComponent(cat);
            const color = getColor(cat);
            return (
              <div key={cat} className="flex items-center gap-2 text-sm text-neutral-600">
                <IconComponent className="w-4 h-4" style={{ color }} />
                <span>{cat}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSection;
