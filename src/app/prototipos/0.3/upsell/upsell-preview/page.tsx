'use client';

/**
 * Upsell Preview Page - BaldeCash v0.3
 *
 * Vista interactiva para probar todas las variaciones de upsell
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Laptop, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  AccessoriesSection,
  InsuranceSection,
  DynamicTotal,
  PriceBreakdown,
  QuotaImpact,
  SkipInsuranceModal,
  CoverageDetailModal,
  UpsellSettingsModal,
} from '../components/upsell';
import { mockAccessories, mockInsurancePlans, sampleProduct } from '../data/mockUpsellData';
import { UpsellConfig, defaultUpsellConfig, InsurancePlan } from '../types/upsell';
import { FloatingControls } from '@/app/prototipos/_shared/components/FloatingControls';

export default function UpsellPreviewPage() {
  // Config state
  const [config, setConfig] = useState<UpsellConfig>(defaultUpsellConfig);
  const [showSettings, setShowSettings] = useState(false);

  // Upsell state
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);
  const [previousQuota, setPreviousQuota] = useState<number | undefined>(undefined);

  // Modal states
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<InsurancePlan | null>(null);

  // Current step: 'accessories' or 'insurance'
  const [currentStep, setCurrentStep] = useState<'accessories' | 'insurance'>('accessories');

  // Calculate totals
  const { totalAccessoriesPrice, totalAccessoriesQuota, totalInsuranceQuota, totalPrice, totalQuota } = useMemo(() => {
    const accPrice = mockAccessories
      .filter((a) => selectedAccessories.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    const accQuota = mockAccessories
      .filter((a) => selectedAccessories.includes(a.id))
      .reduce((sum, a) => sum + a.monthlyQuota, 0);
    const insQuota = selectedInsurance
      ? mockInsurancePlans.find((p) => p.id === selectedInsurance)?.monthlyPrice || 0
      : 0;

    return {
      totalAccessoriesPrice: accPrice,
      totalAccessoriesQuota: accQuota,
      totalInsuranceQuota: insQuota,
      totalPrice: sampleProduct.price + accPrice,
      totalQuota: sampleProduct.monthlyQuota + accQuota + insQuota,
    };
  }, [selectedAccessories, selectedInsurance]);

  // Toggle accessory
  const handleToggleAccessory = useCallback((id: string) => {
    setPreviousQuota(totalQuota);
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }, [totalQuota]);

  // Select insurance
  const handleSelectInsurance = useCallback((id: string) => {
    setPreviousQuota(totalQuota);
    setSelectedInsurance(id);
    setShowSkipModal(false);
  }, [totalQuota]);

  // Skip insurance
  const handleSkipInsurance = useCallback(() => {
    setShowSkipModal(true);
  }, []);

  const handleConfirmSkip = useCallback(() => {
    setSelectedInsurance(null);
    setShowSkipModal(false);
  }, []);

  // Build breakdown items
  const breakdownItems = useMemo(() => {
    const items: Array<{
      label: string;
      price: number;
      monthlyQuota: number;
      type: 'product' | 'accessory' | 'insurance';
    }> = [
      {
        label: sampleProduct.displayName,
        price: sampleProduct.price,
        monthlyQuota: sampleProduct.monthlyQuota,
        type: 'product',
      },
    ];

    mockAccessories
      .filter((a) => selectedAccessories.includes(a.id))
      .forEach((a) => {
        items.push({
          label: a.name,
          price: a.price,
          monthlyQuota: a.monthlyQuota,
          type: 'accessory',
        });
      });

    if (selectedInsurance) {
      const plan = mockInsurancePlans.find((p) => p.id === selectedInsurance);
      if (plan) {
        items.push({
          label: plan.name,
          price: plan.yearlyPrice,
          monthlyQuota: plan.monthlyPrice,
          type: 'insurance',
        });
      }
    }

    return items;
  }, [selectedAccessories, selectedInsurance]);

  const recommendedPlan = mockInsurancePlans.find((p) => p.isRecommended);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Floating Controls */}
      <FloatingControls
        config={config}
        onSettingsClick={() => setShowSettings(true)}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Product Context */}
        <Card className="mb-6">
          <CardBody className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center">
                <Laptop className="w-10 h-10 text-neutral-400" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-neutral-800">
                  {sampleProduct.displayName}
                </h2>
                <p className="text-sm text-neutral-500">
                  Precio: S/{sampleProduct.price.toLocaleString()}
                </p>
                <p className="text-[#4654CD] font-bold font-['Baloo_2']">
                  Desde S/{sampleProduct.monthlyQuota}/mes
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Step Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentStep('accessories')}
            className={`flex-1 p-3 rounded-lg text-center transition-colors cursor-pointer ${
              currentStep === 'accessories'
                ? 'bg-[#4654CD] text-white'
                : 'bg-white border border-neutral-200 text-neutral-600'
            }`}
          >
            <span className="font-medium">1. Accesorios</span>
            {selectedAccessories.length > 0 && (
              <span className="ml-2 text-xs">({selectedAccessories.length})</span>
            )}
          </button>
          <ArrowRight className="w-4 h-4 text-neutral-300" />
          <button
            onClick={() => setCurrentStep('insurance')}
            className={`flex-1 p-3 rounded-lg text-center transition-colors cursor-pointer ${
              currentStep === 'insurance'
                ? 'bg-[#4654CD] text-white'
                : 'bg-white border border-neutral-200 text-neutral-600'
            }`}
          >
            <span className="font-medium">2. Seguro</span>
            {selectedInsurance && (
              <span className="ml-2 text-xs">(Seleccionado)</span>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upsell Section */}
          <div className="lg:col-span-2">
            {currentStep === 'accessories' ? (
              <AccessoriesSection
                accessories={mockAccessories}
                selectedAccessories={selectedAccessories}
                onToggleAccessory={handleToggleAccessory}
                config={config}
              />
            ) : (
              <InsuranceSection
                plans={mockInsurancePlans}
                selectedPlanId={selectedInsurance}
                onSelectPlan={handleSelectInsurance}
                onSkipInsurance={handleSkipInsurance}
                config={config}
              />
            )}
          </div>

          {/* Right: Pricing Sidebar */}
          <div className="space-y-4">
            <DynamicTotal
              monthlyQuota={totalQuota}
              totalPrice={totalPrice}
              previousQuota={previousQuota}
            />

            <QuotaImpact
              baseQuota={sampleProduct.monthlyQuota}
              accessoriesQuota={totalAccessoriesQuota}
              insuranceQuota={totalInsuranceQuota}
              totalQuota={totalQuota}
            />

            <PriceBreakdown
              items={breakdownItems}
              totalPrice={totalPrice + (selectedInsurance ? mockInsurancePlans.find(p => p.id === selectedInsurance)?.yearlyPrice || 0 : 0)}
              totalMonthlyQuota={totalQuota}
              displayMode={config.breakdownDisplay}
            />

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              {currentStep === 'insurance' && (
                <Button
                  variant="bordered"
                  startContent={<ArrowLeft className="w-4 h-4" />}
                  onPress={() => setCurrentStep('accessories')}
                  className="flex-1 cursor-pointer"
                >
                  Volver
                </Button>
              )}
              <Button
                color="primary"
                className="flex-1 bg-[#4654CD] cursor-pointer"
                endContent={<ArrowRight className="w-4 h-4" />}
                onPress={() => {
                  if (currentStep === 'accessories') {
                    setCurrentStep('insurance');
                  }
                }}
              >
                {currentStep === 'accessories' ? 'Continuar' : 'Finalizar'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <UpsellSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onConfigChange={setConfig}
      />

      <SkipInsuranceModal
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onConfirmSkip={handleConfirmSkip}
        onSelectPlan={handleSelectInsurance}
        recommendedPlan={recommendedPlan}
        config={config}
      />

      <CoverageDetailModal
        isOpen={showCoverageModal}
        onClose={() => setShowCoverageModal(false)}
        plan={selectedPlanForDetail}
        onSelectPlan={() => {
          if (selectedPlanForDetail) {
            handleSelectInsurance(selectedPlanForDetail.id);
          }
        }}
      />
    </div>
  );
}
