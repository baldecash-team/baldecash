'use client';

import React from 'react';
import {
  RejectionConfig,
  RejectionData,
  mockRejectionData,
  mockAlternativeProducts,
} from '../../types/rejection';

// Visual components
import {
  RejectionVisualV1,
  RejectionVisualV2,
  RejectionVisualV3,
  RejectionVisualV4,
  RejectionVisualV5,
  RejectionVisualV6,
} from './visual';

import {
  IllustrationTypeV1,
  IllustrationTypeV2,
  IllustrationTypeV3,
  IllustrationTypeV4,
  IllustrationTypeV5,
  IllustrationTypeV6,
} from './illustration';

import {
  BrandingLevelV1,
  BrandingLevelV2,
  BrandingLevelV3,
  BrandingLevelV4,
  BrandingLevelV5,
  BrandingLevelV6,
} from './branding';

// Message components
import {
  MessagePersonalizationV1,
  MessagePersonalizationV2,
  MessagePersonalizationV3,
  MessagePersonalizationV4,
  MessagePersonalizationV5,
  MessagePersonalizationV6,
} from './message';

// Explanation components
import {
  ExplanationDetailV1,
  ExplanationDetailV2,
  ExplanationDetailV3,
  ExplanationDetailV4,
  ExplanationDetailV5,
  ExplanationDetailV6,
  ExplanationFramingV1,
  ExplanationFramingV2,
  ExplanationFramingV3,
  ExplanationFramingV4,
  ExplanationFramingV5,
  ExplanationFramingV6,
} from './explanation';

// Alternatives components
import {
  AlternativesLayoutV1,
  AlternativesLayoutV2,
  AlternativesLayoutV3,
  AlternativesLayoutV4,
  AlternativesLayoutV5,
  AlternativesLayoutV6,
  ProductAlternativesV1,
  ProductAlternativesV2,
  ProductAlternativesV3,
  ProductAlternativesV4,
  ProductAlternativesV5,
  ProductAlternativesV6,
  DownPaymentCalculatorV1,
  DownPaymentCalculatorV2,
  DownPaymentCalculatorV3,
  DownPaymentCalculatorV4,
  DownPaymentCalculatorV5,
  DownPaymentCalculatorV6,
  CosignerOption,
} from './alternatives';

// Retention components
import {
  EmailCaptureV1,
  EmailCaptureV2,
  EmailCaptureV3,
  EmailCaptureV4,
  EmailCaptureV5,
  EmailCaptureV6,
  RetryTimelineV1,
  RetryTimelineV2,
  RetryTimelineV3,
  RetryTimelineV4,
  RetryTimelineV5,
  RetryTimelineV6,
  EducationalContent,
} from './retention';

// Support components
import {
  AdvisorCTAV1,
  AdvisorCTAV2,
  AdvisorCTAV3,
  AdvisorCTAV4,
  AdvisorCTAV5,
  AdvisorCTAV6,
  AdvisorMessageV1,
  AdvisorMessageV2,
  AdvisorMessageV3,
  AdvisorMessageV4,
  AdvisorMessageV5,
  AdvisorMessageV6,
  ContactOptions,
} from './support';

interface RejectionScreenProps {
  config: RejectionConfig;
  data?: RejectionData;
}

/**
 * RejectionScreen - Pantalla Principal de Rechazo
 * Composición de todos los componentes según configuración
 */
