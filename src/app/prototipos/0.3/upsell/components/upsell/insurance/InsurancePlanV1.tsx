'use client';

/**
 * InsurancePlanV1 - Cards comparativas lado a lado
 *
 * E.3 V1: Cards lado a lado
 * E.4 V1: Badge "Recomendado"
 * E.5 V1: Lista con checks verdes y X rojas
 */

import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Shield,
  Umbrella,
  Lock,
  Check,
  X,
  AlertTriangle,
  Droplet,
  Search,
  Clock,
} from 'lucide-react';
import { InsurancePlan, UpsellConfig } from '../../../types/upsell';

interface InsurancePlanV1Props {
  plan: InsurancePlan;
  isSelected: boolean;
  onSelect: () => void;
  protectionIcon: UpsellConfig['protectionIcon'];
  recommendedHighlight: UpsellConfig['recommendedHighlight'];
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    Shield: <Shield className="w-4 h-4" />,
    AlertTriangle: <AlertTriangle className="w-4 h-4" />,
    Droplet: <Droplet className="w-4 h-4" />,
    Search: <Search className="w-4 h-4" />,
    Clock: <Clock className="w-4 h-4" />,
  };
  return icons[iconName] || <Shield className="w-4 h-4" />;
};

const getProtectionIcon = (type: UpsellConfig['protectionIcon']) => {
  switch (type) {
    case 'shield':
      return <Shield className="w-6 h-6" />;
    case 'umbrella':
      return <Umbrella className="w-6 h-6" />;
    case 'lock':
      return <Lock className="w-6 h-6" />;
    default:
      return <Shield className="w-6 h-6" />;
  }
};

const getTierColor = (tier: InsurancePlan['tier']) => {
  switch (tier) {
    case 'basic':
      return 'bg-neutral-100 text-neutral-700';
    case 'standard':
      return 'bg-blue-100 text-blue-700';
    case 'premium':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-neutral-100 text-neutral-700';
  }
};

export const InsurancePlanV1: React.FC<InsurancePlanV1Props> = ({
  plan,
  isSelected,
  onSelect,
  protectionIcon,
  recommendedHighlight,
}) => {
  const showBadge =
    plan.isRecommended && recommendedHighlight === 'badge';
  const isLarger =
    plan.isRecommended && recommendedHighlight === 'larger_card';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={isLarger ? 'md:scale-105 z-10' : ''}
    >
      <Card
        className={`h-full transition-all duration-200 ${
          isSelected
            ? 'border-2 border-[#4654CD] shadow-lg shadow-[#4654CD]/10'
            : plan.isRecommended
              ? 'border-2 border-[#4654CD]/30'
              : 'border border-neutral-200'
        }`}
      >
        <CardHeader className="flex-col items-start gap-2 pb-0">
          {/* Recommended Badge */}
          {showBadge && (
            <Chip
              color="primary"
              variant="solid"
              size="sm"
              className="absolute -top-2 left-1/2 -translate-x-1/2"
            >
              Recomendado
            </Chip>
          )}

          <div className="flex items-center gap-2 w-full">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTierColor(plan.tier)}`}
            >
              {getProtectionIcon(protectionIcon)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-neutral-800">{plan.name}</h4>
              <Chip
                size="sm"
                variant="flat"
                className={getTierColor(plan.tier)}
                classNames={{ content: 'text-[10px] font-medium' }}
              >
                {plan.tier === 'basic'
                  ? 'Basico'
                  : plan.tier === 'standard'
                    ? 'Estandar'
                    : 'Premium'}
              </Chip>
            </div>
          </div>

          {/* Price */}
          <div className="w-full mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
                S/{plan.monthlyPrice}
              </span>
              <span className="text-sm text-neutral-500">/mes</span>
            </div>
            <p className="text-xs text-neutral-400">
              S/{plan.yearlyPrice}/ano
            </p>
          </div>
        </CardHeader>

        <CardBody className="pt-4">
          {/* Coverage List - V1: Checks and X */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-neutral-500 uppercase">
              Cobertura
            </p>
            {plan.coverage.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <span className="text-sm text-neutral-700">{item.name}</span>
                  {item.maxAmount && (
                    <span className="text-xs text-neutral-400 ml-1">
                      (hasta S/{item.maxAmount})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Exclusions - V1: X marks */}
          <div className="space-y-2 mb-6">
            <p className="text-xs font-medium text-neutral-500 uppercase">
              No incluye
            </p>
            {plan.exclusions.map((exclusion, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 text-red-500" />
                </div>
                <span className="text-sm text-neutral-500">{exclusion}</span>
              </div>
            ))}
          </div>

          {/* Select Button */}
          <Button
            className={`w-full cursor-pointer ${
              isSelected
                ? 'bg-[#4654CD] text-white'
                : 'bg-neutral-100 hover:bg-neutral-200'
            }`}
            onPress={onSelect}
          >
            {isSelected ? 'Seleccionado' : 'Seleccionar'}
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default InsurancePlanV1;
