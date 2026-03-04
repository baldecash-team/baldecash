'use client';

/**
 * InsuranceSection - Reusable insurance selection section
 * Can be used in Preview page (before wizard) or Complementos page (after wizard)
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { InsuranceIntro, PlanComparison } from '../../upsell';
import { getLandingInsurances } from '@/app/prototipos/0.6/services/landingApi';
import type { InsurancePlan } from '../../../types/upsell';

interface InsuranceSectionProps {
  /**
   * Optional: Show section intro
   * @default true
   */
  showIntro?: boolean;
  /**
   * Optional: Custom class name for the container
   */
  className?: string;
  /**
   * Callback when insurance selection changes
   */
  onSelectionChange?: (insuranceId: string | null) => void;
  /**
   * External control of selected insurance (for controlled component usage)
   */
  selectedInsurance?: string | null;
}

export function InsuranceSection({
  showIntro = true,
  className = '',
  onSelectionChange,
  selectedInsurance: externalSelectedInsurance,
}: InsuranceSectionProps) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Internal state for uncontrolled usage
  const [internalSelectedInsurance, setInternalSelectedInsurance] = useState<string | null>(null);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use external value if provided (controlled), otherwise use internal state
  const selectedInsurance = externalSelectedInsurance !== undefined
    ? externalSelectedInsurance
    : internalSelectedInsurance;

  // Load insurance plans from API
  useEffect(() => {
    async function fetchInsurancePlans() {
      setIsLoading(true);
      try {
        const plans = await getLandingInsurances(landing);
        const mappedPlans: InsurancePlan[] = plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          tier: plan.tier,
          isRecommended: plan.isRecommended,
          coverage: plan.coverage,
          exclusions: plan.exclusions,
        }));
        setInsurancePlans(mappedPlans);
      } catch (error) {
        console.error('Error fetching insurance plans:', error);
        setInsurancePlans([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInsurancePlans();
  }, [landing]);

  const handleSelect = (planId: string) => {
    const newValue = planId === selectedInsurance ? null : planId;

    // Update internal state if uncontrolled
    if (externalSelectedInsurance === undefined) {
      setInternalSelectedInsurance(newValue);
    }

    // Notify parent
    onSelectionChange?.(newValue);
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border border-neutral-200 ${className}`}>
      {showIntro && <InsuranceIntro />}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : insurancePlans.length > 0 ? (
        <PlanComparison
          plans={insurancePlans}
          selectedPlan={selectedInsurance}
          onSelect={handleSelect}
        />
      ) : (
        <p className="text-center text-neutral-500 py-4">
          No hay planes de seguro disponibles
        </p>
      )}
    </div>
  );
}

/**
 * Get the selected insurance monthly price
 * Utility hook for calculating totals
 */
export function useInsurancePrice(selectedInsuranceId: string | null, plans: InsurancePlan[]): number {
  if (!selectedInsuranceId) return 0;
  const plan = plans.find(p => p.id === selectedInsuranceId);
  return plan?.monthlyPrice || 0;
}
