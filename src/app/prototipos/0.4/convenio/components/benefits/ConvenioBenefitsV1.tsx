'use client';

/**
 * ConvenioBenefitsV1 - Cards Grid con iconos circulares
 * Version: V1 - Grid de beneficios con iconos en círculos de color
 */

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
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

export const ConvenioBenefitsV1: React.FC<ConvenioBenefitsProps> = ({
  convenio,
  benefits,
}) => {
  const beneficiosList = benefits || getBenefitsByConvenio(convenio);

  return (
    <section id="beneficios" className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            Beneficios exclusivos {convenio.nombreCorto}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Por ser estudiante de {convenio.nombre}, accedes a condiciones especiales que
            no encontrarás en ningún otro lugar.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficiosList.map((beneficio, index) => {
            const IconComponent = iconMap[beneficio.icon] || Shield;

            return (
              <Card
                key={beneficio.id}
                className="border border-neutral-200 hover:border-[#4654CD]/30 hover:shadow-lg transition-all"
              >
                <CardBody className="p-6">
                  {/* Icon in circle */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${convenio.colorPrimario}15` }}
                  >
                    <IconComponent
                      className="w-7 h-7"
                      style={{ color: convenio.colorPrimario }}
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                    {beneficio.titulo}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {beneficio.descripcion}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ConvenioBenefitsV1;
