'use client';

/**
 * HomeBenefits v0.6 - Beneficios genéricos de BaldeCash
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Percent, Clock, Shield, Truck, CreditCard, Calendar } from 'lucide-react';

interface HomeBenefitsProps {
  primaryColor?: string;
}

const benefits = [
  {
    id: 'sin-aval',
    icon: 'Shield',
    titulo: 'Sin aval requerido',
    descripcion: 'No necesitas garante ni aval. Tu constancia de estudios es tu mejor respaldo.',
  },
  {
    id: 'aprobacion-rapida',
    icon: 'Clock',
    titulo: 'Aprobación en 24h',
    descripcion: 'Proceso 100% digital. Recibe tu respuesta en menos de un día hábil.',
  },
  {
    id: 'cuotas-flexibles',
    icon: 'Calendar',
    titulo: 'Cuotas flexibles',
    descripcion: 'Elige entre 6, 12 o 18 cuotas. Adapta tu pago a tu presupuesto.',
  },
  {
    id: 'tasa-preferencial',
    icon: 'Percent',
    titulo: 'TEA preferencial',
    descripcion: 'Tasas especiales para estudiantes universitarios. Sin sorpresas.',
  },
  {
    id: 'entrega-gratis',
    icon: 'Truck',
    titulo: 'Envío gratis a Lima',
    descripcion: 'Recibe tu laptop en la puerta de tu casa sin costo adicional.',
  },
  {
    id: 'pago-digital',
    icon: 'CreditCard',
    titulo: 'Pago 100% digital',
    descripcion: 'Paga tus cuotas desde cualquier banco o billetera digital.',
  },
];

const iconMap: Record<string, React.ElementType> = {
  Percent,
  Clock,
  Shield,
  Truck,
  CreditCard,
  Calendar,
};

export const HomeBenefits: React.FC<HomeBenefitsProps> = ({ primaryColor = '#4654CD' }) => {
  return (
    <section id="beneficios" className="py-16 md:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 font-['Baloo_2']"
            style={{ color: primaryColor }}
          >
            ¿Por qué elegir BaldeCash?
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Financiamiento diseñado especialmente para estudiantes universitarios peruanos.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon] || Shield;
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
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Icon className="w-7 h-7" style={{ color: primaryColor }} />
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

export default HomeBenefits;
