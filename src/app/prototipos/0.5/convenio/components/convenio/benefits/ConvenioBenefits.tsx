'use client';

/**
 * ConvenioBenefits - Cards Grid con iconos (basado en V1)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Percent, Clock, Shield, Truck, CreditCard, Calendar } from 'lucide-react';
import { ConvenioData } from '../../../types/convenio';
import { getBenefitsByConvenio } from '../../../data/mockConvenioData';

interface ConvenioBenefitsProps {
  convenio: ConvenioData;
}

const iconMap: Record<string, React.ElementType> = {
  Percent,
  Clock,
  Shield,
  Truck,
  CreditCard,
  Calendar,
};

export const ConvenioBenefits: React.FC<ConvenioBenefitsProps> = ({ convenio }) => {
  const benefits = getBenefitsByConvenio(convenio);

  return (
    <section id="beneficios" className="py-16 md:py-24 bg-neutral-50 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 font-['Baloo_2']"
            style={{ color: convenio.colorPrimario }}
          >
            Beneficios exclusivos para {convenio.nombreCorto}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Por ser estudiante de {convenio.nombre}, accedes a condiciones especiales que no encontrarás en otro lugar.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon] || Percent;
            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${convenio.colorPrimario}15` }}
                >
                  <Icon className="w-7 h-7" style={{ color: convenio.colorPrimario }} />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  {benefit.titulo}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {benefit.descripcion}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ConvenioBenefits;
