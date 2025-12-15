"use client";

import { Card, CardBody, Chip } from "@nextui-org/react";
import type { InstitutionalBannerProps } from "./types";

/**
 * InstitutionalBanner - Versión C (Sección integrada en hero)
 *
 * Características:
 * - Área dedicada dentro del hero section
 * - Logo grande + mensaje de bienvenida
 * - Destaca las condiciones especiales con badge
 * - Ideal para: balance entre integración y visibilidad
 * - Trade-off: ocupa espacio en el hero
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

export const InstitutionalBannerV3 = ({
  institutionName,
  institutionLogo,
  hasSpecialConditions,
  customMessage,
}: InstitutionalBannerProps) => {
  const defaultMessage = `¡Hola, estudiante de ${institutionName}! Accede a tu financiamiento personalizado`;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <Card className="border-2 border-[#4654CD]/20 bg-gradient-to-br from-[#4654CD]/5 to-[#03DBD0]/5">
        <CardBody className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Institution Logo */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl shadow-lg p-3 flex items-center justify-center border-2"
                  style={{
                    backgroundColor: `${getInstitutionColor(institutionName)}20`,
                    borderColor: getInstitutionColor(institutionName),
                  }}
                >
                  <span
                    className="text-lg md:text-xl font-bold text-center"
                    style={{
                      fontFamily: "'Baloo 2', cursive",
                      color: getInstitutionColor(institutionName),
                    }}
                  >
                    {institutionName}
                  </span>
                </div>
                {/* Decorative glow */}
                {hasSpecialConditions && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4654CD] to-[#03DBD0] flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg">⭐</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 text-center md:text-left">
              <h2
                className="text-2xl md:text-3xl font-bold text-[#262626] mb-2"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                {customMessage || defaultMessage}
              </h2>

              <p
                className="text-[#737373] mb-3"
                style={{ fontFamily: "'Asap', sans-serif" }}
              >
                Tu institución tiene convenio exclusivo con BaldeCash
              </p>

              {/* Special Conditions Badge */}
              {hasSpecialConditions && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Chip
                    className="bg-gradient-to-r from-[#4654CD] to-[#03DBD0] text-white font-semibold"
                    size="lg"
                    variant="solid"
                  >
                    Condiciones especiales
                  </Chip>
                  <Chip
                    className="bg-white text-[#4654CD] border-2 border-[#4654CD] font-semibold"
                    size="lg"
                    variant="bordered"
                  >
                    Aprobación prioritaria
                  </Chip>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
