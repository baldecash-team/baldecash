'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { Check, ChevronRight, Lock, Info } from 'lucide-react';
import type { InsurancePlan } from '../../types/upsell';
import { formatMoney } from '../../../utils/formatMoney';

interface PlanComparisonProps {
  plans: InsurancePlan[];
  selectedPlan: string | null;
  onSelect: (planId: string) => void;
  onViewDetails?: (planId: string) => void;
  lockedPlanId?: string | null;
}

/**
 * PlanComparison - Cards con hover para detalles fintech (basado en V4 de 0.4)
 * Animación elegante al hover. Soporta plan bloqueado (heredado) y "Ver detalles".
 */
export const PlanComparison: React.FC<PlanComparisonProps> = ({
  plans,
  selectedPlan,
  onSelect,
  onViewDetails,
  lockedPlanId = null,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 seguros-cards scroll-mt-24">
      {plans.map((plan, index) => {
        const isLocked = lockedPlanId === plan.id;
        const isSelected = selectedPlan === plan.id;
        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: isLocked ? 1 : 1.02, y: isLocked ? 0 : -4 }}
            className={isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
            onClick={() => {
              if (isLocked) return;
              onSelect(plan.id);
            }}
          >
            <Card
              className={`h-full transition-all ${
                isSelected
                  ? 'border-2 border-[#03DBD0] shadow-lg shadow-[#03DBD0]/20'
                  : 'border border-neutral-200'
              }`}
            >
              <CardBody className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {plan.isRecommended && (
                      <Chip
                        size="sm"
                        radius="sm"
                        classNames={{
                          base: 'bg-[#03DBD0]/10 px-2 py-0.5 h-auto',
                          content: 'text-[#02C3BA] text-xs font-medium',
                        }}
                      >
                        Más popular
                      </Chip>
                    )}
                    {isLocked && (
                      <Chip
                        size="sm"
                        radius="sm"
                        classNames={{
                          base: 'bg-neutral-100 px-2 py-0.5 h-auto',
                          content: 'text-neutral-600 text-xs font-medium flex items-center gap-1',
                        }}
                      >
                        <Lock className="w-3 h-3" /> Heredado
                      </Chip>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>

                <h3 className="font-semibold text-neutral-800 mb-1">{plan.name}</h3>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-neutral-800">
                    S/{formatMoney(plan.monthlyPrice)}
                  </span>
                  <span className="text-sm text-neutral-500">/mes</span>
                </div>

                <div className="space-y-2">
                  {plan.coverage.slice(0, 3).map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 bg-[#03DBD0]/10 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#02C3BA]" />
                      </div>
                      <span className="text-neutral-600">{item.name}</span>
                    </div>
                  ))}
                </div>

                {onViewDetails && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(plan.id);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#4654CD] hover:text-[#3a47b3] cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    Ver detalles
                  </button>
                )}

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 py-2 bg-[#03DBD0] text-white text-center rounded-lg text-sm font-medium"
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
