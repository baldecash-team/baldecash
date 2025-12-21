'use client';

/**
 * DetailTabsV6 - Tabs con Preview on Hover
 *
 * Pure navigation component with hover previews.
 * Shows tooltip preview for each section before clicking.
 * Does NOT render any content - all content is rendered by dedicated components.
 */

import React, { useState, useEffect } from 'react';
import { Tooltip } from '@nextui-org/react';
import { FileText, Cpu, Award, Package, Eye, Calendar, Image, Calculator } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';
import { mockCertifications } from '../../../data/mockDetailData';

export const DetailTabsV6: React.FC<DetailTabsProps> = ({ product }) => {
  const [activeSection, setActiveSection] = useState('section-tabs');

  const navItems = [
    {
      id: 'section-gallery',
      label: 'Galería',
      icon: Image,
      preview: `${product.images.length} imágenes del producto`,
    },
    {
      id: 'section-pricing',
      label: 'Cuotas',
      icon: Calculator,
      preview: `Desde S/${product.lowestQuota}/mes`,
    },
    {
      id: 'section-specs',
      label: 'Specs',
      icon: Cpu,
      preview: `${product.specs.length} categorías · ${product.specs.reduce(
        (acc, cat) => acc + cat.specs.length,
        0
      )} especificaciones`,
    },
    {
      id: 'section-cronograma',
      label: 'Cronograma',
      icon: Calendar,
      preview: 'Ver cronograma de pagos',
    },
    {
      id: 'section-similar',
      label: 'Similares',
      icon: Package,
      preview: 'Ver productos similares',
    },
    {
      id: 'section-certifications',
      label: 'Certificaciones',
      icon: Award,
      preview: `${mockCertifications.length} certificaciones verificadas`,
    },
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
      {/* Tabs with Hover Preview - Pure Navigation Only */}
      <div className="border-b border-neutral-200">
        <div className="flex gap-2 md:gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <Tooltip
                key={item.id}
                content={
                  <div className="p-3 max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-[#4654CD]" />
                      <span className="text-xs font-semibold text-neutral-700">Vista previa</span>
                    </div>
                    <p className="text-xs text-neutral-600">{item.preview}</p>
                  </div>
                }
                classNames={{
                  content: 'bg-white shadow-lg border border-neutral-200',
                }}
                delay={300}
                closeDelay={0}
              >
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#4654CD] text-[#4654CD]'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={`font-medium text-sm md:text-base ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetailTabsV6;
