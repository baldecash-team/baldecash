'use client';

/**
 * DetailTabsV5 - Split Layout (Desktop) - Sidebar Navigation
 *
 * Pure navigation component with card-style sidebar.
 * Scrolls to existing sections rendered by ProductDetail.
 * Does NOT render any content - all content is rendered by dedicated components.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { FileText, Cpu, Award, Package, ChevronRight, Calendar, Image, Calculator } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';

export const DetailTabsV5: React.FC<DetailTabsProps> = () => {
  const [activeSection, setActiveSection] = useState('section-tabs');

  const navItems = [
    { id: 'section-gallery', label: 'Galería', icon: Image },
    { id: 'section-pricing', label: 'Cuotas', icon: Calculator },
    { id: 'section-specs', label: 'Specs', icon: Cpu },
    { id: 'section-cronograma', label: 'Cronograma', icon: Calendar },
    { id: 'section-similar', label: 'Similares', icon: Package },
    { id: 'section-certifications', label: 'Certificaciones', icon: Award },
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
      {/* Card-style Sidebar Navigation - Pure Navigation Only */}
      <Card className="bg-neutral-50 border border-neutral-200">
        <CardBody className="p-2">
          <nav className="flex flex-wrap lg:flex-nowrap gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex-1 flex items-center justify-center lg:justify-between gap-2 lg:gap-3 px-3 lg:px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4654CD] text-white'
                      : 'text-neutral-600 hover:bg-white hover:text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="font-medium text-xs lg:text-sm">{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`hidden lg:block w-4 h-4 transition-transform ${
                      isActive ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetailTabsV5;
