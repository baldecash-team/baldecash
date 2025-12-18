'use client';

/**
 * InsuranceSection - Seccion principal de seguros
 *
 * Orquesta los planes de seguro segun version
 * E.1: Framing como proteccion/tranquilidad/directo
 * E.2: Iconografia de proteccion
 * E.6: Ejemplos de situaciones cubiertas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Umbrella, Lock, AlertCircle } from 'lucide-react';
import { InsurancePlanV1 } from './InsurancePlanV1';
import { InsurancePlanV2 } from './InsurancePlanV2';
import { InsurancePlanV3 } from './InsurancePlanV3';
import { InsurancePlan, UpsellConfig } from '../../../types/upsell';

interface InsuranceSectionProps {
  plans: InsurancePlan[];
  selectedPlanId: string | null;
  onSelectPlan: (id: string) => void;
  onSkipInsurance: () => void;
  config: UpsellConfig;
}

const getFramingContent = (
  type: UpsellConfig['insuranceFraming']
): { title: string; subtitle: string } => {
  switch (type) {
    case 'protection':
      return {
        title: 'Protege tu laptop',
        subtitle: 'Cobertura ante imprevistos que pueden ocurrir',
      };
    case 'peace_of_mind':
      return {
        title: 'Tranquilidad total',
        subtitle: 'Estudia sin preocupaciones con tu laptop asegurada',
      };
    case 'direct':
      return {
        title: 'Seguro contra accidentes',
        subtitle: 'Elige el nivel de proteccion que necesitas',
      };
    default:
      return {
        title: 'Protege tu laptop',
        subtitle: 'Cobertura ante imprevistos que pueden ocurrir',
      };
  }
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

export const InsuranceSection: React.FC<InsuranceSectionProps> = ({
  plans,
  selectedPlanId,
  onSelectPlan,
  onSkipInsurance,
  config,
}) => {
  const framing = getFramingContent(config.insuranceFraming);

  return (
    <section className="py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 text-[#4654CD] mb-1">
          {getProtectionIcon(config.protectionIcon)}
          <h3 className="text-lg font-semibold text-neutral-800">
            {framing.title}
          </h3>
        </div>
        <p className="text-sm text-neutral-500">{framing.subtitle}</p>
      </motion.div>

      {/* E.6: Example situation illustration */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-amber-800 font-medium">
              Si se te cae la laptop o derramas cafe sobre ella...
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Con seguro: Reparacion o reemplazo sin costo adicional
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Sin seguro: Tendrias que pagar la reparacion de tu bolsillo
            </p>
          </div>
        </div>
      </motion.div>

      {/* Plans based on version */}
      {config.insurancePlanVersion === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <InsurancePlanV1
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanId === plan.id}
              onSelect={() => onSelectPlan(plan.id)}
              protectionIcon={config.protectionIcon}
              recommendedHighlight={config.recommendedHighlight}
            />
          ))}
        </div>
      )}

      {config.insurancePlanVersion === 2 && (
        <InsurancePlanV2
          plans={plans}
          selectedPlanId={selectedPlanId}
          onSelectPlan={onSelectPlan}
          protectionIcon={config.protectionIcon}
        />
      )}

      {config.insurancePlanVersion === 3 && (
        <InsurancePlanV3
          plans={plans}
          selectedPlanId={selectedPlanId}
          onSelectPlan={onSelectPlan}
          protectionIcon={config.protectionIcon}
          preselect={config.recommendedHighlight === 'preselected'}
        />
      )}

      {/* Skip insurance option */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        <button
          onClick={onSkipInsurance}
          className="text-sm text-neutral-500 hover:text-neutral-700 underline cursor-pointer"
        >
          Continuar sin seguro
        </button>
      </motion.div>
    </section>
  );
};

export default InsuranceSection;
