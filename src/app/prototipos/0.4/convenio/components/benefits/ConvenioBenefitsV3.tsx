'use client';

/**
 * ConvenioBenefitsV3 - Cards horizontales (2 columnas)
 * Version: V3 - Grid de 2 columnas con cards horizontales
 */

import React from 'react';
import { Percent, Clock, Shield, Truck, CreditCard, Calendar, ArrowRight } from 'lucide-react';
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

export const ConvenioBenefitsV3: React.FC<ConvenioBenefitsProps> = ({
  convenio,
  benefits,
}) => {
  const beneficiosList = benefits || getBenefitsByConvenio(convenio);

  return (
    <section id="beneficios" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            Tu convenio, tus beneficios
          </h2>
          <p className="text-neutral-600 max-w-xl">
            Como estudiante de {convenio.nombre}, accedes a estas ventajas exclusivas.
          </p>
        </div>

        {/* Benefits grid - 2 columns */}
        <div className="grid md:grid-cols-2 gap-4">
          {beneficiosList.map((beneficio, index) => {
            const IconComponent = iconMap[beneficio.icon] || Shield;
            const isHighlighted = index === 0; // First benefit is highlighted

            return (
              <div
                key={beneficio.id}
                className={`flex items-center gap-4 p-5 rounded-xl border transition-all cursor-pointer group ${
                  isHighlighted
                    ? 'bg-[#4654CD] border-[#4654CD] text-white'
                    : 'bg-white border-neutral-200 hover:border-[#4654CD]/30 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isHighlighted ? 'bg-white/20' : ''
                  }`}
                  style={!isHighlighted ? { backgroundColor: `${convenio.colorPrimario}15` } : {}}
                >
                  <IconComponent
                    className="w-6 h-6"
                    style={!isHighlighted ? { color: convenio.colorPrimario } : { color: 'white' }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold mb-1 ${isHighlighted ? 'text-white' : 'text-neutral-800'}`}>
                    {beneficio.titulo}
                  </h3>
                  <p className={`text-sm ${isHighlighted ? 'text-white/80' : 'text-neutral-600'}`}>
                    {beneficio.descripcion}
                  </p>
                </div>

                <ArrowRight
                  className={`w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isHighlighted ? 'text-white' : 'text-[#4654CD]'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ConvenioBenefitsV3;
