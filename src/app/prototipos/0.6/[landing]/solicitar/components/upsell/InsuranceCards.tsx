'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Check, Plus, X, Shield, Clock, FileText, Users } from 'lucide-react';
import type { InsurancePlan } from '../../types/upsell';
import { formatMoneyNoDecimals } from '../../utils/formatMoney';
import { InsuranceDetailModal } from './InsuranceDetailModal';

interface InsuranceCardsProps {
  plans: InsurancePlan[];
  selectedPlanIds: string[];
  onToggle: (planId: string) => void;
  showIntro?: boolean;
}

function getInsuranceIcon(type: string) {
  return type === 'seguro_robo' ? Lock : ShieldCheck;
}

function getInsuranceLabel(type: string): string {
  switch (type) {
    case 'garantia_extendida': return 'Garantía extendida';
    case 'seguro_robo': return 'Protección contra robo';
    default: return type.replace(/_/g, ' ');
  }
}

function getDescription(type: string): string {
  switch (type) {
    case 'garantia_extendida': return 'Protección completa contra fallas técnicas o defectos de fábrica.';
    case 'seguro_robo': return 'Protección mundial contra robo. Reposición inmediata sin deducible.';
    default: return '';
  }
}

function getBenefits(type: string): string[] {
  switch (type) {
    case 'garantia_extendida': return [
      'Hasta 3 años de cobertura adicional',
      'Sin deducibles ni papeleos',
      'Cobertura mundial 100% digital',
    ];
    case 'seguro_robo': return [
      'Cobertura por robo y hurto',
      'Reposición sin deducible',
      'Proceso de reclamo 100% digital',
    ];
    default: return [];
  }
}

export const InsuranceCards: React.FC<InsuranceCardsProps> = ({
  plans,
  selectedPlanIds,
  onToggle,
  showIntro = true,
}) => {
  const [detailPlan, setDetailPlan] = useState<InsurancePlan | null>(null);

  const gridCols = plans.length === 1
    ? 'grid-cols-1 max-w-lg mx-auto'
    : 'grid-cols-1 md:grid-cols-2';

  return (
    <>
      {/* Intro */}
      {showIntro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{
                boxShadow: ['0 0 0 0 rgba(var(--color-primary-rgb), 0.4)', '0 0 0 10px rgba(var(--color-primary-rgb), 0)', '0 0 0 0 rgba(var(--color-primary-rgb), 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center"
            >
              <Shield className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-800">
                Protege tu equipo
              </h2>
              <p className="text-sm text-neutral-500">
                Puedes elegir una o ambas coberturas. Son opcionales.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cards Grid */}
      <div className={`grid ${gridCols} gap-4`}>
        {plans.map((plan, index) => {
          const Icon = getInsuranceIcon(plan.insuranceType);
          const isSelected = selectedPlanIds.includes(plan.id);
          const benefits = getBenefits(plan.insuranceType);
          const description = getDescription(plan.insuranceType);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`rounded-2xl border-2 overflow-hidden transition-all ${
                  isSelected
                    ? 'border-[var(--color-secondary)] shadow-lg shadow-[rgba(var(--color-secondary-rgb),0.15)]'
                    : 'border-neutral-200 hover:border-[rgba(var(--color-primary-rgb),0.3)]'
                }`}
              >
                <div className="p-5 pb-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[var(--color-secondary)] uppercase tracking-wide">
                          {getInsuranceLabel(plan.insuranceType)}
                        </p>
                        <h3 className="font-bold text-neutral-800 text-sm leading-tight">
                          {plan.name}
                        </h3>
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-[var(--color-secondary)] rounded-full flex items-center justify-center flex-shrink-0"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="bg-[rgba(var(--color-primary-rgb),0.06)] rounded-xl px-4 py-3 mb-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-[var(--color-primary)]">
                        S/ {formatMoneyNoDecimals(Math.floor(plan.monthlyPrice))}
                      </span>
                      <span className="text-sm text-neutral-500">/mes</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Total S/ {formatMoneyNoDecimals(plan.totalPrice)} en {plan.paymentMonths} cuotas
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-500 mb-3">
                    {description}
                  </p>

                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    {benefits.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[var(--color-secondary)] flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-neutral-600">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Duration + Provider */}
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>{plan.durationMonths} meses</span>
                    {plan.provider && (
                      <>
                        <span>·</span>
                        <span>{plan.provider.name}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => onToggle(plan.id)}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        : 'bg-[var(--color-primary)] text-white hover:brightness-90'
                    }`}
                  >
                    {isSelected ? (
                      <><X className="w-4 h-4" /> Quitar protección</>
                    ) : (
                      <><Plus className="w-4 h-4" /> Agregar protección</>
                    )}
                  </button>
                  <button
                    onClick={() => setDetailPlan(plan)}
                    className="w-full py-1.5 mt-1 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Ver términos y condiciones
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Social proof */}
      <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-neutral-400">
        <Users className="w-3 h-3" />
        <span>Más de 10,000 estudiantes confían en BaldeCash</span>
      </div>

      {/* Detail Modal */}
      <InsuranceDetailModal
        plan={detailPlan}
        isOpen={!!detailPlan}
        onClose={() => setDetailPlan(null)}
        isSelected={detailPlan ? selectedPlanIds.includes(detailPlan.id) : false}
        onToggle={() => {
          if (detailPlan) onToggle(detailPlan.id);
        }}
      />
    </>
  );
};

export default InsuranceCards;
