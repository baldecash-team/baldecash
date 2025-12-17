'use client';

/**
 * SocialProofV3 - Contador grande + logos destacados
 *
 * Caracteristicas:
 * - Contador animado de estudiantes financiados
 * - Solo logos de instituciones destacadas
 * - Enfasis en numeros y social proof
 */

import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Building, Calendar, Award } from 'lucide-react';
import { SocialProofProps } from '../../../types/hero';
import { mockSocialProof } from '../../../data/mockHeroData';

const AnimatedCounter: React.FC<{ target: number; suffix?: string }> = ({
  target,
  suffix = '',
}) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

export const SocialProofV3: React.FC<SocialProofProps> = ({
  data = mockSocialProof,
}) => {
  const stats = [
    {
      icon: Users,
      value: data.studentCount,
      suffix: '+',
      label: 'Estudiantes financiados',
    },
    {
      icon: Building,
      value: data.institutionCount,
      suffix: '+',
      label: 'Instituciones aliadas',
    },
    {
      icon: Calendar,
      value: data.yearsInMarket,
      suffix: ' años',
      label: 'En el mercado',
    },
    {
      icon: Award,
      value: 98,
      suffix: '%',
      label: 'Satisfaccion',
    },
  ];

  // Solo mostrar las primeras 4 instituciones destacadas
  const featuredInstitutions = data.institutions.slice(0, 4);

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#4654CD]/5 rounded-xl mb-4">
                <stat.icon className="w-7 h-7 text-[#4654CD]" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-neutral-900">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-100 my-12" />

        {/* Featured institutions */}
        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-6">
            Confian en nosotros estudiantes de:
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {featuredInstitutions.map((institution, index) => (
              <motion.div
                key={institution.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 bg-neutral-50 rounded-full px-6 py-3"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-[#4654CD]">
                    {institution.code.substring(0, 2)}
                  </span>
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  {institution.shortName}
                </span>
              </motion.div>
            ))}
          </div>

          {/* More institutions link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="mt-6 text-sm text-neutral-500"
          >
            Y {data.institutionCount - 4}+ instituciones mas...{' '}
            <a href="#instituciones" className="text-[#4654CD] hover:underline">
              Ver todas
            </a>
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default SocialProofV3;
