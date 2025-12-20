'use client';

/**
 * ConvenioTestimonialsV5 - Cards con foto grande
 * Version: V5 - Testimonios con imagen de estudiante prominente
 */

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Star, Quote, Laptop } from 'lucide-react';
import { ConvenioTestimonialsProps } from '../../types/convenio';
import { getTestimoniosByConvenio, testimonios as allTestimonios } from '../../data/mockConvenioData';

export const ConvenioTestimonialsV5: React.FC<ConvenioTestimonialsProps> = ({
  convenio,
  testimonios,
}) => {
  let testimoniosList = testimonios || getTestimoniosByConvenio(convenio.slug);
  if (testimoniosList.length === 0) {
    testimoniosList = allTestimonios.slice(0, 3);
  }

  return (
    <section id="testimonios" className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            Ellos ya tienen su equipo
          </h2>
          <p className="text-neutral-600">
            Estudiantes de {convenio.nombreCorto} que confiaron en BaldeCash.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimoniosList.slice(0, 3).map((testimonio, index) => (
            <Card key={testimonio.id} className="overflow-hidden border-none shadow-lg">
              {/* Large photo */}
              <div className="relative h-64">
                <img
                  src={testimonio.foto || `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=400&fit=crop`}
                  alt={testimonio.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${testimonio.nombre}&background=4654CD&color=fff&size=400`;
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Name on photo */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-bold text-lg">{testimonio.nombre}</p>
                  <p className="text-white/80 text-sm">{testimonio.carrera}</p>
                </div>

                {/* Rating badge */}
                {testimonio.rating && (
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-sm">{testimonio.rating}.0</span>
                  </div>
                )}
              </div>

              <CardBody className="p-6">
                {/* Quote */}
                <div className="relative">
                  <Quote
                    className="absolute -top-3 -left-2 w-8 h-8 opacity-10"
                    style={{ color: convenio.colorPrimario }}
                  />
                  <p className="text-neutral-600 italic pl-4">
                    "{testimonio.testimonio}"
                  </p>
                </div>

                {/* Equipment purchased */}
                {testimonio.equipoComprado && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-500">
                      Adquirió: <span className="font-medium text-neutral-700">{testimonio.equipoComprado}</span>
                    </span>
                  </div>
                )}

                {/* University logo */}
                <div className="mt-4 flex items-center justify-between">
                  <img
                    src={convenio.logo}
                    alt={convenio.nombre}
                    className="h-6 object-contain opacity-50"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {testimonio.fechaCompra && (
                    <span className="text-xs text-neutral-400">
                      {new Date(testimonio.fechaCompra).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConvenioTestimonialsV5;
