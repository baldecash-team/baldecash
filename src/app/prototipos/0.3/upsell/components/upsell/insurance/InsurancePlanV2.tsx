'use client';

/**
 * InsurancePlanV2 - Tabla comparativa
 *
 * E.3 V2: Tabla comparativa
 * E.4 V2: Card mas grande
 * E.5 V2: Tabs "Cubre" / "No cubre"
 */

import React, { useState } from 'react';
import { Button, Chip, Tabs, Tab, Card, CardBody, Divider } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Shield, Umbrella, Lock, Check, X } from 'lucide-react';
import { InsurancePlan, UpsellConfig } from '../../../types/upsell';

interface InsurancePlanV2Props {
  plans: InsurancePlan[];
  selectedPlanId: string | null;
  onSelectPlan: (id: string) => void;
  protectionIcon: UpsellConfig['protectionIcon'];
}

const getProtectionIcon = (type: UpsellConfig['protectionIcon']) => {
  switch (type) {
    case 'shield':
      return <Shield className="w-5 h-5" />;
    case 'umbrella':
      return <Umbrella className="w-5 h-5" />;
    case 'lock':
      return <Lock className="w-5 h-5" />;
    default:
      return <Shield className="w-5 h-5" />;
  }
};

// All possible coverage items across plans
const allCoverageItems = [
  'Robo',
  'Danos accidentales',
  'Danos por liquidos',
  'Perdida',
  'Extension de garantia',
];

export const InsurancePlanV2: React.FC<InsurancePlanV2Props> = ({
  plans,
  selectedPlanId,
  onSelectPlan,
  protectionIcon,
}) => {
  const [activeTab, setActiveTab] = useState<'coverage' | 'exclusions'>(
    'coverage'
  );

  const hasCoverage = (plan: InsurancePlan, item: string): boolean => {
    return plan.coverage.some((c) => c.name === item);
  };

  const getCoverageAmount = (plan: InsurancePlan, item: string): number | undefined => {
    const coverage = plan.coverage.find((c) => c.name === item);
    return coverage?.maxAmount;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Tabs for Coverage/Exclusions - V2 feature */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as 'coverage' | 'exclusions')}
        variant="underlined"
        classNames={{
          tabList: 'gap-4 mb-4',
          cursor: 'bg-[#4654CD]',
          tab: 'px-0 h-10',
          tabContent: 'group-data-[selected=true]:text-[#4654CD]',
        }}
      >
        <Tab key="coverage" title="Que cubre" />
        <Tab key="exclusions" title="Que NO cubre" />
      </Tabs>

      {activeTab === 'coverage' ? (
        <Card className="border border-neutral-200 shadow-none">
          <CardBody className="p-0 overflow-x-auto">
            {/* Custom table implementation */}
            <div className="min-w-[600px]">
              {/* Header row */}
              <div className="flex bg-neutral-50 border-b border-neutral-200">
                <div className="w-40 p-3 text-xs font-medium text-neutral-600 flex-shrink-0">
                  Cobertura
                </div>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex-1 p-3 text-center border-l border-neutral-200"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          plan.tier === 'premium'
                            ? 'bg-purple-100 text-purple-600'
                            : plan.tier === 'standard'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {getProtectionIcon(protectionIcon)}
                      </div>
                      <span className="font-semibold text-sm">{plan.name}</span>
                      <span className="text-[#4654CD] font-bold font-['Baloo_2']">
                        S/{plan.monthlyPrice}/mes
                      </span>
                      {plan.isRecommended && (
                        <Chip size="sm" color="primary" variant="flat">
                          Recomendado
                        </Chip>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coverage rows */}
              {allCoverageItems.map((item, index) => (
                <div
                  key={item}
                  className={`flex ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}`}
                >
                  <div className="w-40 p-3 text-sm font-medium text-neutral-700 flex-shrink-0 border-b border-neutral-100">
                    {item}
                  </div>
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex-1 p-3 text-center border-l border-b border-neutral-100"
                    >
                      {hasCoverage(plan, item) ? (
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          {getCoverageAmount(plan, item) && (
                            <span className="text-xs text-neutral-500 mt-0.5">
                              hasta S/{getCoverageAmount(plan, item)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center mx-auto">
                          <X className="w-3.5 h-3.5 text-neutral-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Select row */}
              <div className="flex bg-white">
                <div className="w-40 p-3 text-sm font-medium text-neutral-700 flex-shrink-0">
                  Seleccionar
                </div>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex-1 p-3 text-center border-l border-neutral-100"
                  >
                    <Button
                      size="sm"
                      className={`cursor-pointer ${
                        selectedPlanId === plan.id
                          ? 'bg-[#4654CD] text-white'
                          : 'bg-neutral-100'
                      }`}
                      onPress={() => onSelectPlan(plan.id)}
                    >
                      {selectedPlanId === plan.id ? 'Seleccionado' : 'Elegir'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        // Exclusions tab - Card layout
        <div className="space-y-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="border border-neutral-200 shadow-none">
              <CardBody className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{plan.name}</span>
                    {selectedPlanId === plan.id && (
                      <Chip size="sm" color="primary" variant="flat">
                        Seleccionado
                      </Chip>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="light"
                    className="cursor-pointer"
                    onPress={() => onSelectPlan(plan.id)}
                  >
                    {selectedPlanId === plan.id ? 'Seleccionado' : 'Elegir'}
                  </Button>
                </div>
                <Divider className="my-2" />
                <div className="flex flex-wrap gap-2">
                  {plan.exclusions.map((exclusion, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      variant="flat"
                      className="bg-red-50 text-red-600"
                      startContent={<X className="w-3 h-3" />}
                    >
                      {exclusion}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default InsurancePlanV2;
