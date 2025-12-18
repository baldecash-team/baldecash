'use client';

/**
 * Rejection V1 Page - Empático y detallado
 *
 * Configuración:
 * - Visual: Neutros con persona pensativa
 * - Mensaje: Personalizado con nombre
 * - Explicación: Breve con tips específicos
 * - Alternativas: Grid de 3 productos
 * - Calculadora: Slider interactivo
 * - Aval: Prominente
 * - Retención: Integrado en flujo
 * - Timeline: Visual con fechas
 * - Soporte: Prominente con múltiples canales
 */

import React from 'react';
import { RejectionScreen } from '../components/rejection';
import { RejectionConfig } from '../types/rejection';
import {
  mockRejectionData,
  alternativeProducts,
} from '../data/mockRejectionData';

const v1Config: RejectionConfig = {
  visualVersion: 1,
  illustrationType: 'person',
  brandingLevel: 'logo_only',
  messageVersion: 1,
  explanationVersion: 1,
  alternativesVersion: 1,
  productAlternativesVersion: 1,
  calculatorVersion: 1,
  retentionVersion: 1,
  retryTimelineVersion: 1,
  supportVersion: 1,
};

export default function RechazadoV1Page() {
  return (
    <RejectionScreen
      config={v1Config}
      data={mockRejectionData}
      alternativeProducts={alternativeProducts}
      onGoHome={() => window.history.back()}
      onGoBack={() => window.history.back()}
    />
  );
}
