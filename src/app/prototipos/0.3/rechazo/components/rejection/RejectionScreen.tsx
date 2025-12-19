'use client';

/**
 * RejectionScreen - Main screen component that composes all rejection UI elements
 * Based on configuration, renders different versions of each component
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';

import {
  RejectionConfig,
  RejectionData,
  AlternativeProduct,
} from '../../types/rejection';

// Visual components
import { RejectionVisualV1, RejectionVisualV2, RejectionVisualV3 } from './visual';

// Message components
import {
  RejectionMessageV1,
  RejectionMessageV2,
  RejectionMessageV3,
} from './message';

// Explanation components
import { ExplanationV1, ExplanationV2, ExplanationV3 } from './explanation';

// Alternatives components
import {
  ProductAlternativesV1,
  ProductAlternativesV2,
  ProductAlternativesV3,
  DownPaymentCalculatorV1,
  DownPaymentCalculatorV2,
  CosignerOptionV1,
  CosignerOptionV2,
} from './alternatives';

// Retention components
import {
  EmailCaptureV1,
  EmailCaptureV2,
  RetryTimelineV1,
  RetryTimelineV2,
} from './retention';

// Support components
import {
  AdvisorCTAV1,
  AdvisorCTAV2,
  ContactOptionsV1,
  ContactOptionsV2,
} from './support';

interface RejectionScreenProps {
  config: RejectionConfig;
  data: RejectionData;
  alternativeProducts: AlternativeProduct[];
  onGoHome?: () => void;
  onGoBack?: () => void;
}

export const RejectionScreen: React.FC<RejectionScreenProps> = ({
  config,
  data,
  alternativeProducts,
  onGoHome,
  onGoBack,
}) => {
  const [showExitModal, setShowExitModal] = useState(false);

  // Render visual based on version
  const renderVisual = () => {
    switch (config.visualVersion) {
      case 1:
        return (
          <RejectionVisualV1 illustrationType={config.illustrationType} />
        );
      case 2:
        return (
          <RejectionVisualV2 illustrationType={config.illustrationType} />
        );
      case 3:
        return <RejectionVisualV3 brandingLevel={config.brandingLevel} />;
      default:
        return (
          <RejectionVisualV1 illustrationType={config.illustrationType} />
        );
    }
  };

  // Render message based on version
  const renderMessage = () => {
    switch (config.messageVersion) {
      case 1:
        return (
          <RejectionMessageV1
            userName={data.userName || 'Usuario'}
            productName={data.requestedProduct.name}
          />
        );
      case 2:
        return <RejectionMessageV2 productName={data.requestedProduct.name} />;
      case 3:
        return (
          <RejectionMessageV3
            userName={data.userName}
            productName={data.requestedProduct.name}
            rejectionCategory={data.rejectionCategory}
          />
        );
      default:
        return (
          <RejectionMessageV1
            userName={data.userName || 'Usuario'}
            productName={data.requestedProduct.name}
          />
        );
    }
  };

  // Render explanation based on version
  const renderExplanation = () => {
    switch (config.explanationVersion) {
      case 1:
        return (
          <ExplanationV1
            rejectionCategory={data.rejectionCategory || 'credit'}
            canRetryIn={data.canRetryIn}
          />
        );
      case 2:
        return (
          <ExplanationV2
            rejectionCategory={data.rejectionCategory || 'credit'}
            canRetryIn={data.canRetryIn}
          />
        );
      case 3:
        return <ExplanationV3 canRetryIn={data.canRetryIn} />;
      default:
        return <ExplanationV3 canRetryIn={data.canRetryIn} />;
    }
  };

  // Render product alternatives based on version
  const renderProductAlternatives = () => {
    switch (config.productAlternativesVersion) {
      case 1:
        return <ProductAlternativesV1 products={alternativeProducts} />;
      case 2:
        return <ProductAlternativesV2 products={alternativeProducts} />;
      case 3:
        return (
          <ProductAlternativesV3
            product={alternativeProducts[0]}
            originalPrice={data.requestedProduct.price}
          />
        );
      default:
        return <ProductAlternativesV1 products={alternativeProducts} />;
    }
  };

  // Render calculator based on version
  const renderCalculator = () => {
    if (config.calculatorVersion === 3) return null;

    switch (config.calculatorVersion) {
      case 1:
        return (
          <DownPaymentCalculatorV1
            productPrice={data.requestedProduct.price}
            originalMonthlyQuota={data.requestedProduct.monthlyQuota}
          />
        );
      case 2:
        return (
          <DownPaymentCalculatorV2
            productPrice={data.requestedProduct.price}
            originalMonthlyQuota={data.requestedProduct.monthlyQuota}
          />
        );
      default:
        return null;
    }
  };

  // Render cosigner option
  const renderCosignerOption = () => {
    if (config.alternativesVersion === 3) return null;

    switch (config.alternativesVersion) {
      case 1:
        return <CosignerOptionV1 />;
      case 2:
        return <CosignerOptionV2 />;
      default:
        return null;
    }
  };

  // Render retention based on version
  const renderRetention = () => {
    if (config.retentionVersion === 3) return null;

    switch (config.retentionVersion) {
      case 1:
        return <EmailCaptureV1 />;
      case 2:
        return (
          <EmailCaptureV2
            isOpen={showExitModal}
            onClose={() => setShowExitModal(false)}
            canRetryIn={data.canRetryIn}
          />
        );
      default:
        return null;
    }
  };

  // Render retry timeline based on version
  const renderRetryTimeline = () => {
    if (config.retryTimelineVersion === 3 || !data.canRetryIn) return null;

    switch (config.retryTimelineVersion) {
      case 1:
        return <RetryTimelineV1 canRetryIn={data.canRetryIn} />;
      case 2:
        return <RetryTimelineV2 canRetryIn={data.canRetryIn} />;
      default:
        return null;
    }
  };

  // Render support based on version
  const renderSupport = () => {
    if (config.supportVersion === 3) return null;

    switch (config.supportVersion) {
      case 1:
        return (
          <>
            <AdvisorCTAV1 />
            <ContactOptionsV1 />
          </>
        );
      case 2:
        return (
          <>
            <AdvisorCTAV2 />
            <ContactOptionsV2 />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto px-4 py-6"
      >
        {/* Visual + Message + Explanation */}
        <section className="mb-8">
          {renderVisual()}
          {renderMessage()}
          {renderExplanation()}
        </section>

        {/* Alternatives Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-neutral-800 mb-4">
            Tus opciones
          </h2>
          {renderProductAlternatives()}
          {renderCalculator()}
          {renderCosignerOption()}
        </section>

        {/* Retention Section */}
        <section className="mb-8">
          {renderRetryTimeline()}
          {config.retentionVersion === 1 && renderRetention()}
        </section>

        {/* Support Section */}
        <section className="mb-8">{renderSupport()}</section>

        {/* Footer Actions */}
        <div className="border-t border-neutral-200 pt-6 space-y-3">
          <Button
            variant="bordered"
            className="w-full border-neutral-300 text-neutral-600"
            onPress={() => {
              if (config.retentionVersion === 2) {
                setShowExitModal(true);
              } else {
                onGoHome?.();
              }
            }}
          >
            Volver al inicio
          </Button>
        </div>
      </motion.div>

      {/* Exit Modal for V2 retention */}
      {config.retentionVersion === 2 && renderRetention()}
    </div>
  );
};

export default RejectionScreen;
