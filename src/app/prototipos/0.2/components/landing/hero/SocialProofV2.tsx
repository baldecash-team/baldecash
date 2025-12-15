"use client";

import { useEffect, useState } from "react";
import type { SocialProofProps } from "./types";

/**
 * SocialProof - Versión B (Grid compacto)
 *
 * Características:
 * - Grid de logos pequeños (4x4 o similar)
 * - Todos visibles a la vez
 * - Hover para resaltar
 * - Contador de estudiantes con animación
 * - Ideal para: mostrar credibilidad completa de un vistazo
 * - Trade-off: requiere más espacio vertical
 */

// Color mapping for institutions
const getInstitutionColor = (name: string): string => {
  const colors: Record<string, string> = {
    'UPN': '#FF6B35',
    'UPC': '#E63946',
    'USIL': '#2A9D8F',
    'UCAL': '#E76F51',
    'UAP': '#F4A261',
    'UCSUR': '#264653',
    'UTP': '#E9C46A',
    'CIBERTEC': '#457B9D',
  };
  return colors[name.toUpperCase()] || '#4654CD';
};

export const SocialProofV2 = ({ studentCount, institutions }: SocialProofProps) => {
  const [count, setCount] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const duration = 2000;

  // Animated counter
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * studentCount));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [studentCount]);

  return (
    <div className="w-full py-10 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        {/* Student Counter */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-[#4654CD]/5 to-[#03DBD0]/5 rounded-2xl border border-[#E5E5E5]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4654CD] to-[#03DBD0] flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
            <div className="text-left">
              <div
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#4654CD] to-[#03DBD0] bg-clip-text text-transparent"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                {count.toLocaleString()}+
              </div>
              <p
                className="text-sm text-[#737373]"
                style={{ fontFamily: "'Asap', sans-serif" }}
              >
                estudiantes ya financiados
              </p>
            </div>
          </div>
        </div>

        {/* Institutions Grid Header */}
        <div className="text-center mb-6">
          <h3
            className="text-2xl font-bold text-[#262626] mb-2"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Convenios con {institutions.length} instituciones
          </h3>
          <p className="text-[#737373]" style={{ fontFamily: "'Asap', sans-serif" }}>
            Las mejores universidades confían en BaldeCash
          </p>
        </div>

        {/* Institutions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {institutions.map((institution, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                relative bg-white rounded-lg border-2 p-4 flex items-center justify-center h-24
                transition-all duration-300 cursor-pointer
                ${
                  hoveredIndex === index
                    ? "border-[#4654CD] shadow-lg scale-105 z-10"
                    : "border-[#E5E5E5] hover:border-[#03DBD0]"
                }
              `}
              style={{
                backgroundColor: hoveredIndex === index ? getInstitutionColor(institution.name) : `${getInstitutionColor(institution.name)}20`,
                transition: 'all 0.3s ease',
              }}
            >
              <div className="flex items-center justify-center w-full h-full">
                <span
                  className={`font-bold text-center transition-all ${
                    hoveredIndex === index
                      ? "text-white text-base"
                      : "text-sm"
                  }`}
                  style={{
                    fontFamily: "'Baloo 2', cursive",
                    color: hoveredIndex === index ? 'white' : getInstitutionColor(institution.name),
                  }}
                >
                  {institution.name}
                </span>
              </div>

              {/* Tooltip on hover */}
              {hoveredIndex === index && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#262626] text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap z-20">
                  {institution.name}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#262626]"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <a
            href="/instituciones"
            className="text-[#4654CD] font-semibold hover:text-[#03DBD0] transition-colors"
            style={{ fontFamily: "'Asap', sans-serif" }}
          >
            Ver todas las instituciones →
          </a>
        </div>
      </div>
    </div>
  );
};
