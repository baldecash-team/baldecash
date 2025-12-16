"use client";

import type { InstitutionalBannerProps } from "./types";

/**
 * InstitutionalBanner - Versión D (Sin sección)
 *
 * Características:
 * - No muestra ningún banner institucional
 * - Diseño limpio sin referencias a instituciones
 * - Ideal para: testing A/B, usuarios sin afiliación institucional
 * - Trade-off: no se aprovecha el sentido de pertenencia institucional
 */

export const InstitutionalBannerV4 = ({
  institutionName,
  institutionLogo,
  hasSpecialConditions,
  customMessage,
}: InstitutionalBannerProps) => {
  // No renderiza nada
  return null;
};
