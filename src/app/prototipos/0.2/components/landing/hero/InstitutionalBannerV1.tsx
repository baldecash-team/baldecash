"use client";

import { Chip } from "@nextui-org/react";
import type { InstitutionalBannerProps } from "./types";

/**
 * InstitutionalBanner - Versión A (Banner horizontal completo)
 *
 * Características:
 * - Ocupa todo el ancho arriba del hero
 * - Logo de institución + mensaje personalizado
 * - Colores que combinen con la institución
 * - Ideal para: máxima visibilidad y sentido de pertenencia
 * - Trade-off: ocupa espacio prominente
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

export const InstitutionalBannerV1 = ({
  institutionName,
  institutionLogo,
  hasSpecialConditions,
  customMessage,
}: InstitutionalBannerProps) => {
  const defaultMessage = `Bienvenido estudiante ${institutionName}${
    hasSpecialConditions ? " - Tienes condiciones especiales" : ""
  }`;

  return (
    <div className="w-full bg-gradient-to-r from-[#4654CD]/5 via-[#03DBD0]/5 to-[#4654CD]/5 border-b-2 border-[#03DBD0]/20">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          {/* Institution Logo */}
          <div className="flex-shrink-0">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-lg shadow-md p-2 flex items-center justify-center border-2"
              style={{
                backgroundColor: `${getInstitutionColor(institutionName)}20`,
                borderColor: getInstitutionColor(institutionName),
              }}
            >
              <span
                className="text-sm md:text-base font-bold text-center"
                style={{
                  fontFamily: "'Baloo 2', cursive",
                  color: getInstitutionColor(institutionName),
                }}
              >
                {institutionName}
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="text-center md:text-left flex-1">
            <h2
              className="text-xl md:text-2xl font-bold text-[#262626] mb-1"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {customMessage || defaultMessage}
            </h2>
            <p className="text-sm text-[#737373]" style={{ fontFamily: "'Asap', sans-serif" }}>
              Tu institución tiene convenio con BaldeCash
            </p>
          </div>

          {/* Special Conditions Badge */}
          {hasSpecialConditions && (
            <div className="flex-shrink-0">
              <Chip
                className="bg-gradient-to-r from-[#4654CD] to-[#03DBD0] text-white font-semibold px-4 py-2"
                size="lg"
                variant="solid"
              >
                ⭐ Condiciones especiales
              </Chip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
