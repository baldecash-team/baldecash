'use client';

/**
 * InsurancePlanV3 - Slider de planes
 *
 * E.3 V3: Slider de menor a mayor cobertura
 * E.4 V3: Preseleccionado
 * E.5 V3: Iconos con hover para detalles
 */

import React, { useState } from 'react';
import { Slider, Card, CardBody, Button, Tooltip, Chip } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Umbrella,
  Lock,
  AlertTriangle,
  Droplet,
  Search,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { InsurancePlan, UpsellConfig } from '../../../types/upsell';

interface InsurancePlanV3Props {
  plans: InsurancePlan[];
  selectedPlanId: string | null;
  onSelectPlan: (id: string) => void;
  protectionIcon: UpsellConfig['protectionIcon'];
  preselect?: boolean;
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    Shield: <Shield className="w-5 h-5" />,
    AlertTriangle: <AlertTriangle className="w-5 h-5" />,
    Droplet: <Droplet className="w-5 h-5" />,
    Search: <Search className="w-5 h-5" />,
    Clock: <Clock className="w-5 h-5" />,
  };
  return icons[iconName] || <Shield className="w-5 h-5" />;
};

const getProtectionIcon = (type: UpsellConfig['protectionIcon']) => {
  switch (type) {
    case 'shield':
      return <Shield className="w-8 h-8" />;
    case 'umbrella':
      return <Umbrella className="w-8 h-8" />;
    case 'lock':
      return <Lock className="w-8 h-8" />;
    default:
      return <Shield className="w-8 h-8" />;
  }
};

const getTierGradient = (tier: InsurancePlan['tier']) => {
  switch (tier) {
    case 'basic':
      return 'from-neutral-100 to-neutral-200';
    case 'standard':
      return 'from-blue-100 to-blue-200';
    case 'premium':
      return 'from-purple-100 to-purple-200';
    default:
      return 'from-neutral-100 to-neutral-200';
  }
};

export const InsurancePlanV3: React.FC<InsurancePlanV3Props> = ({
  plans,
  selectedPlanId,
  onSelectPlan,
  protectionIcon,
  preselect = false,
}) => {
  // Map plan index to slider value (0, 1, 2)
  const [sliderValue, setSliderValue] = useState(() => {
    if (selectedPlanId) {
      return plans.findIndex((p) => p.id === selectedPlanId);
    }
    if (preselect) {
      return plans.findIndex((p) => p.isRecommended);
    }
    return 1; // Default to middle (standard)
  });

  const currentPlan = plans[sliderValue];

  const handleSliderChange = (value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setSliderValue(newValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Slider */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {plans.map((plan, index) => (
            <button
              key={plan.id}
              onClick={() => setSliderValue(index)}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                sliderValue === index
                  ? 'text-[#4654CD]'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {plan.name}
            </button>
          ))}
        </div>
        <Slider
          value={sliderValue}
          onChange={handleSliderChange}
          minValue={0}
          maxValue={plans.length - 1}
          step={1}
          showSteps
          classNames={{
            base: 'w-full',
            track: 'bg-neutral-200 h-2',
            filler: 'bg-[#4654CD]',
            thumb: 'bg-[#4654CD] w-5 h-5 shadow-md',
            step: 'bg-neutral-300 w-3 h-3',
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-neutral-400">Menor cobertura</span>
          <span className="text-xs text-neutral-400">Mayor cobertura</span>
        </div>
      </div>

      {/* Current Plan Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPlan.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className={`overflow-hidden ${
              selectedPlanId === currentPlan.id
                ? 'border-2 border-[#4654CD]'
                : 'border border-neutral-200'
            }`}
          >
            {/* Header with gradient */}
            <div
              className={`p-6 bg-gradient-to-r ${getTierGradient(currentPlan.tier)}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center">
                  {getProtectionIcon(protectionIcon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-neutral-800">
                      {currentPlan.name}
                    </h3>
                    {currentPlan.isRecommended && (
                      <Chip size="sm" color="primary">
                        Recomendado
                      </Chip>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-[#4654CD] font-['Baloo_2']">
                      S/{currentPlan.monthlyPrice}
                    </span>
                    <span className="text-neutral-600">/mes</span>
                  </div>
                </div>
              </div>
            </div>

            <CardBody className="p-6">
              {/* Coverage with hover icons - V3 feature */}
              <div className="mb-6">
                <p className="text-sm font-medium text-neutral-500 mb-3">
                  Cobertura incluida
                </p>
                <div className="flex flex-wrap gap-3">
                  {currentPlan.coverage.map((item, index) => (
                    <Tooltip
                      key={index}
                      content={
                        <div className="p-2 max-w-xs">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {item.description}
                          </p>
                          {item.maxAmount && (
                            <p className="text-xs text-[#4654CD] mt-1">
                              Hasta S/{item.maxAmount}
                            </p>
                          )}
                        </div>
                      }
                      placement="top"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg cursor-help hover:bg-green-100 transition-colors">
                        <span className="text-green-600">
                          {getIconComponent(item.icon)}
                        </span>
                        <span className="text-sm text-green-700">{item.name}</span>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              {currentPlan.exclusions.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-neutral-500 mb-2">
                    No incluye
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentPlan.exclusions.map((exclusion, index) => (
                      <span
                        key={index}
                        className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded"
                      >
                        {exclusion}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Select Button */}
              <Button
                className={`w-full cursor-pointer ${
                  selectedPlanId === currentPlan.id
                    ? 'bg-[#4654CD] text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
                size="lg"
                endContent={<ChevronRight className="w-4 h-4" />}
                onPress={() => onSelectPlan(currentPlan.id)}
              >
                {selectedPlanId === currentPlan.id
                  ? 'Plan seleccionado'
                  : 'Elegir este plan'}
              </Button>
            </CardBody>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default InsurancePlanV3;
