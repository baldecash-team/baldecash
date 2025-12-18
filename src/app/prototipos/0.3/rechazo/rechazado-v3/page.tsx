'use client';

/**
 * Rejection V3 Page - Minimalista y enfocado
 *
 * Configuración:
 * - Visual: Colores de marca suavizados, minimalista
 * - Mensaje: Condicional basado en contexto
 * - Explicación: Conversacional sin especificidades
 * - Alternativas: Un solo producto recomendado
 * - Calculadora: No mostrar
 * - Aval: No mostrar
 * - Retención: No mostrar
 * - Timeline: No mostrar
 * - Soporte: No mostrar
 */

import React from 'react';
import { RejectionScreen } from '../components/rejection';
import { RejectionConfig } from '../types/rejection';
import {
  mockRejectionData,
  alternativeProducts,
} from '../data/mockRejectionData';

const v3Config: RejectionConfig = {
  visualVersion: 3,
  illustrationType: 'none',
  brandingLevel: 'minimal',
  messageVersion: 3,
  explanationVersion: 3,
  alternativesVersion: 3,
  productAlternativesVersion: 3,
  calculatorVersion: 3,
  retentionVersion: 3,
  retryTimelineVersion: 3,
  supportVersion: 3,
};

export default function RechazadoV3Page() {
  return (
    <RejectionScreen
      config={v3Config}
      data={mockRejectionData}
      alternativeProducts={alternativeProducts}
      onGoHome={() => window.history.back()}
      onGoBack={() => window.history.back()}
    />
  );
}
