'use client';

/**
 * InsuranceSection - Reusable insurance selection section
 * Can be used in Preview page (before wizard) or Complementos page (after wizard)
 * Uses ProductContext for state management
 * Supports multi-select (both insurances can be selected)
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { InsuranceCards } from '../../upsell';
import { useProduct } from '../../../context/ProductContext';
import { getLandingInsurances } from '@/app/prototipos/0.6/services/landingApi';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useWizardConfig } from '../../../context/WizardConfigContext';
import type { InsurancePlan } from '../../../types/upsell';

interface InsuranceSectionProps {
  showIntro?: boolean;
  className?: string;
}

export function InsuranceSection({
  showIntro = true,
  className = '',
}: InsuranceSectionProps) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  // TODO: Quitar cuando zona-gamer tenga su propia config en el backend
  const apiSlug = landing === 'zona-gamer' ? 'home' : landing;

  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  const { badgeText } = useWizardConfig();
  const { selectedInsurances, toggleInsurance, selectedProduct, cartProducts } = useProduct();

  const activeProduct = cartProducts?.[0] || selectedProduct;
  const deviceType = activeProduct?.type || 'Laptop';
  const productPrice = activeProduct?.price || 0;
  const termMonths = activeProduct?.months;

  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productPrice) {
      setIsLoading(false);
      return;
    }

    async function fetchInsurancePlans() {
      setIsLoading(true);
      try {
        const formattedDeviceType = deviceType.charAt(0).toUpperCase() + deviceType.slice(1).toLowerCase();
        const plans = await getLandingInsurances(apiSlug, formattedDeviceType, productPrice, termMonths, previewKey);
        const mappedPlans: InsurancePlan[] = plans.map((plan) => ({
          id: plan.id,
          code: plan.code,
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          totalPrice: plan.totalPrice,
          paymentMonths: plan.paymentMonths,
          insuranceType: plan.insuranceType,
          tier: plan.tier,
          isRecommended: plan.isRecommended,
          coverage: plan.coverage,
          exclusions: plan.exclusions,
          durationMonths: plan.durationMonths,
          provider: plan.provider,
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
  }, [apiSlug, deviceType, productPrice, termMonths, previewKey]);

  if (!isLoading && insurancePlans.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : (
        <InsuranceCards
          plans={insurancePlans}
          selectedPlanIds={selectedInsurances.map(i => i.id)}
          onToggle={(planId) => {
            const plan = insurancePlans.find(p => p.id === planId);
            if (plan) toggleInsurance(plan);
          }}
          showIntro={showIntro}
          badgeText={badgeText}
        />
      )}
    </div>
  );
}
