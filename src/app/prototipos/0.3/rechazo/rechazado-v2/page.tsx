'use client';

/**
 * Rejection V2 Page - Cálido y guiado
 *
 * Configuración:
 * - Visual: Colores cálidos con camino/bifurcación
 * - Mensaje: Genérico sin nombre
 * - Explicación: Detallado con factores
 * - Alternativas: Carrusel de productos
 * - Calculadora: Presets + input
 * - Aval: Sutil/colapsable
 * - Retención: Modal al salir
 * - Timeline: Texto simple
 * - Soporte: Sutil + WhatsApp
 */

import React from 'react';
import { RejectionScreen } from '../components/rejection';
import { RejectionConfig } from '../types/rejection';
import {
  mockRejectionData,
  alternativeProducts,
} from '../data/mockRejectionData';

const v2Config: RejectionConfig = {
  visualVersion: 2,
  illustrationType: 'path',
  brandingLevel: 'full',
  messageVersion: 2,
  explanationVersion: 2,
  alternativesVersion: 2,
  productAlternativesVersion: 2,
  calculatorVersion: 2,
  retentionVersion: 2,
  retryTimelineVersion: 2,
  supportVersion: 2,
};

export default function RechazadoV2Page() {
  return (
    <RejectionScreen
      config={v2Config}
      data={mockRejectionData}
      alternativeProducts={alternativeProducts}
      onGoHome={() => window.history.back()}
      onGoBack={() => window.history.back()}
    />
  );
}
