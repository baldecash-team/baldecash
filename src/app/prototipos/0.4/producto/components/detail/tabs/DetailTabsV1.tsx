'use client';

/**
 * DetailTabsV1 - Scroll Continuo + Nav Sticky Compacto
 *
 * Pure navigation component with compact sticky sidebar.
 * Fixed position on desktop, horizontal scroll on mobile.
 * 6 navigation options for all page sections.
 */

import React, { useState, useEffect } from 'react';
import {
  Image,
  Info,
  Calculator,
  Cpu,
  Award,
  Package,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';

export const DetailTabsV1: React.FC<DetailTabsProps> = () => {
  const [activeSection, setActiveSection] = useState('section-gallery');

  // All 6 navigation sections
  const navItems = [
    { id: 'section-gallery', label: 'Galería', icon: Image },
    { id: 'section-info', label: 'Info', icon: Info },
    { id: 'section-pricing', label: 'Cuotas', icon: Calculator },
    { id: 'section-specs', label: 'Specs', icon: Cpu },
    { id: 'section-cronograma', label: 'Cronograma', icon: Calendar },
    { id: 'section-similar', label: 'Similares', icon: Package },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const item of [...navItems].reverse()) {
        const element = document.getElementById(item.id);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Desktop: Compact Sticky Sidebar */}
      <div className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-neutral-200 p-2">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4654CD] text-white shadow-md'
                      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                  {/* Tooltip on hover */}
                  <span className={`absolute left-full ml-3 px-2 py-1 text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                    isActive
                      ? 'bg-[#4654CD] text-white'
                      : 'bg-neutral-800 text-white'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile: Horizontal Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-neutral-200 safe-area-inset-bottom">
        <div className="flex justify-around py-2 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#4654CD]'
                    : 'text-neutral-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DetailTabsV1;
