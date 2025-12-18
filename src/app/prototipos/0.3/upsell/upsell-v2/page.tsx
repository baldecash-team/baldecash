'use client';

/**
 * Upsell V2 Page - BaldeCash v0.3
 *
 * Version 2: Tamano variable + Tabla comparativa
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Laptop, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  AccessoriesSection,
  InsuranceSection,
  DynamicTotal,
  PriceBreakdown,
  QuotaImpact,
  SkipInsuranceModal,
} from '../components/upsell';
import { mockAccessories, mockInsurancePlans, sampleProduct } from '../data/mockUpsellData';
import { UpsellConfig } from '../types/upsell';

const configV2: UpsellConfig = {
  accessoryCardVersion: 2,
  insurancePlanVersion: 2,
  accessoriesIntro: 'direct',
  accessoryLimit: 'max_three',
  selectedIndicator: 'badge',
  removeMethod: 'toggle',
  breakdownDisplay: 'tooltip',
  insuranceFraming: 'peace_of_mind',
  protectionIcon: 'umbrella',
  recommendedHighlight: 'larger_card',
  coverageDisplay: 'tabs',
  skipModalTone: 'neutral',
  modalButtonStyle: 'symmetric',
};

export default function UpsellV2Page() {
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);
  const [previousQuota, setPreviousQuota] = useState<number | undefined>(undefined);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'accessories' | 'insurance'>('accessories');

  const { totalAccessoriesQuota, totalInsuranceQuota, totalPrice, totalQuota } = useMemo(() => {
    const accQuota = mockAccessories
      .filter((a) => selectedAccessories.includes(a.id))
      .reduce((sum, a) => sum + a.monthlyQuota, 0);
    const accPrice = mockAccessories
      .filter((a) => selectedAccessories.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    const insQuota = selectedInsurance
      ? mockInsurancePlans.find((p) => p.id === selectedInsurance)?.monthlyPrice || 0
      : 0;

    return {
      totalAccessoriesQuota: accQuota,
      totalInsuranceQuota: insQuota,
      totalPrice: sampleProduct.price + accPrice,
      totalQuota: sampleProduct.monthlyQuota + accQuota + insQuota,
    };
  }, [selectedAccessories, selectedInsurance]);

  const handleToggleAccessory = useCallback((id: string) => {
    setPreviousQuota(totalQuota);
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }, [totalQuota]);

  const handleSelectInsurance = useCallback((id: string) => {
    setPreviousQuota(totalQuota);
    setSelectedInsurance(id);
    setShowSkipModal(false);
  }, [totalQuota]);

  const breakdownItems = useMemo(() => {
    const items: Array<{ label: string; price: number; monthlyQuota: number; type: 'product' | 'accessory' | 'insurance' }> = [{
      label: sampleProduct.displayName,
      price: sampleProduct.price,
      monthlyQuota: sampleProduct.monthlyQuota,
      type: 'product',
    }];
    mockAccessories.filter((a) => selectedAccessories.includes(a.id)).forEach((a) => {
      items.push({ label: a.name, price: a.price, monthlyQuota: a.monthlyQuota, type: 'accessory' });
    });
    if (selectedInsurance) {
      const plan = mockInsurancePlans.find((p) => p.id === selectedInsurance);
      if (plan) items.push({ label: plan.name, price: plan.yearlyPrice, monthlyQuota: plan.monthlyPrice, type: 'insurance' });
    }
    return items;
  }, [selectedAccessories, selectedInsurance]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/prototipos/0.3/upsell/upsell-preview" className="text-neutral-400 hover:text-neutral-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-neutral-800">Upsell V2</h1>
              <p className="text-xs text-neutral-500">Tamano variable + Tabla comparativa</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="mb-6">
          <CardBody className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
                <Laptop className="w-8 h-8 text-neutral-400" />
              </div>
              <div>
                <h2 className="font-semibold">{sampleProduct.displayName}</h2>
                <p className="text-[#4654CD] font-bold font-['Baloo_2']">S/{sampleProduct.monthlyQuota}/mes</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {currentStep === 'accessories' ? (
              <AccessoriesSection
                accessories={mockAccessories}
                selectedAccessories={selectedAccessories}
                onToggleAccessory={handleToggleAccessory}
                config={configV2}
              />
            ) : (
              <InsuranceSection
                plans={mockInsurancePlans}
                selectedPlanId={selectedInsurance}
                onSelectPlan={handleSelectInsurance}
                onSkipInsurance={() => setShowSkipModal(true)}
                config={configV2}
              />
            )}
          </div>

          <div className="space-y-4">
            <DynamicTotal monthlyQuota={totalQuota} totalPrice={totalPrice} previousQuota={previousQuota} />
            <QuotaImpact baseQuota={sampleProduct.monthlyQuota} accessoriesQuota={totalAccessoriesQuota} insuranceQuota={totalInsuranceQuota} totalQuota={totalQuota} />
            <PriceBreakdown items={breakdownItems} totalPrice={totalPrice} totalMonthlyQuota={totalQuota} displayMode={configV2.breakdownDisplay} />
            <div className="flex gap-2">
              {currentStep === 'insurance' && (
                <Button variant="bordered" startContent={<ArrowLeft className="w-4 h-4" />} onPress={() => setCurrentStep('accessories')} className="flex-1 cursor-pointer">Volver</Button>
              )}
              <Button color="primary" className="flex-1 bg-[#4654CD] cursor-pointer" endContent={<ArrowRight className="w-4 h-4" />} onPress={() => currentStep === 'accessories' && setCurrentStep('insurance')}>
                {currentStep === 'accessories' ? 'Continuar' : 'Finalizar'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <SkipInsuranceModal isOpen={showSkipModal} onClose={() => setShowSkipModal(false)} onConfirmSkip={() => { setSelectedInsurance(null); setShowSkipModal(false); }} onSelectPlan={handleSelectInsurance} recommendedPlan={mockInsurancePlans.find(p => p.isRecommended)} config={configV2} />
    </div>
  );
}
