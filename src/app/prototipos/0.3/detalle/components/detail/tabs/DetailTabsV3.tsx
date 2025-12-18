'use client';

/**
 * DetailTabsV3 - Scroll Continuo con Nav Sticky
 *
 * Caracteristicas:
 * - Todo el contenido visible en scroll
 * - Navegacion lateral sticky
 * - Smooth scroll a secciones
 * - Ideal para: desktop, lectura continua
 */

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, FileText, Calendar, Settings, Battery, Wifi, CheckCircle } from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';

interface Section {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DetailTabsV3: React.FC<DetailTabsProps> = ({
  product,
  specsVersion,
  tooltipsVersion,
}) => {
  const [activeSection, setActiveSection] = useState('specs');
  const containerRef = useRef<HTMLDivElement>(null);

  const sections: Section[] = [
    { id: 'specs', label: 'Especificaciones', icon: Cpu },
    { id: 'features', label: 'Caracteristicas', icon: CheckCircle },
    { id: 'description', label: 'Descripcion', icon: FileText },
    { id: 'ports', label: 'Puertos', icon: Settings },
    { id: 'software', label: 'Software', icon: Settings },
    { id: 'battery', label: 'Bateria', icon: Battery },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Cpu,
    Battery,
    Wifi,
    MemoryStick: Cpu,
    HardDrive: Settings,
    Monitor: Settings,
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Navegacion lateral sticky - solo desktop */}
      <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-40">
        <div className="bg-white border border-neutral-200 rounded-xl p-2 shadow-lg">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                activeSection === section.id
                  ? 'bg-[#4654CD] text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <section.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="space-y-12">
        {/* Especificaciones */}
        <section id="specs" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#4654CD]" />
            </div>
            Especificaciones tecnicas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.specs.map((category) => {
              const IconComponent = iconMap[category.icon] || Cpu;
              return (
                <div
                  key={category.category}
                  className="bg-white border border-neutral-200 rounded-xl p-6"
                >
                  <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-[#4654CD]" />
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.specs.map((spec, index) => (
                      <div
                        key={index}
                        className={`flex justify-between items-center py-2 ${
                          spec.highlight
                            ? 'bg-[#4654CD]/5 px-3 rounded-lg -mx-3'
                            : 'border-b border-neutral-100 last:border-0'
                        }`}
                      >
                        <span className="text-neutral-600 text-sm">{spec.label}</span>
                        <span
                          className={`font-medium text-sm ${
                            spec.highlight ? 'text-[#4654CD]' : 'text-neutral-800'
                          }`}
                        >
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Caracteristicas */}
        <section id="features" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#03DBD0]/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#03DBD0]" />
            </div>
            Caracteristicas destacadas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.features.map((feature, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 bg-white border border-neutral-200 rounded-xl hover:border-[#4654CD]/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-6 h-6 text-[#4654CD]" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Descripcion */}
        <section id="description" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            Descripcion del producto
          </h2>

          <div className="bg-white border border-neutral-200 rounded-xl p-8">
            <p className="text-neutral-700 leading-relaxed text-lg">{product.description}</p>
          </div>
        </section>

        {/* Puertos */}
        <section id="ports" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-neutral-600" />
            </div>
            Puertos y conectividad
          </h2>

          <div className="bg-white border border-neutral-200 rounded-xl p-8">
            {/* Diagrama visual */}
            <div className="flex items-center justify-center gap-12 mb-8">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-neutral-500">Izquierda</p>
                {product.ports
                  .filter((p) => p.position === 'left')
                  .map((port, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 bg-[#4654CD]/5 border border-[#4654CD]/20 rounded-lg text-sm text-[#4654CD]"
                    >
                      {port.name}
                    </div>
                  ))}
              </div>

              <div className="w-40 h-24 bg-neutral-100 rounded-xl flex items-center justify-center border-2 border-neutral-200">
                <span className="text-neutral-400 text-sm">Vista superior</span>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-neutral-500">Derecha</p>
                {product.ports
                  .filter((p) => p.position === 'right')
                  .map((port, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 bg-[#4654CD]/5 border border-[#4654CD]/20 rounded-lg text-sm text-[#4654CD]"
                    >
                      {port.name}
                    </div>
                  ))}
              </div>
            </div>

            {/* Grid de puertos */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {product.ports.map((port, index) => (
                <div key={index} className="text-center p-4 bg-neutral-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-2">
                    <Settings className="w-5 h-5 text-neutral-400" />
                  </div>
                  <p className="text-sm font-medium text-neutral-800">{port.name}</p>
                  <p className="text-xs text-neutral-400">{port.count}x</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Software */}
        <section id="software" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            Software incluido
            {product.hasOS && (
              <span className="ml-3 px-3 py-1 bg-[#22c55e] text-white text-sm rounded-full">
                Con {product.osName}
              </span>
            )}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {product.software.map((sw, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border ${
                  sw.included
                    ? 'bg-[#22c55e]/5 border-[#22c55e]/20'
                    : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      sw.included ? 'bg-[#22c55e]/10' : 'bg-neutral-200'
                    }`}
                  >
                    <Settings
                      className={`w-5 h-5 ${sw.included ? 'text-[#22c55e]' : 'text-neutral-400'}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">{sw.name}</p>
                    {sw.included ? (
                      <span className="text-xs text-[#22c55e]">Incluido</span>
                    ) : (
                      <span className="text-xs text-neutral-400">Opcional</span>
                    )}
                  </div>
                </div>
                {sw.description && (
                  <p className="text-sm text-neutral-600">{sw.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bateria */}
        <section id="battery" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Battery className="w-5 h-5 text-green-600" />
            </div>
            Bateria y autonomia
          </h2>

          <div className="bg-white border border-neutral-200 rounded-xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <Battery className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-3xl font-bold text-green-700">{product.batteryLife}</p>
                <p className="text-sm text-green-600">Duracion estimada</p>
              </div>

              {product.fastCharge && (
                <div className="text-center p-6 bg-amber-50 rounded-xl">
                  <Wifi className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                  <p className="text-3xl font-bold text-amber-700">{product.fastCharge}</p>
                  <p className="text-sm text-amber-600">Carga rapida</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetailTabsV3;
