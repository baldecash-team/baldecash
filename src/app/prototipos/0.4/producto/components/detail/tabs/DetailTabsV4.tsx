'use client';

/**
 * DetailTabsV4 - Tabs con Iconos Animados
 *
 * Pure navigation component with animated icons on tabs.
 * Scrolls to existing sections rendered by ProductDetail.
 * Does NOT render any content - all content is rendered by dedicated components.
 */

import React, { useState, useEffect } from 'react';
import { FileText, Cpu, Award, Package } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';

export const DetailTabsV4: React.FC<DetailTabsProps> = () => {
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
      {/* Animated Icon Tabs Navigation - Pure Navigation Only */}
      <div className="border-b border-neutral-200">
        <div className="flex gap-2 md:gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#4654CD] text-[#4654CD]'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                <Icon
                  className={`transition-all duration-300 ${
                    isActive
                      ? 'w-5 h-5 scale-110'
                      : 'w-4 h-4'
                  }`}
                />
                <span className={`font-medium text-sm md:text-base ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetailTabsV4;
