'use client';

/**
 * Upsell Preview v0.5
 * Basado en v0.4 con configuración fija:
 * - AccessoryIntro: V3 (Social proof)
 * - AccessoryCard: V1 (Grid uniforme)
 * - InsuranceIntro: V4 (Fintech animado)
 * - PlanComparison: V4 (Cards con hover)
 *
 * Sin iteraciones - diseño único optimizado
 */

import React, { useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Spinner, Tabs, Tab } from '@nextui-org/react';
import { ArrowLeft, Package, Shield, Code } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton } from '@/app/prototipos/_shared';

// Upsell components
import {
  AccessoryIntro,
  AccessoryCard,
  InsuranceIntro,
  PlanComparison,
} from '../components/upsell';

// Data
import { mockAccessories, mockInsurancePlans, mockProductContext } from '../data/mockUpsellData';

export default function UpsellPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <Spinner size="lg" color="primary" />
        </div>
      }
    >
      <UpsellPreviewContent />
    </Suspense>
  );
}

function UpsellPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse mode from URL
  const isCleanMode = searchParams.get('mode') === 'clean';

  // State
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'accessories' | 'insurance'>('accessories');
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  // Accessory handlers
  const toggleAccessory = useCallback((id: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    const accessoriesTotal = selectedAccessories.reduce((sum, id) => {
      const acc = mockAccessories.find((a) => a.id === id);
      return sum + (acc?.monthlyQuota || 0);
    }, 0);

    const insuranceTotal = selectedInsurance
      ? mockInsurancePlans.find((p) => p.id === selectedInsurance)?.monthlyPrice || 0
      : 0;

    return {
      productQuota: mockProductContext.monthlyQuota,
      accessoriesQuota: accessoriesTotal,
      insuranceQuota: insuranceTotal,
      totalQuota: mockProductContext.monthlyQuota + accessoriesTotal + insuranceTotal,
    };
  }, [selectedAccessories, selectedInsurance]);

  // Navigation URL
  const getWizardUrl = () => {
    const baseUrl = '/prototipos/0.4/wizard-solicitud/wizard-preview?header=3&progress=6&celebration=3&input=4&options=2&upload=3';
    return isCleanMode ? `${baseUrl}&mode=clean` : baseUrl;
  };

  // Fixed config for display
  const config = {
    accessoryIntro: 'V3 (Social proof)',
    accessoryCard: 'V1 (Grid uniforme)',
    insuranceIntro: 'V4 (Fintech animado)',
    planComparison: 'V4 (Cards hover)',
  };

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Main content */}
      <main className="pt-16 pb-24 px-4 md:px-8 max-w-5xl mx-auto">
        {/* Tabs for Accessories / Insurance */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as 'accessories' | 'insurance')}
          classNames={{
            tabList: 'bg-white border border-neutral-200 rounded-xl p-1',
            tab: 'data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white rounded-lg',
            cursor: 'bg-transparent',
          }}
        >
          <Tab
            key="accessories"
            title={
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Accesorios</span>
              </div>
            }
          >
            <div className="mt-6 bg-white rounded-2xl p-6 border border-neutral-200">
              <AccessoryIntro />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockAccessories.map((accessory) => (
                  <AccessoryCard
                    key={accessory.id}
                    accessory={accessory}
                    isSelected={selectedAccessories.includes(accessory.id)}
                    onToggle={() => toggleAccessory(accessory.id)}
                  />
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Total con accesorios:</span>
                  <span className="text-xl font-bold text-[#4654CD]">
                    S/{totals.totalQuota}/mes
                  </span>
                </div>
              </div>
            </div>
          </Tab>

          <Tab
            key="insurance"
            title={
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Seguros</span>
              </div>
            }
          >
            <div className="mt-6 bg-white rounded-2xl p-6 border border-neutral-200">
              <InsuranceIntro />
              <PlanComparison
                plans={mockInsurancePlans}
                selectedPlan={selectedInsurance}
                onSelect={(planId) =>
                  setSelectedInsurance(planId === selectedInsurance ? null : planId)
                }
              />
              {selectedInsurance && (
                <div className="mt-6 pt-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Total con seguro:</span>
                    <span className="text-xl font-bold text-[#4654CD]">
                      S/{totals.totalQuota}/mes
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Tab>
        </Tabs>

        {/* Continue Button */}
        <div className="mt-6">
          <Button
            size="lg"
            className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
            onPress={() => router.push(getWizardUrl())}
          >
            Continuar
          </Button>
        </div>
      </main>

      {/* Floating Action Buttons - hidden in clean mode */}
      {!isCleanMode && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
          <TokenCounter sectionId="PROMPT_14" version="0.5" />
          <Button
            isIconOnly
            radius="md"
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => setShowConfigBadge(!showConfigBadge)}
          >
            <Code className="w-5 h-5 text-neutral-600" />
          </Button>
          <Button
            isIconOnly
            radius="md"
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => router.push('/prototipos/0.5')}
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Button>
        </div>
      )}

      {/* Clean mode: FeedbackButton */}
      {isCleanMode && (
        <FeedbackButton sectionId="upsell" config={config as unknown as Record<string, unknown>} />
      )}

      {/* Config Badge - hidden in clean mode */}
      {!isCleanMode && showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200 max-w-xs">
          <p className="text-xs text-neutral-500 mb-1">Configuración fija v0.5:</p>
          <p className="text-xs font-mono text-neutral-700">
            Intro: V3 | Card: V1 | InsuranceIntro: V4 | Plans: V4
          </p>
          <p className="text-xs text-neutral-400 mt-1">Sin iteraciones</p>
        </div>
      )}
    </div>
  );
}
