'use client';

import React, { useState, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Spinner, Tabs, Tab } from '@nextui-org/react';
import { Settings, Code, ArrowLeft, Package, Shield } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { VersionNav, useKeyboardShortcuts } from '@/app/prototipos/_shared';
import { UpsellConfig, defaultUpsellConfig, mockAccessories, mockInsurancePlans, mockProductContext } from '../types/upsell';
import { UpsellSettingsModal } from '../components/upsell/UpsellSettingsModal';

// Lazy imports for versioned components
import { AccessoryIntroV1 } from '../components/upsell/accessories/intro/AccessoryIntroV1';
import { AccessoryIntroV2 } from '../components/upsell/accessories/intro/AccessoryIntroV2';
import { AccessoryIntroV3 } from '../components/upsell/accessories/intro/AccessoryIntroV3';
import { AccessoryIntroV4 } from '../components/upsell/accessories/intro/AccessoryIntroV4';
import { AccessoryIntroV5 } from '../components/upsell/accessories/intro/AccessoryIntroV5';
import { AccessoryIntroV6 } from '../components/upsell/accessories/intro/AccessoryIntroV6';

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

  // State
  const [config, setConfig] = useState<UpsellConfig>(() => {
    const urlConfig: Partial<UpsellConfig> = {};
    const keys: (keyof UpsellConfig)[] = [
      'accessoryIntroVersion', 'accessoryCardVersion', 'accessoryLimitVersion',
      'selectionIndicatorVersion', 'removeButtonVersion', 'priceBreakdownVersion',
      'insuranceIntroVersion', 'protectionIconVersion', 'planComparisonVersion',
      'recommendedBadgeVersion', 'coverageDisplayVersion', 'skipModalVersion', 'modalButtonsVersion'
    ];
    keys.forEach(key => {
      const val = searchParams.get(key);
      if (val) urlConfig[key] = parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6;
    });
    return { ...defaultUpsellConfig, ...urlConfig };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'accessories' | 'insurance'>('accessories');

  // Keyboard shortcuts
  useKeyboardShortcuts({
    componentOrder: ['accessoryIntro', 'accessoryCard', 'insuranceIntro', 'planComparison'],
    onVersionChange: (componentId, version) => {
      const keyMap: Record<string, keyof UpsellConfig> = {
        accessoryIntro: 'accessoryIntroVersion',
        accessoryCard: 'accessoryCardVersion',
        insuranceIntro: 'insuranceIntroVersion',
        planComparison: 'planComparisonVersion',
      };
      const configKey = keyMap[componentId];
      if (configKey) {
        setConfig(prev => ({ ...prev, [configKey]: version }));
      }
    },
    onToggleSettings: () => setIsSettingsOpen(prev => !prev),
    getCurrentVersion: (componentId) => {
      const keyMap: Record<string, keyof UpsellConfig> = {
        accessoryIntro: 'accessoryIntroVersion',
        accessoryCard: 'accessoryCardVersion',
        insuranceIntro: 'insuranceIntroVersion',
        planComparison: 'planComparisonVersion',
      };
      const configKey = keyMap[componentId];
      return configKey ? config[configKey] : 1;
    },
    isModalOpen: isSettingsOpen,
  });

  // Accessory handlers
  const toggleAccessory = useCallback((id: string) => {
    setSelectedAccessories(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    const accessoriesTotal = selectedAccessories.reduce((sum, id) => {
      const acc = mockAccessories.find(a => a.id === id);
      return sum + (acc?.monthlyQuota || 0);
    }, 0);

    const insuranceTotal = selectedInsurance
      ? mockInsurancePlans.find(p => p.id === selectedInsurance)?.monthlyPrice || 0
      : 0;

    return {
      productQuota: mockProductContext.monthlyQuota,
      accessoriesQuota: accessoriesTotal,
      insuranceQuota: insuranceTotal,
      totalQuota: mockProductContext.monthlyQuota + accessoriesTotal + insuranceTotal,
    };
  }, [selectedAccessories, selectedInsurance]);

  // Render accessory intro based on version
  const renderAccessoryIntro = () => {
    switch (config.accessoryIntroVersion) {
      case 1: return <AccessoryIntroV1 />;
      case 2: return <AccessoryIntroV2 />;
      case 3: return <AccessoryIntroV3 />;
      case 4: return <AccessoryIntroV4 />;
      case 5: return <AccessoryIntroV5 />;
      case 6: return <AccessoryIntroV6 />;
      default: return <AccessoryIntroV1 />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Top navigation */}
      <VersionNav currentVersion="0.4" showSections={true} />

      {/* Main content */}
      <main className="pt-16 pb-24 px-4 md:px-8 max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">
            Upsell Preview
          </h1>
          <p className="text-neutral-600">
            Prueba las diferentes versiones de accesorios y seguros.
          </p>
        </div>

        {/* Tabs */}
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
              {/* Accessory Intro */}
              {renderAccessoryIntro()}

              {/* Accessory Cards Grid - Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockAccessories.map((accessory) => (
                  <div
                    key={accessory.id}
                    onClick={() => toggleAccessory(accessory.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedAccessories.includes(accessory.id)
                        ? 'border-[#22c55e] bg-[#22c55e]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                    }`}
                  >
                    <div className="w-full h-24 bg-neutral-100 rounded-lg mb-3 flex items-center justify-center">
                      <img
                        src={accessory.image}
                        alt={accessory.name}
                        className="max-h-20 max-w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <h4 className="font-semibold text-sm text-neutral-800 mb-1 line-clamp-2">
                      {accessory.name}
                    </h4>
                    <p className="text-[#4654CD] font-bold">
                      +S/{accessory.monthlyQuota}/mes
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
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
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                Protege tu equipo
              </h2>
              <p className="text-neutral-600 mb-6">
                Selecciona un plan de protección para tu laptop.
              </p>

              {/* Insurance Plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockInsurancePlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedInsurance(plan.id === selectedInsurance ? null : plan.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedInsurance === plan.id
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                    } ${plan.isRecommended ? 'ring-2 ring-[#4654CD]/30' : ''}`}
                  >
                    {plan.isRecommended && (
                      <div className="text-xs font-medium text-[#4654CD] mb-2">
                        Recomendado
                      </div>
                    )}
                    <h4 className="font-semibold text-neutral-800 mb-2">
                      {plan.name}
                    </h4>
                    <p className="text-2xl font-bold text-[#4654CD] mb-3">
                      S/{plan.monthlyPrice}/mes
                    </p>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      {plan.coverage.map((item) => (
                        <li key={item.name} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Tab>
        </Tabs>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_14" version="0.4" />
        <Button
          isIconOnly
          radius="md"
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
          onPress={() => setIsSettingsOpen(true)}
        >
          <Settings className="w-5 h-5" />
        </Button>
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
          onPress={() => router.push('/prototipos/0.4')}
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
      </div>

      {/* Config Badge */}
      {showConfigBadge && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200 max-w-xs">
          <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
          <p className="text-xs font-mono text-neutral-700">
            intro={config.accessoryIntroVersion}, card={config.accessoryCardVersion}, insurance={config.insuranceIntroVersion}
          </p>
        </div>
      )}

      {/* Settings Modal */}
      <UpsellSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
