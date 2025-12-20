'use client';

/**
 * ConvenioTestimonialsV1 - Cards Grid (3 columnas)
 * Version: V1 - Grid de testimonios en formato card
 */

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Star, Quote } from 'lucide-react';
import { ConvenioTestimonialsProps } from '../../types/convenio';
import { getTestimoniosByConvenio, testimonios as allTestimonios } from '../../data/mockConvenioData';

export const ConvenioTestimonialsV1: React.FC<ConvenioTestimonialsProps> = ({
  convenio,
  testimonios,
}) => {
  // Get testimonials for this convenio, or show general if none available
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
            Estudiantes de {convenio.nombreCorto} que ya tienen su equipo
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Conoce las experiencias de otros estudiantes que aprovecharon el convenio.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimoniosList.slice(0, 3).map((testimonio) => (
            <Card key={testimonio.id} className="border border-neutral-200">
              <CardBody className="p-6">
                {/* Quote icon */}
                <Quote
                  className="w-8 h-8 mb-4"
                  style={{ color: convenio.colorPrimario }}
                />

                {/* Testimonial text */}
                <p className="text-neutral-600 mb-6 italic">
                  "{testimonio.testimonio}"
                </p>

                {/* Author info */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonio.foto || `https://ui-avatars.com/api/?name=${testimonio.nombre}&background=4654CD&color=fff`}
                    alt={testimonio.nombre}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${testimonio.nombre}&background=4654CD&color=fff`;
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800">{testimonio.nombre}</p>
                    <p className="text-sm text-neutral-500">{testimonio.carrera}</p>
                  </div>
                  {/* University badge */}
                  <div className="bg-white rounded-lg p-2 shadow-sm border border-neutral-100">
                    <img
                      src={convenio.logo}
                      alt={convenio.nombre}
                      className="h-6 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.parentElement!.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Rating */}
                {testimonio.rating && (
                  <div className="flex items-center gap-1 mt-4 pt-4 border-t border-neutral-100">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonio.rating!
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-200'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-neutral-500 ml-2">
                      {testimonio.equipoComprado}
                    </span>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConvenioTestimonialsV1;
