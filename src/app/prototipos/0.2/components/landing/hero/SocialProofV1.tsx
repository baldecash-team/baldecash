"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@nextui-org/react";
import type { SocialProofProps } from "./types";

/**
 * SocialProof - Versión A (Carrusel automático)
 *
 * Características:
 * - Logos en movimiento horizontal continuo
 * - Muestra 5-6 logos a la vez
 * - Contador de estudiantes con animación
 * - Texto: "32 instituciones confían en nosotros"
 * - Ideal para: dinamismo y profesionalismo
 * - Trade-off: puede distraer del contenido principal
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

export const SocialProofV1 = ({ studentCount, institutions }: SocialProofProps) => {
  const [count, setCount] = useState(0);
  const duration = 2000; // 2 seconds animation

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

  // Duplicate institutions for infinite scroll effect
  const duplicatedInstitutions = [...institutions, ...institutions];

  return (
    <div className="w-full py-8 bg-gradient-to-b from-white to-[#F5F5F5]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Student Counter */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4654CD] to-[#03DBD0] flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="text-left">
              <div
                className="text-4xl font-bold bg-gradient-to-r from-[#4654CD] to-[#03DBD0] bg-clip-text text-transparent"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                {count.toLocaleString()}+
              </div>
              <p className="text-sm text-[#737373]" style={{ fontFamily: "'Asap', sans-serif" }}>
                estudiantes financiados
              </p>
            </div>
          </div>
        </div>

        {/* Institutions Header */}
        <div className="text-center mb-6">
          <h3
            className="text-xl font-bold text-[#262626] mb-1"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {institutions.length} instituciones confían en nosotros
          </h3>
          <p className="text-sm text-[#737373]" style={{ fontFamily: "'Asap', sans-serif" }}>
            Convenios activos con las mejores universidades
          </p>
        </div>

        {/* Carousel - Infinite scroll */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-horizontal gap-8 py-4">
            {duplicatedInstitutions.map((institution, index) => (
              <div
                key={`${institution.name}-${index}`}
                className="flex-shrink-0 w-32 h-20 rounded-lg shadow-sm border-2 flex items-center justify-center hover:shadow-md transition-all group"
                style={{
                  backgroundColor: `${getInstitutionColor(institution.name)}20`,
                  borderColor: getInstitutionColor(institution.name),
                }}
              >
                <span
                  className="text-sm font-bold text-center px-2 transition-all group-hover:text-base"
                  style={{
                    fontFamily: "'Baloo 2', cursive",
                    color: getInstitutionColor(institution.name),
                  }}
                >
                  {institution.name}
                </span>
              </div>
            ))}
          </div>
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#F5F5F5] to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#F5F5F5] to-transparent pointer-events-none"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-horizontal {
          animation: scroll-horizontal 30s linear infinite;
        }
        .animate-scroll-horizontal:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
