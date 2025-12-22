'use client';

import React, { useState } from 'react';
import type { InsurancePlan, UpsellConfig } from '../../../types/upsell';

// Import all intro versions
import InsuranceIntroV1 from './intro/InsuranceIntroV1';
import InsuranceIntroV2 from './intro/InsuranceIntroV2';
import InsuranceIntroV3 from './intro/InsuranceIntroV3';
import InsuranceIntroV4 from './intro/InsuranceIntroV4';
import InsuranceIntroV5 from './intro/InsuranceIntroV5';
import InsuranceIntroV6 from './intro/InsuranceIntroV6';

// Import all icon versions
import ProtectionIconV1 from './icon/ProtectionIconV1';
import ProtectionIconV2 from './icon/ProtectionIconV2';
import ProtectionIconV3 from './icon/ProtectionIconV3';
import ProtectionIconV4 from './icon/ProtectionIconV4';
import ProtectionIconV5 from './icon/ProtectionIconV5';
import ProtectionIconV6 from './icon/ProtectionIconV6';

// Import all comparison versions
import PlanComparisonV1 from './comparison/PlanComparisonV1';
import PlanComparisonV2 from './comparison/PlanComparisonV2';
import PlanComparisonV3 from './comparison/PlanComparisonV3';
import PlanComparisonV4 from './comparison/PlanComparisonV4';
import PlanComparisonV5 from './comparison/PlanComparisonV5';
import PlanComparisonV6 from './comparison/PlanComparisonV6';

// Import modals
import CoverageDetailModal from '../modals/CoverageDetailModal';
import SkipModalV1 from './skip/SkipModalV1';
import SkipModalV2 from './skip/SkipModalV2';
import SkipModalV3 from './skip/SkipModalV3';
import SkipModalV4 from './skip/SkipModalV4';
import SkipModalV5 from './skip/SkipModalV5';
import SkipModalV6 from './skip/SkipModalV6';

interface InsuranceSectionProps {
  plans: InsurancePlan[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string | null) => void;
  config: UpsellConfig;
  className?: string;
}

/**
 * InsuranceSection - Main wrapper for insurance upsell
 * Orchestrates all insurance-related components based on config
 */
export const InsuranceSection: React.FC<InsuranceSectionProps> = ({
  plans,
  selectedPlanId,
  onSelectPlan,
  config,
  className = '',
}) => {
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<InsurancePlan | null>(null);

  // Component maps
  const IntroComponents = {
    1: InsuranceIntroV1,
    2: InsuranceIntroV2,
    3: InsuranceIntroV3,
    4: InsuranceIntroV4,
    5: InsuranceIntroV5,
    6: InsuranceIntroV6,
  };

  const IconComponents = {
    1: ProtectionIconV1,
    2: ProtectionIconV2,
    3: ProtectionIconV3,
    4: ProtectionIconV4,
    5: ProtectionIconV5,
    6: ProtectionIconV6,
  };

  const ComparisonComponents = {
    1: PlanComparisonV1,
    2: PlanComparisonV2,
    3: PlanComparisonV3,
    4: PlanComparisonV4,
    5: PlanComparisonV5,
    6: PlanComparisonV6,
  };

  const SkipModalComponents = {
    1: SkipModalV1,
    2: SkipModalV2,
    3: SkipModalV3,
    4: SkipModalV4,
    5: SkipModalV5,
    6: SkipModalV6,
  };

  const IntroComponent = IntroComponents[config.insuranceIntroVersion];
  const IconComponent = IconComponents[config.protectionIconVersion];
  const ComparisonComponent = ComparisonComponents[config.planComparisonVersion];
  const SkipModalComponent = SkipModalComponents[config.skipModalVersion];

  const recommendedPlan = plans.find(p => p.isRecommended);

  const handleSkipClick = () => {
    setShowSkipModal(true);
  };

  const handleContinueWithoutInsurance = () => {
    onSelectPlan(null);
    setShowSkipModal(false);
  };

  const handleAddInsurance = () => {
    if (recommendedPlan) {
      onSelectPlan(recommendedPlan.id);
    }
    setShowSkipModal(false);
  };

  const handleViewDetails = (plan: InsurancePlan) => {
    setSelectedPlanForDetail(plan);
    setShowCoverageModal(true);
  };

  return (
    <section className={`${className}`}>
      {/* Icon - can be standalone or integrated in intro */}
      {config.protectionIconVersion !== 5 && config.protectionIconVersion !== 6 && (
        <div className="flex justify-center mb-4">
          <IconComponent />
        </div>
      )}

      {/* Intro */}
      <IntroComponent />

      {/* Plan comparison */}
      <ComparisonComponent
        plans={plans}
        selectedPlanId={selectedPlanId}
        onSelectPlan={onSelectPlan}
        onViewDetails={handleViewDetails}
        config={config}
      />

      {/* Skip button/link */}
      <div className="text-center mt-6">
        <button
          onClick={handleSkipClick}
          className="text-sm text-neutral-500 hover:text-neutral-700 underline cursor-pointer"
        >
          Continuar sin seguro
        </button>
      </div>

      {/* Skip Modal */}
      <SkipModalComponent
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onContinueWithoutInsurance={handleContinueWithoutInsurance}
        onAddInsurance={handleAddInsurance}
        recommendedPlan={recommendedPlan}
        productName="tu laptop"
      />

      {/* Coverage Detail Modal */}
      <CoverageDetailModal
        isOpen={showCoverageModal}
        onClose={() => setShowCoverageModal(false)}
        plan={selectedPlanForDetail}
        onSelectPlan={onSelectPlan}
      />
    </section>
  );
};

export default InsuranceSection;
