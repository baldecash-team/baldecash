'use client';

/**
 * DetailTabsV1 - Scroll Continuo + Nav Sticky Lateral (PREFERIDO)
 *
 * Continuous scroll layout with sticky side navigation that highlights
 * the current section based on scroll position. This is the PREFERRED
 * version from 0.3 feedback.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Cpu, FileText, Award, ChevronRight, Zap, Battery, Feather, Shield, type LucideIcon } from 'lucide-react';

// Icon mapping for features
const featureIcons: Record<string, LucideIcon> = {
  Zap,
  Battery,
  Feather,
  Shield,
};
import { DetailTabsProps } from '../../../types/detail';
import { mockCertifications } from '../../../data/mockDetailData';

export const DetailTabsV1: React.FC<DetailTabsProps> = ({ product }) => {
  const [activeSection, setActiveSection] = useState('specs');
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const [key, ref] of Object.entries(sectionsRef.current)) {
        if (ref) {
          const { offsetTop, offsetHeight } = ref;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(key);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = sectionsRef.current[sectionId];
    if (section) {
      const yOffset = -100;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'specs', label: 'Especificaciones', icon: Cpu },
    { id: 'description', label: 'Descripción', icon: FileText },
    { id: 'certifications', label: 'Certificaciones', icon: Award },
  ];

  return (
    <div className="flex gap-8">
      {/* Sticky Side Navigation - Hidden on Mobile */}
      <div className="hidden lg:block w-48 shrink-0">
        <div className="sticky top-24">
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

      {/* Content Sections */}
      <div className="flex-1 space-y-12">
        {/* Especificaciones Section */}
        <section
          ref={(el) => { sectionsRef.current['specs'] = el; }}
          id="specs"
          className="scroll-mt-24"
        >
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-[#4654CD]" />
            <h2 className="text-xl font-bold text-neutral-900 font-['Baloo_2']">
              Especificaciones Técnicas
            </h2>
          </div>
          <Accordion variant="bordered" className="px-0">
            {product.specs.map((specCategory, index) => (
              <AccordionItem
                key={index}
                title={
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">
                      {specCategory.category}
                    </span>
                  </div>
                }
                classNames={{
                  base: 'border-neutral-200',
                  title: 'text-sm',
                  content: 'pb-4',
                }}
              >
                <div className="space-y-3">
                  {specCategory.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start gap-4 py-2"
                    >
                      <span className="text-sm text-neutral-600 min-w-[120px]">
                        {spec.label}
                      </span>
                      <span
                        className={`text-sm text-right ${
                          spec.highlight
                            ? 'font-semibold text-neutral-900'
                            : 'text-neutral-700'
                        }`}
                      >
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Descripción Section */}
        <section
          ref={(el) => { sectionsRef.current['description'] = el; }}
          id="description"
          className="scroll-mt-24"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#4654CD]" />
            <h2 className="text-xl font-bold text-neutral-900 font-['Baloo_2']">
              Descripción del Producto
            </h2>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-neutral-700 leading-relaxed">{product.description}</p>

            {product.features.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => {
                  const IconComponent = featureIcons[feature.icon];
                  return (
                    <div
                      key={index}
                      className="flex gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-200"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                        {IconComponent ? (
                          <IconComponent className="w-5 h-5 text-[#4654CD]" />
                        ) : (
                          <span className="text-lg">{feature.icon}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-neutral-600">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Certificaciones Section */}
        <section
          ref={(el) => { sectionsRef.current['certifications'] = el; }}
          id="certifications"
          className="scroll-mt-24"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-[#4654CD]" />
            <h2 className="text-xl font-bold text-neutral-900 font-['Baloo_2']">
              Certificaciones
            </h2>
          </div>
          <div className="space-y-4">
            {mockCertifications.map((cert) => (
              <div
                key={cert.code}
                className="flex gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200"
              >
                <div className="shrink-0 w-16 h-16 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                  <Award className="w-8 h-8 text-[#4654CD]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {cert.description}
                  </p>
                  {cert.learnMoreUrl && (
                    <a
                      href={cert.learnMoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#4654CD] hover:underline mt-2 inline-block cursor-pointer"
                    >
                      Más información
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetailTabsV1;
