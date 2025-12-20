'use client';

/**
 * ConvenioBenefitsV5 - Cards con gradiente sutil
 * Version: V5 - Cards con fondo sutil y bordes de color
 */

import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { Percent, Clock, Shield, Truck, CreditCard, Calendar, Star } from 'lucide-react';
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

export const ConvenioBenefitsV5: React.FC<ConvenioBenefitsProps> = ({
  convenio,
  benefits,
}) => {
  const beneficiosList = benefits || getBenefitsByConvenio(convenio);

  return (
    <section id="beneficios" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with badge */}
        <div className="text-center mb-12">
          <Chip
            radius="sm"
            classNames={{
              base: 'px-3 py-1 h-auto mb-4',
              content: 'text-white text-xs font-medium',
            }}
            style={{ backgroundColor: convenio.colorPrimario }}
            startContent={<Star className="w-3 h-3" />}
          >
            Beneficios exclusivos
          </Chip>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            Ventajas de ser estudiante {convenio.nombreCorto}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Tu convenio universitario te da acceso a condiciones especiales diseñadas
            para que puedas financiar tu equipo de manera accesible.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficiosList.map((beneficio, index) => {
            const IconComponent = iconMap[beneficio.icon] || Shield;
            const isFirst = index === 0;

            return (
              <Card
                key={beneficio.id}
                className={`overflow-hidden transition-all hover:shadow-lg ${
                  isFirst ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
                style={{
                  borderTop: `4px solid ${convenio.colorPrimario}`,
                }}
              >
                <CardBody
                  className="p-6"
                  style={{
                    background: isFirst
                      ? `linear-gradient(135deg, ${convenio.colorPrimario}08 0%, transparent 50%)`
                      : undefined,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${convenio.colorPrimario}15` }}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: convenio.colorPrimario }}
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                    {beneficio.titulo}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {beneficio.descripcion}
                  </p>

                  {isFirst && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        Beneficio principal de tu convenio
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ConvenioBenefitsV5;
