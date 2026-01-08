'use client';

/**
 * RejectionScreen - Pantalla principal de rechazo
 * Orquesta todos los componentes de la pantalla
 * Versión fija para v0.5
 */

import React from 'react';
import { RejectionData } from '../../types/rejection';
import { mockAlternativeProducts } from '../../data/mockRejectionData';

// Components
import { Illustration } from './illustration';
import { RejectionMessage } from './message';
import { ExplanationDetail, ExplanationFraming } from './explanation';
import {
  AlternativesLayout,
  ProductAlternatives,
  DownPaymentCalculator,
} from './alternatives';
import { EmailCapture, RetryTimeline, EducationalContent } from './retention';
import { ContactOptions } from './support';

interface RejectionScreenProps {
  data: RejectionData;
}

export const RejectionScreen: React.FC<RejectionScreenProps> = ({ data }) => {
  // Obtener calculadora si existe
  const calculator = data.alternatives.find((a) => a.type === 'down_payment')?.calculator;

  return (
    <div className="min-h-screen bg-[#4654CD]/5">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Ilustración */}
        <Illustration />

        {/* Mensaje principal */}
        <RejectionMessage userName={data.userName} />

        {/* Explicación */}
        <div className="space-y-4 mb-8">
          <ExplanationDetail category={data.rejectionCategory} />
          <ExplanationFraming />
        </div>

        {/* Alternativas */}
        <AlternativesLayout alternatives={data.alternatives} />

        {/* Productos alternativos */}
        <div className="mb-8">
          <ProductAlternatives products={mockAlternativeProducts} />
        </div>

        {/* Calculadora de cuota inicial */}
        {calculator && (
          <div className="mb-8">
            <DownPaymentCalculator calculator={calculator} />
          </div>
        )}

        {/* Captura de email */}
        <div className="mb-8">
          <EmailCapture />
        </div>

        {/* Timeline de reintento */}
        <div className="mb-8">
          <RetryTimeline daysUntilRetry={data.canRetryIn} />
        </div>

        {/* Contenido educativo */}
        <div className="mb-8">
          <EducationalContent />
        </div>

        {/* Opciones de contacto */}
        <ContactOptions />
      </div>
    </div>
  );
};

export default RejectionScreen;
