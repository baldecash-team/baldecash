'use client';

/**
 * ConvenioBenefitsV2 - Lista vertical con iconos
 * Version: V2 - Lista de beneficios en formato vertical con checkmarks
 */

import React from 'react';
import { CheckCircle, Percent, Clock, Shield, Truck, CreditCard, Calendar } from 'lucide-react';
import { ConvenioBenefitsProps } from '../../types/convenio';
import { getBenefitsByConvenio } from '../../data/mockConvenioData';

const iconMap: Record<string, React.ElementType> = {
  Percent,
  Clock,
  Shield,
  Truck,
  CreditCard,
  Calendar,
};

export const ConvenioBenefitsV2: React.FC<ConvenioBenefitsProps> = ({
  convenio,
  benefits,
}) => {
  const beneficiosList = benefits || getBenefitsByConvenio(convenio);

  return (
    <section id="beneficios" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            ¿Por qué elegir BaldeCash + {convenio.nombreCorto}?
          </h2>
          <p className="text-neutral-600">
            Tu convenio te da acceso a beneficios que hacen más fácil financiar tu equipo.
          </p>
        </div>

        {/* Benefits list */}
        <div className="space-y-4">
          {beneficiosList.map((beneficio) => {
            const IconComponent = iconMap[beneficio.icon] || Shield;

            return (
              <div
                key={beneficio.id}
                className="flex items-start gap-4 p-5 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-[#4654CD]/30 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: convenio.colorPrimario }}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-800">
                      {beneficio.titulo}
                    </h3>
                    <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                  </div>
                  <p className="text-neutral-600 text-sm">
                    {beneficio.descripcion}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500">
            Todos los beneficios aplican automáticamente al verificar tu correo
            <span className="font-medium" style={{ color: convenio.colorPrimario }}>
              {' '}@{convenio.dominioEmail}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConvenioBenefitsV2;
