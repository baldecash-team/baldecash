'use client';

/**
 * ConvenioBenefitsV4 - Timeline de beneficios
 * Version: V4 - Presentación en formato timeline/proceso
 */

import React from 'react';
import { Percent, Clock, Shield, Truck, CreditCard, Calendar } from 'lucide-react';
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

export const ConvenioBenefitsV4: React.FC<ConvenioBenefitsProps> = ({
  convenio,
  benefits,
}) => {
  const beneficiosList = benefits || getBenefitsByConvenio(convenio);

  return (
    <section id="beneficios" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            Lo que incluye tu convenio
          </h2>
          <p className="text-neutral-600">
            Beneficios que se activan automáticamente al verificar tu correo institucional.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 top-0 bottom-0 w-0.5"
            style={{ backgroundColor: convenio.colorPrimario }}
          />

          <div className="space-y-8">
            {beneficiosList.map((beneficio, index) => {
              const IconComponent = iconMap[beneficio.icon] || Shield;

              return (
                <div key={beneficio.id} className="relative flex items-start gap-6">
                  {/* Icon node */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                    style={{ backgroundColor: convenio.colorPrimario }}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${convenio.colorPrimario}15`,
                            color: convenio.colorPrimario,
                          }}
                        >
                          Beneficio {index + 1}
                        </span>
                      </div>
                      <h3 className="font-semibold text-neutral-800 mb-2">
                        {beneficio.titulo}
                      </h3>
                      <p className="text-neutral-600 text-sm">
                        {beneficio.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConvenioBenefitsV4;
