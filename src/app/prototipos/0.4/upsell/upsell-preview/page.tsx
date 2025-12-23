'use client';

import React, { useState, Suspense, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Spinner, Tabs, Tab } from '@nextui-org/react';
import { Settings, Code, ArrowLeft, Package, Shield, Layers, Keyboard, Navigation } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { useKeyboardShortcuts } from '@/app/prototipos/_shared';
import { UpsellConfig, defaultUpsellConfig, mockAccessories, mockInsurancePlans, mockProductContext } from '../types/upsell';
import { UpsellSettingsModal } from '../components/upsell/UpsellSettingsModal';

// Versioned components - Accessories Intro
import { AccessoryIntroV1 } from '../components/upsell/accessories/intro/AccessoryIntroV1';
import { AccessoryIntroV2 } from '../components/upsell/accessories/intro/AccessoryIntroV2';
import { AccessoryIntroV3 } from '../components/upsell/accessories/intro/AccessoryIntroV3';
import { AccessoryIntroV4 } from '../components/upsell/accessories/intro/AccessoryIntroV4';
import { AccessoryIntroV5 } from '../components/upsell/accessories/intro/AccessoryIntroV5';
import { AccessoryIntroV6 } from '../components/upsell/accessories/intro/AccessoryIntroV6';

// Versioned components - Accessories Cards
import { AccessoryCardV1 } from '../components/upsell/accessories/cards/AccessoryCardV1';
import { AccessoryCardV2 } from '../components/upsell/accessories/cards/AccessoryCardV2';
import { AccessoryCardV3 } from '../components/upsell/accessories/cards/AccessoryCardV3';
import { AccessoryCardV4 } from '../components/upsell/accessories/cards/AccessoryCardV4';
import { AccessoryCardV5 } from '../components/upsell/accessories/cards/AccessoryCardV5';
import { AccessoryCardV6 } from '../components/upsell/accessories/cards/AccessoryCardV6';

// Versioned components - Insurance Intro
import { InsuranceIntroV1 } from '../components/upsell/insurance/intro/InsuranceIntroV1';
import { InsuranceIntroV2 } from '../components/upsell/insurance/intro/InsuranceIntroV2';
import { InsuranceIntroV3 } from '../components/upsell/insurance/intro/InsuranceIntroV3';
import { InsuranceIntroV4 } from '../components/upsell/insurance/intro/InsuranceIntroV4';
import { InsuranceIntroV5 } from '../components/upsell/insurance/intro/InsuranceIntroV5';
import { InsuranceIntroV6 } from '../components/upsell/insurance/intro/InsuranceIntroV6';

