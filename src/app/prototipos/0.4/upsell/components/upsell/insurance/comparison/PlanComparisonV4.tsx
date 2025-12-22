'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { Check, ChevronRight } from 'lucide-react';
import type { InsurancePlan } from '../../../../types/upsell';

interface PlanComparisonV4Props {
  plans: InsurancePlan[];
  selectedPlan: string | null;
  onSelect: (planId: string) => void;
}

/**
 * PlanComparisonV4 - Cards con hover para detalles (fintech)
 * Animación elegante al hover
 */
export const PlanComparisonV4: React.FC<PlanComparisonV4Props> = ({
  plans,
  selectedPlan,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((plan, index) => (
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
              selectedPlan === plan.id
                ? 'border-2 border-[#03DBD0] shadow-lg shadow-[#03DBD0]/20'
                : 'border border-neutral-200'
            }`}
          >
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-3">
                {plan.isRecommended ? (
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
                ) : (
                  <div />
                )}
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>

              <h3 className="font-semibold text-neutral-800 mb-1">{plan.name}</h3>
              
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-neutral-800">S/{plan.monthlyPrice}</span>
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

              {selectedPlan === plan.id && (
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
      ))}
    </div>
  );
};

export default PlanComparisonV4;