export const RejectionScreen: React.FC<RejectionScreenProps> = ({
  config,
  data = mockRejectionData,
}) => {
  // Renderizar Visual según versión
  const renderVisual = () => {
    const props = {};
    switch (config.visualVersion) {
      case 1: return <RejectionVisualV1 {...props} />;
      case 2: return <RejectionVisualV2 {...props} />;
      case 3: return <RejectionVisualV3 {...props} />;
      case 4: return <RejectionVisualV4 {...props} />;
      case 5: return <RejectionVisualV5 {...props} />;
      case 6: return <RejectionVisualV6 {...props} />;
      default: return <RejectionVisualV1 {...props} />;
    }
  };

  // Renderizar Ilustración según versión
  const renderIllustration = () => {
    switch (config.illustrationVersion) {
      case 1: return <IllustrationTypeV1 />;
      case 2: return <IllustrationTypeV2 />;
      case 3: return <IllustrationTypeV3 />;
      case 4: return <IllustrationTypeV4 />;
      case 5: return <IllustrationTypeV5 />;
      case 6: return <IllustrationTypeV6 />;
      default: return <IllustrationTypeV1 />;
    }
  };

  // Renderizar Branding según versión
  const renderBranding = () => {
    switch (config.brandingVersion) {
      case 1: return <BrandingLevelV1 />;
      case 2: return <BrandingLevelV2 />;
      case 3: return <BrandingLevelV3 />;
      case 4: return <BrandingLevelV4 />;
      case 5: return <BrandingLevelV5 />;
      case 6: return <BrandingLevelV6 />;
      default: return <BrandingLevelV3 />;
    }
  };

  // Renderizar Mensaje según versión
  const renderMessage = () => {
    const props = { userName: data.userName };
    switch (config.messageVersion) {
      case 1: return <MessagePersonalizationV1 {...props} />;
      case 2: return <MessagePersonalizationV2 {...props} />;
      case 3: return <MessagePersonalizationV3 {...props} />;
      case 4: return <MessagePersonalizationV4 {...props} />;
      case 5: return <MessagePersonalizationV5 {...props} />;
      case 6: return <MessagePersonalizationV6 {...props} />;
      default: return <MessagePersonalizationV1 {...props} />;
    }
  };

  // Renderizar Explicación Detalle según versión
  const renderExplanationDetail = () => {
    const props = { category: data.rejectionCategory };
    switch (config.explanationDetailVersion) {
      case 1: return <ExplanationDetailV1 {...props} />;
      case 2: return <ExplanationDetailV2 {...props} />;
      case 3: return <ExplanationDetailV3 {...props} />;
      case 4: return <ExplanationDetailV4 {...props} />;
      case 5: return <ExplanationDetailV5 {...props} />;
      case 6: return <ExplanationDetailV6 {...props} />;
      default: return <ExplanationDetailV3 {...props} />;
    }
  };

  // Renderizar Framing según versión
  const renderExplanationFraming = () => {
    switch (config.explanationFramingVersion) {
      case 1: return <ExplanationFramingV1 />;
      case 2: return <ExplanationFramingV2 />;
      case 3: return <ExplanationFramingV3 />;
      case 4: return <ExplanationFramingV4 />;
      case 5: return <ExplanationFramingV5 />;
      case 6: return <ExplanationFramingV6 />;
      default: return <ExplanationFramingV1 />;
    }
  };

  // Renderizar Layout Alternativas según versión
  const renderAlternativesLayout = () => {
    const props = { alternatives: data.alternatives };
    switch (config.alternativesLayoutVersion) {
      case 1: return <AlternativesLayoutV1 {...props} />;
      case 2: return <AlternativesLayoutV2 {...props} />;
      case 3: return <AlternativesLayoutV3 {...props} />;
      case 4: return <AlternativesLayoutV4 {...props} />;
      case 5: return <AlternativesLayoutV5 {...props} />;
      case 6: return <AlternativesLayoutV6 {...props} />;
      default: return <AlternativesLayoutV1 {...props} />;
    }
  };

  // Renderizar Productos Alternativos según versión
  const renderProductAlternatives = () => {
    const props = { products: mockAlternativeProducts };
    switch (config.productAlternativesVersion) {
      case 1: return <ProductAlternativesV1 {...props} />;
      case 2: return <ProductAlternativesV2 {...props} />;
      case 3: return <ProductAlternativesV3 {...props} />;
      case 4: return <ProductAlternativesV4 {...props} />;
      case 5: return <ProductAlternativesV5 {...props} />;
      case 6: return <ProductAlternativesV6 {...props} />;
      default: return <ProductAlternativesV1 {...props} />;
    }
  };

  // Renderizar Calculadora según versión
  const renderCalculator = () => {
    const calculator = data.alternatives.find(a => a.type === 'down_payment')?.calculator;
    if (!calculator) return null;

    switch (config.calculatorVersion) {
      case 1: return <DownPaymentCalculatorV1 calculator={calculator} />;
      case 2: return <DownPaymentCalculatorV2 calculator={calculator} />;
      case 3: return <DownPaymentCalculatorV3 />;
      case 4: return <DownPaymentCalculatorV4 calculator={calculator} />;
      case 5: return <DownPaymentCalculatorV5 calculator={calculator} />;
      case 6: return <DownPaymentCalculatorV6 calculator={calculator} />;
      default: return <DownPaymentCalculatorV2 calculator={calculator} />;
    }
  };

  // Renderizar Email Capture según versión
  const renderEmailCapture = () => {
    switch (config.emailCaptureVersion) {
      case 1: return <EmailCaptureV1 />;
      case 2: return <EmailCaptureV2 />;
      case 3: return <EmailCaptureV3 />;
      case 4: return <EmailCaptureV4 />;
      case 5: return <EmailCaptureV5 />;
      case 6: return <EmailCaptureV6 />;
      default: return <EmailCaptureV1 />;
    }
  };

  // Renderizar Retry Timeline según versión
  const renderRetryTimeline = () => {
    const props = { daysUntilRetry: data.canRetryIn };
    switch (config.retryTimelineVersion) {
      case 1: return <RetryTimelineV1 {...props} />;
      case 2: return <RetryTimelineV2 {...props} />;
      case 3: return <RetryTimelineV3 {...props} />;
      case 4: return <RetryTimelineV4 {...props} />;
      case 5: return <RetryTimelineV5 {...props} />;
      case 6: return <RetryTimelineV6 {...props} />;
      default: return <RetryTimelineV1 {...props} />;
    }
  };

  // Renderizar Advisor CTA según versión
  const renderAdvisorCTA = () => {
    switch (config.advisorCTAVersion) {
      case 1: return <AdvisorCTAV1 />;
      case 2: return <AdvisorCTAV2 />;
      case 3: return <AdvisorCTAV3 />;
      case 4: return <AdvisorCTAV4 />;
      case 5: return <AdvisorCTAV5 />;
      case 6: return <AdvisorCTAV6 />;
      default: return <AdvisorCTAV1 />;
    }
  };

  // Renderizar Advisor Message según versión
  const renderAdvisorMessage = () => {
    switch (config.advisorMessageVersion) {
      case 1: return <AdvisorMessageV1 />;
      case 2: return <AdvisorMessageV2 />;
      case 3: return <AdvisorMessageV3 />;
      case 4: return <AdvisorMessageV4 />;
      case 5: return <AdvisorMessageV5 />;
      case 6: return <AdvisorMessageV6 />;
      default: return <AdvisorMessageV1 />;
    }
  };

  // Obtener clases de fondo según versión visual
  const getBackgroundClass = () => {
    switch (config.visualVersion) {
      case 1: return 'bg-neutral-100'; // Neutros fríos
      case 2: return 'bg-amber-50'; // Cálidos acogedores
      case 3: return 'bg-[#4654CD]/5'; // Marca suavizada
      case 4: return 'bg-neutral-50'; // Fintech minimalista
      case 5: return 'bg-white'; // Split visual
      case 6: return 'bg-neutral-50'; // Máxima calma
      default: return 'bg-neutral-50';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()}`}>
      {/* Header con Branding */}
      {renderBranding()}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Sección Visual + Ilustración */}
        <div className="mb-8">
          {renderIllustration()}
        </div>

        {/* Mensaje Principal */}
        <div className="text-center mb-8">
          {renderMessage()}
        </div>

        {/* Explicación */}
        <div className="space-y-4 mb-8">
          {renderExplanationDetail()}
          {renderExplanationFraming()}
        </div>

        {/* Alternativas */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">¿Qué puedes hacer?</h2>
          {renderAlternativesLayout()}
        </div>

        {/* Productos Alternativos */}
        <div className="mb-8">
          {renderProductAlternatives()}
        </div>

        {/* Calculadora */}
        <div className="mb-8">
          {renderCalculator()}
        </div>

        {/* Codeudor */}
        <div className="mb-8">
          <CosignerOption />
        </div>

        {/* Retención - Email */}
        <div className="mb-8">
          {renderEmailCapture()}
        </div>

        {/* Retry Timeline */}
        <div className="mb-8">
          {renderRetryTimeline()}
        </div>

        {/* Contenido Educativo */}
        <div className="mb-8">
          <EducationalContent />
        </div>

        {/* Soporte */}
        <div className="mb-8">
          {renderAdvisorMessage()}
        </div>

        <div className="mb-8">
          {renderAdvisorCTA()}
        </div>

        {/* Contacto */}
        <div className="mb-8">
          <ContactOptions />
        </div>
      </div>
    </div>
  );
};
