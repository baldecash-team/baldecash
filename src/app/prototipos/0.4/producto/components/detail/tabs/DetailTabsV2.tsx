'use client';

/**
 * DetailTabsV2 - Tabs Horizontales Clásicos
 *
 * Pure navigation component with horizontal tabs style.
 * Scrolls to existing sections rendered by ProductDetail.
 * Does NOT render any content - all content is rendered by dedicated components.
 */

import React, { useState, useEffect } from 'react';
import { FileText, Cpu, Award, Package } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';

export const DetailTabsV2: React.FC<DetailTabsProps> = () => {
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
      {/* Horizontal Tabs Navigation - Pure Navigation Only */}
      <div className="border-b border-neutral-200">
        <div className="flex gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-2 px-0 h-12 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#4654CD] text-[#4654CD]'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetailTabsV2;
