"use client";

import type { ProfileIdentificationProps } from "./types";

/**
 * ProfileIdentification - Versión D (Sin sección)
 *
 * Características:
 * - No muestra ninguna pregunta de identificación
 * - Permite a los usuarios navegar libremente sin interrupciones
 * - Ideal para: testing A/B, experiencia sin fricción
 * - Trade-off: no se recopila información del perfil del usuario
 */

export const ProfileIdentificationV4 = ({ onResponse }: ProfileIdentificationProps) => {
  // No renderiza nada
  return null;
};
