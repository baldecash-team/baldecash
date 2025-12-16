"use client";

import { useState } from "react";
import { Chip, Tooltip, Card, CardBody } from "@nextui-org/react";
import type { InstitutionalBannerProps } from "./types";
import { StarIcon, CloseIcon } from "./Icons";

/**
 * InstitutionalBanner - Versión B (Badge/Chip flotante)
 *
 * Características:
 * - Elemento pequeño en esquina del hero
 * - Logo de institución como avatar
 * - Tooltip o expandible con detalles
 * - Ideal para: presencia sutil pero reconocible
 * - Trade-off: menos prominente, puede pasar desapercibido
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

export const InstitutionalBannerV2 = ({
  institutionName,
  institutionLogo,
  hasSpecialConditions,
  customMessage,
}: InstitutionalBannerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tooltipContent = customMessage || `Estudiante ${institutionName}${
    hasSpecialConditions ? " con condiciones especiales" : ""
  }`;

  return (
    <div className="fixed top-24 right-4 md:right-8 z-30 animate-slide-left">
      {!isExpanded ? (
        // Collapsed state - Badge
        <Tooltip content={tooltipContent} placement="left" showArrow>
          <div
            onClick={() => setIsExpanded(true)}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            <Chip
              className="bg-[#4247d2] text-white font-semibold shadow-lg"
              size="lg"
              variant="solid"
            >
              <span className="flex items-center gap-1">
                {institutionName}
                {hasSpecialConditions && <StarIcon size={14} className="text-white" />}
              </span>
            </Chip>
          </div>
        </Tooltip>
      ) : (
        // Expanded state - Card
        <Card className="shadow-xl border border-[#E5E5E5] max-w-xs">
          <CardBody className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg shadow-md flex items-center justify-center border-2 flex-shrink-0"
                  style={{
                    backgroundColor: `${getInstitutionColor(institutionName)}20`,
                    borderColor: getInstitutionColor(institutionName),
                  }}
                >
                  <span
                    className="text-xs font-bold text-center"
                    style={{
                      fontFamily: "'Baloo 2', cursive",
                      color: getInstitutionColor(institutionName),
                    }}
                  >
                    {institutionName}
                  </span>
                </div>
                <div>
                  <h3
                    className="text-sm font-bold text-[#262626]"
                    style={{ fontFamily: "'Baloo 2', cursive" }}
                  >
                    {institutionName}
                  </h3>
                  {hasSpecialConditions && (
                    <Chip
                      size="sm"
                      className="bg-[#4247d2]/10 text-[#4247d2] font-semibold"
                    >
                      <span className="flex items-center gap-1">
                        <StarIcon size={12} className="text-[#4247d2]" />
                        Especial
                      </span>
                    </Chip>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-[#737373] hover:text-[#262626]"
                aria-label="Cerrar"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <p
              className="text-sm text-[#737373]"
              style={{ fontFamily: "'Asap', sans-serif" }}
            >
              {tooltipContent}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