// Versioned components - Plan Comparison
import { PlanComparisonV1 } from '../components/upsell/insurance/comparison/PlanComparisonV1';
import { PlanComparisonV2 } from '../components/upsell/insurance/comparison/PlanComparisonV2';
import { PlanComparisonV3 } from '../components/upsell/insurance/comparison/PlanComparisonV3';
import { PlanComparisonV4 } from '../components/upsell/insurance/comparison/PlanComparisonV4';
import { PlanComparisonV5 } from '../components/upsell/insurance/comparison/PlanComparisonV5';
import { PlanComparisonV6 } from '../components/upsell/insurance/comparison/PlanComparisonV6';

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
  const [toast, setToast] = useState<{ message: string; type: 'version' | 'navigation' | 'info' } | null>(null);

  // Parse sections from URL - default to both if not specified
  const sectionsParam = searchParams.get('sections');
  const visibleSections = useMemo(() => {
    if (!sectionsParam) return { accessories: true, insurance: true };
    const sections = sectionsParam.split(',').map(s => s.trim().toLowerCase());
    return {
      accessories: sections.includes('accessories'),
      insurance: sections.includes('insurance'),
    };
  }, [sectionsParam]);

  const showToast = useCallback((message: string, type: 'version' | 'navigation' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const componentLabels: Record<string, string> = {
    accessoryIntro: 'Intro Accesorios',
    accessoryCard: 'Card Accesorio',
    insuranceIntro: 'Intro Seguros',
    planComparison: 'Comparación Planes',
  };

  // Keyboard shortcuts
  const { currentComponent } = useKeyboardShortcuts({
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
        showToast(`${componentLabels[componentId]}: V${version}`, 'version');
      }
    },
    onNavigate: (componentId) => {
      showToast(`Componente: ${componentLabels[componentId] || componentId}`, 'navigation');
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

  // Update URL when config changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Only include params that differ from defaults
    if (config.accessoryIntroVersion !== 1) {
      params.set('accessoryIntroVersion', config.accessoryIntroVersion.toString());
    }
    if (config.accessoryCardVersion !== 1) {
      params.set('accessoryCardVersion', config.accessoryCardVersion.toString());
    }
    if (config.accessoryLimitVersion !== 1) {
      params.set('accessoryLimitVersion', config.accessoryLimitVersion.toString());
    }
    if (config.selectionIndicatorVersion !== 1) {
      params.set('selectionIndicatorVersion', config.selectionIndicatorVersion.toString());
    }
    if (config.removeButtonVersion !== 1) {
      params.set('removeButtonVersion', config.removeButtonVersion.toString());
    }
    if (config.priceBreakdownVersion !== 1) {
      params.set('priceBreakdownVersion', config.priceBreakdownVersion.toString());
    }
    if (config.insuranceIntroVersion !== 1) {
      params.set('insuranceIntroVersion', config.insuranceIntroVersion.toString());
    }
    if (config.protectionIconVersion !== 1) {
      params.set('protectionIconVersion', config.protectionIconVersion.toString());
    }
    if (config.planComparisonVersion !== 1) {
      params.set('planComparisonVersion', config.planComparisonVersion.toString());
    }
    if (config.recommendedBadgeVersion !== 1) {
      params.set('recommendedBadgeVersion', config.recommendedBadgeVersion.toString());
    }
    if (config.coverageDisplayVersion !== 1) {
      params.set('coverageDisplayVersion', config.coverageDisplayVersion.toString());
    }
    if (config.skipModalVersion !== 1) {
      params.set('skipModalVersion', config.skipModalVersion.toString());
    }
    if (config.modalButtonsVersion !== 1) {
      params.set('modalButtonsVersion', config.modalButtonsVersion.toString());
    }

    // Preserve sections param if set
    if (sectionsParam) {
      params.set('sections', sectionsParam);
    }

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : '', { scroll: false });
  }, [config, router, sectionsParam]);

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

  // Render accessory card based on version
  const renderAccessoryCard = (accessory: typeof mockAccessories[0], isSelected: boolean, onToggle: () => void) => {
    const props = { accessory, isSelected, onToggle };
    switch (config.accessoryCardVersion) {
      case 1: return <AccessoryCardV1 key={accessory.id} {...props} />;
      case 2: return <AccessoryCardV2 key={accessory.id} {...props} />;
      case 3: return <AccessoryCardV3 key={accessory.id} {...props} />;
      case 4: return <AccessoryCardV4 key={accessory.id} {...props} />;
      case 5: return <AccessoryCardV5 key={accessory.id} {...props} />;
      case 6: return <AccessoryCardV6 key={accessory.id} {...props} />;
      default: return <AccessoryCardV1 key={accessory.id} {...props} />;
    }
  };

  // Render insurance intro based on version
  const renderInsuranceIntro = () => {
    switch (config.insuranceIntroVersion) {
      case 1: return <InsuranceIntroV1 />;
      case 2: return <InsuranceIntroV2 />;
      case 3: return <InsuranceIntroV3 />;
      case 4: return <InsuranceIntroV4 />;
      case 5: return <InsuranceIntroV5 />;
      case 6: return <InsuranceIntroV6 />;
      default: return <InsuranceIntroV1 />;
    }
  };

  // Render plan comparison based on version
  const renderPlanComparison = () => {
    const props = {
      plans: mockInsurancePlans,
      selectedPlan: selectedInsurance,
      onSelect: (planId: string) => setSelectedInsurance(planId === selectedInsurance ? null : planId),
    };
    switch (config.planComparisonVersion) {
      case 1: return <PlanComparisonV1 {...props} />;
      case 2: return <PlanComparisonV2 {...props} />;
      case 3: return <PlanComparisonV3 {...props} />;
      case 4: return <PlanComparisonV4 {...props} />;
      case 5: return <PlanComparisonV5 {...props} />;
      case 6: return <PlanComparisonV6 {...props} />;
      default: return <PlanComparisonV1 {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Toast de shortcuts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium ${
              toast.type === 'version'
                ? 'bg-[#4654CD] text-white'
                : 'bg-neutral-800 text-white'
            }`}
          >
            {toast.type === 'version' ? <Layers className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcut Help Badge */}
      <div className="fixed top-20 right-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-md px-3 py-2 border border-neutral-200">
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Press ? for help</span>
        </div>
        <div className="text-xs font-medium text-[#4654CD]">
          Activo: {componentLabels[currentComponent] || currentComponent}
        </div>
      </div>

      {/* Main content */}
      <main className="pt-16 pb-24 px-4 md:px-8 max-w-5xl mx-auto">
{/* Page header - Comentado temporalmente
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">
            Upsell - Preview
          </h1>
          <p className="text-neutral-600">
            Prueba las diferentes versiones de accesorios y seguros.
          </p>
        </div>
        */}

        {/* Conditional rendering based on sections param */}
        {visibleSections.accessories && visibleSections.insurance ? (
          /* Both sections - Show Tabs */
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
                {renderAccessoryIntro()}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockAccessories.map((accessory) =>
                    renderAccessoryCard(
                      accessory,
                      selectedAccessories.includes(accessory.id),
                      () => toggleAccessory(accessory.id)
                    )
                  )}
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
                {renderInsuranceIntro()}
                {renderPlanComparison()}
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
        ) : visibleSections.accessories ? (
          /* Only Accessories */
          <div className="bg-white rounded-2xl p-6 border border-neutral-200">
            {renderAccessoryIntro()}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockAccessories.map((accessory) =>
                renderAccessoryCard(
                  accessory,
                  selectedAccessories.includes(accessory.id),
                  () => toggleAccessory(accessory.id)
                )
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Total con accesorios:</span>
                <span className="text-xl font-bold text-[#4654CD]">
                  S/{totals.totalQuota}/mes
                </span>
              </div>
            </div>
            <div className="mt-6">
              <Button
                size="lg"
                className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
                onPress={() => router.push('/prototipos/0.4/wizard-solicitud/wizard-preview')}
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : visibleSections.insurance ? (
          /* Only Insurance */
          <div className="bg-white rounded-2xl p-6 border border-neutral-200">
            {renderInsuranceIntro()}
            {renderPlanComparison()}
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Total con seguro:</span>
                <span className="text-xl font-bold text-[#4654CD]">
                  S/{totals.totalQuota}/mes
                </span>
              </div>
            </div>
            <div className="mt-6">
              <Button
                size="lg"
                className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
                onPress={() => router.push('/prototipos/0.4/wizard-solicitud/wizard-preview')}
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : null}
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
