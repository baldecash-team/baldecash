'use client';

/**
 * ProfileIdentificationV4 - Sin seccion (sin friccion)
 *
 * Caracteristicas:
 * - No muestra nada al usuario
 * - Flujo sin friccion
 * - Deteccion automatica si es posible
 */

import React from 'react';
import { ProfileIdentificationProps } from '../../../types/hero';

export const ProfileIdentificationV4: React.FC<ProfileIdentificationProps> = () => {
  // Esta version no renderiza nada visible
  // Podria implementar deteccion automatica en el futuro
  return null;
};

export default ProfileIdentificationV4;
