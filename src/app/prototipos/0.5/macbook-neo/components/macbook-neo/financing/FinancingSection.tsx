'use client';

/**
 * FinancingSection
 *
 * BaldeCash differentiator — shows the 3 financing plans with staggered
 * whileInView animations. Highlighted plan gets a "Recomendado" badge and
 * a stronger border/shadow treatment.
 *
 * Usage:
 *   <FinancingSection />
 */

import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { financingPlans } from '../../../data/mockMacbookNeoData';
import { FinancingPlan } from '../../../types/macbook-neo';
import { formatMoney } from '../../../../utils/formatMoney';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

function PlanCard({ plan }: { plan: FinancingPlan }) {
  const isHighlighted = plan.destacado === true;

  return (
    <motion.div
      variants={cardVariants}
      className={[
        'bg-white rounded-xl p-6 text-center relative',
        isHighlighted
          ? 'border-2 border-[#4654CD] shadow-md'
          : 'border border-neutral-200 shadow-sm',
      ].join(' ')}
    >
      {/* Recommended badge */}
      {isHighlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4654CD] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          Recomendado
        </span>
      )}

      {/* Plan name */}
      <p className="text-lg font-semibold text-neutral-800 mb-3">
        {plan.nombre}
      </p>

      {/* Monthly payment */}
      <p
        className="text-4xl font-bold text-neutral-900 leading-none"
        style={{ fontFamily: "'Baloo 2', cursive" }}
      >
        <span className="text-xl align-top mt-1 inline-block mr-0.5">S/</span>
        {formatMoney(plan.cuotaMensual)}
        <span className="text-sm font-normal text-neutral-500 ml-1">/mes</span>
      </p>

      {/* Term */}
      <p className="text-sm text-neutral-500 mt-2">{plan.plazoMeses} meses</p>

      {/* Divider */}
      <div className="border-t border-neutral-100 my-4" />

      {/* Details */}
      <div className="space-y-1 text-sm text-neutral-600 mb-6">
        <p>Cuota inicial: S/0</p>
        <p>Precio total: S/{formatMoney(plan.precioTotal)}</p>
      </div>

      {/* CTA */}
      {isHighlighted ? (
        <Button
          as="a"
          href="#"
          className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer"
          radius="md"
        >
          Solicitar ahora
        </Button>
      ) : (
        <Button
          as="a"
          href="#"
          variant="bordered"
          className="w-full border border-[#4654CD] text-[#4654CD] bg-white font-semibold cursor-pointer"
          radius="md"
        >
          Solicitar ahora
        </Button>
      )}
    </motion.div>
  );
}

export function FinancingSection() {
  return (
    <section
      id="financiamiento"
      className="scroll-mt-24 py-20 md:py-32 bg-neutral-50"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Financiamiento estudiantil
          </h2>
          <p className="text-base md:text-lg text-neutral-500">
            Sin historial crediticio. Sin inicial. Aprobación en 24 horas.
          </p>
        </div>

        {/* Plans grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {financingPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
