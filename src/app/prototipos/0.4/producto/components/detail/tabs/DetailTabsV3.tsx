'use client';

/**
 * DetailTabsV3 - Acordeón Colapsable (Mobile-First)
 *
 * Pure navigation component with accordion style for mobile.
 * Scrolls to existing sections rendered by ProductDetail.
 * Does NOT render any content - all content is rendered by dedicated components.
 */

import React, { useState, useEffect } from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { FileText, Cpu, Award, Package, ChevronDown } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';

export const DetailTabsV3: React.FC<DetailTabsProps> = () => {
  const [activeSection, setActiveSection] = useState('section-tabs');

  const navItems = [
    { id: 'section-tabs', label: 'Descripción', icon: FileText },
    { id: 'section-specs', label: 'Especificaciones', icon: Cpu },
    { id: 'section-certifications', label: 'Certificaciones', icon: Award },
    { id: 'section-similar', label: 'Similares', icon: Package },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const item of navItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* Accordion Navigation - Mobile Friendly - Pure Navigation Only */}
      <Accordion
        variant="splitted"
        defaultExpandedKeys={['navigation']}
        className="px-0"
        itemClasses={{
          base: 'bg-white border border-neutral-200 rounded-lg shadow-sm',
          title: 'font-semibold text-neutral-900',
          trigger: 'py-3 px-4 cursor-pointer hover:bg-neutral-50',
          content: 'px-4 pb-4',
        }}
      >
        <AccordionItem
          key="navigation"
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-[#4654CD]" />
              </div>
              <span className="text-sm">Ir a sección</span>
            </div>
          }
          indicator={<ChevronDown className="w-4 h-4 text-neutral-500" />}
        >
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4654CD] text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DetailTabsV3;
