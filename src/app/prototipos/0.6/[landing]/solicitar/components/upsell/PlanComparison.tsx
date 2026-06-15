'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { Check, ChevronRight, Shield, Clock, ShieldCheck } from 'lucide-react';
import type { InsurancePlan } from '../../types/upsell';
import { formatMoneyNoDecimals } from '../../utils/formatMoney';

interface PlanComparisonProps {
  plans: InsurancePlan[];
  selectedPlan: string | null;
  onSelect: (planId: string) => void;
}

/** Map insuranceType to a user-friendly label and icon */
function getInsuranceTypeLabel(type: string): string {
  switch (type) {
    case 'garantia_extendida':
      return 'Garantía extendida';
    case 'seguro_robo':
      return 'Protección contra robo';
    default:
      return type.replace(/_/g, ' ');
  }
}

function getInsuranceIcon(type: string) {
  switch (type) {
    case 'garantia_extendida':
      return ShieldCheck;
    case 'seguro_robo':
      return Shield;
    default:
      return Shield;
  }
}

/**
 * PlanComparison - v0.6 con CSS variables del landing
 * Usa --color-secondary en lugar de colores hardcodeados
 */
export const PlanComparison: React.FC<PlanComparisonProps> = ({
  plans,
  selectedPlan,
  onSelect,
}) => {
  const gridCols = plans.length === 1
    ? 'grid-cols-1 max-w-sm mx-auto'
    : plans.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {plans.map((plan, index) => {
        const isSelected = selectedPlan === plan.id;
        const TypeIcon = getInsuranceIcon(plan.insuranceType);
        const hasCoverage = plan.coverage.length > 0;

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="cursor-pointer"
            onClick={() => onSelect(plan.id)}
          >
            <Card
              className={`h-full transition-all ${
                isSelected
                  ? 'border-2 border-[var(--color-secondary)] shadow-lg'
                  : 'border border-neutral-200'
              }`}
              style={isSelected ? { boxShadow: '0 10px 25px -5px rgba(var(--color-secondary-rgb), 0.2)' } : undefined}
            >
              <CardBody className="p-5">
                <div className="flex items-center justify-between mb-3">
                  {plan.isRecommended ? (
                    <Chip
                      size="sm"
                      radius="sm"
                      classNames={{
                        base: 'bg-[var(--color-secondary)]/10 px-2 py-0.5 h-auto',
                        content: 'text-[var(--color-secondary)] text-xs font-medium',
                      }}
                    >
                      Recomendado
                    </Chip>
                  ) : (
                    <div />
                  )}
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>

                {/* Icon + Type label */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[var(--color-secondary)]/10 rounded-lg flex items-center justify-center">
                    <TypeIcon className="w-4 h-4 text-[var(--color-secondary)]" />
                  </div>
                  <span className="text-xs font-medium text-[var(--color-secondary)] uppercase tracking-wide">
                    {getInsuranceTypeLabel(plan.insuranceType)}
                  </span>
                </div>

                <h3 className="font-semibold text-neutral-800 mb-1">{plan.description}</h3>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-neutral-800">S/{formatMoneyNoDecimals(Math.floor(plan.monthlyPrice))}</span>
                  <span className="text-sm text-neutral-500">/mes</span>
                </div>

                {/* Coverage items (if API returns them) */}
                {hasCoverage && (
                  <div className="space-y-2 mb-3">
                    {plan.coverage.slice(0, 3).map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 bg-[var(--color-secondary)]/10 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-[var(--color-secondary)]" />
                        </div>
                        <span className="text-neutral-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Plan details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-[var(--color-secondary)]/10 rounded-full flex items-center justify-center">
                      <Clock className="w-3 h-3 text-[var(--color-secondary)]" />
                    </div>
                    <span className="text-neutral-600">Duración: {plan.durationMonths} meses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-[var(--color-secondary)]/10 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-[var(--color-secondary)]" />
                    </div>
                    <span className="text-neutral-600">Total: S/{formatMoneyNoDecimals(plan.totalPrice)} en {plan.paymentMonths} cuotas</span>
                  </div>
                  {plan.provider && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 bg-[var(--color-secondary)]/10 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-[var(--color-secondary)]" />
                      </div>
                      <span className="text-neutral-600">Proveedor: {plan.provider.name}</span>
                    </div>
                  )}
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 py-2 bg-[var(--color-secondary)] text-white text-center rounded-lg text-sm font-medium"
                  >
                    Seleccionado
                  </motion.div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlanComparison;
