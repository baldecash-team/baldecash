'use client';

/**
 * InsuranceSection - Reusable insurance selection section
 * Can be used in Preview page (before wizard) or Complementos page (after wizard)
 * Uses ProductContext for state management (same pattern as AccessoriesSection)
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { InsuranceIntro, PlanComparison } from '../../upsell';
import { useProduct } from '../../../context/ProductContext';
import { getLandingInsurances } from '@/app/prototipos/0.6/services/landingApi';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
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
}

export function InsuranceSection({
  showIntro = true,
  className = '',
}: InsuranceSectionProps) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  // Use ProductContext for insurance state (persists to localStorage)
  const { selectedInsurance, setSelectedInsurance } = useProduct();

  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load insurance plans from API
  useEffect(() => {
    async function fetchInsurancePlans() {
      setIsLoading(true);
      try {
        const plans = await getLandingInsurances(landing, previewKey);
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

  // Si no hay planes de seguro disponibles, no mostrar la sección
  if (!isLoading && insurancePlans.length === 0) {
    return null;
  }

  const handleSelect = (planId: string) => {
    // Toggle: if same plan selected, deselect; otherwise select new plan
    if (selectedInsurance?.id === planId) {
      setSelectedInsurance(null);
    } else {
      const plan = insurancePlans.find(p => p.id === planId);
      setSelectedInsurance(plan || null);
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border border-neutral-200 ${className}`}>
      {showIntro && <InsuranceIntro />}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : (
        <PlanComparison
          plans={insurancePlans}
          selectedPlan={selectedInsurance?.id || null}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
