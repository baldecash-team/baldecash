'use client';

/**
 * DetailTabsV1 - Scroll Continuo + Nav Sticky Lateral
 *
 * Pure navigation component that provides sticky side navigation
 * to scroll to existing sections in the page. Does NOT render any content.
 * All content is rendered by dedicated components (Specs, Certifications, etc.)
 */

import React, { useState, useEffect } from 'react';
import { Cpu, FileText, Award, Package, ChevronRight } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';

export const DetailTabsV1: React.FC<DetailTabsProps> = () => {
  const [activeSection, setActiveSection] = useState('section-tabs');

  // Sections that exist in the page (rendered by ProductDetail)
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
      {/* Sticky Side Navigation - Pure Navigation Only */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3 px-4">
            Navegación
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4654CD] text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile: Horizontal Tabs */}
      <div className="lg:hidden border-b border-neutral-200">
        <div className="flex gap-4 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#4654CD] text-[#4654CD]'
                    : 'border-transparent text-neutral-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetailTabsV1;
