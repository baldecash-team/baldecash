"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Link } from "@nextui-org/react";
import type { SocialProofProps } from "./types";

/**
 * SocialProof - Versión C (Contador + logos destacados)
 *
 * Características:
 * - Número grande "32+" con texto
 * - Solo 4-5 logos de instituciones principales
 * - Link "Ver todas las instituciones"
 * - Contador de estudiantes con animación
 * - Ideal para: enfoque en cifras impactantes, diseño limpio
 * - Trade-off: no muestra todas las instituciones
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

export const SocialProofV3 = ({ studentCount, institutions }: SocialProofProps) => {
  const [count, setCount] = useState(0);
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

  // Get featured institutions (first 5 or those marked as featured)
  const featuredInstitutions = institutions.filter((i) => i.featured).slice(0, 5);
  const displayInstitutions =
    featuredInstitutions.length > 0 ? featuredInstitutions : institutions.slice(0, 5);

  return (
    <div className="w-full py-10 bg-gradient-to-b from-[#FAFAFA] to-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Stats */}
          <div className="space-y-6">
            {/* Student Counter */}
            <Card className="bg-gradient-to-br from-[#4654CD] to-[#03DBD0] border-0">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl">🎓</span>
                  </div>
                  <div>
                    <div
                      className="text-5xl font-bold text-white mb-1"
                      style={{ fontFamily: "'Baloo 2', cursive" }}
                    >
                      {count.toLocaleString()}+
                    </div>
                    <p
                      className="text-white/90 text-sm"
                      style={{ fontFamily: "'Asap', sans-serif" }}
                    >
                      estudiantes financiados
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Institution Counter */}
            <Card className="bg-white border-2 border-[#E5E5E5]">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4654CD]/10 to-[#03DBD0]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl">🏛️</span>
                  </div>
                  <div>
                    <div
                      className="text-5xl font-bold bg-gradient-to-r from-[#4654CD] to-[#03DBD0] bg-clip-text text-transparent mb-1"
                      style={{ fontFamily: "'Baloo 2', cursive" }}
                    >
                      {institutions.length}+
                    </div>
                    <p
                      className="text-[#737373] text-sm"
                      style={{ fontFamily: "'Asap', sans-serif" }}
                    >
                      instituciones aliadas
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right: Featured Institutions */}
          <div>
            <h3
              className="text-xl font-bold text-[#262626] mb-4 text-center"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Instituciones destacadas
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {displayInstitutions.map((institution, index) => (
                <div
                  key={index}
                  className="rounded-lg border-2 p-4 flex items-center justify-center h-20 hover:shadow-md transition-all group"
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

            {/* View All Link */}
            <div className="text-center">
              <Link
                href="/instituciones"
                className="text-[#4654CD] font-semibold hover:text-[#03DBD0] transition-colors inline-flex items-center gap-1"
                style={{ fontFamily: "'Asap', sans-serif" }}
              >
                Ver todas las instituciones
                <span className="text-lg">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
