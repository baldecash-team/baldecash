'use client';

/**
 * ConvenioTestimonialsV3 - Testimonial destacado + thumbnails
 * Version: V3 - Un testimonio grande con miniaturas navegables
 */

import React, { useState } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Star, Quote } from 'lucide-react';
import { ConvenioTestimonialsProps } from '../../types/convenio';
import { getTestimoniosByConvenio, testimonios as allTestimonios } from '../../data/mockConvenioData';

export const ConvenioTestimonialsV3: React.FC<ConvenioTestimonialsProps> = ({
  convenio,
  testimonios,
}) => {
  let testimoniosList = testimonios || getTestimoniosByConvenio(convenio.slug);
  if (testimoniosList.length === 0) {
    testimoniosList = allTestimonios.slice(0, 4);
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const activeTestimonio = testimoniosList[activeIndex];

  return (
    <section id="testimonios" className="py-16 bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            Historias de éxito
          </h2>
          <p className="text-neutral-600">
            Estudiantes de {convenio.nombreCorto} comparten su experiencia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main testimonial */}
          <Card className="md:col-span-2 border border-neutral-200">
            <CardBody className="p-8">
              <Quote
                className="w-12 h-12 mb-6"
                style={{ color: convenio.colorPrimario }}
              />

              <p className="text-xl text-neutral-700 mb-8 leading-relaxed">
                "{activeTestimonio.testimonio}"
              </p>

              {/* Author info */}
              <div className="flex items-center gap-4">
                <img
                  src={activeTestimonio.foto || `https://ui-avatars.com/api/?name=${activeTestimonio.nombre}&background=4654CD&color=fff`}
                  alt={activeTestimonio.nombre}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${activeTestimonio.nombre}&background=4654CD&color=fff`;
                  }}
                />
                <div>
                  <p className="font-bold text-lg text-neutral-800">{activeTestimonio.nombre}</p>
                  <p className="text-neutral-500">{activeTestimonio.carrera}</p>
                  {activeTestimonio.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < activeTestimonio.rating!
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment */}
              {activeTestimonio.equipoComprado && (
                <div className="mt-6 pt-6 border-t border-neutral-100">
                  <p className="text-sm text-neutral-500">
                    Equipo adquirido:{' '}
                    <span className="font-medium text-neutral-700">{activeTestimonio.equipoComprado}</span>
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Thumbnail navigation */}
          <div className="space-y-3">
            <p className="text-sm text-neutral-500 mb-2">Más historias:</p>
            {testimoniosList.map((testimonio, index) => (
              <button
                key={testimonio.id}
                onClick={() => setActiveIndex(index)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  index === activeIndex
                    ? 'bg-white shadow-md border-l-4'
                    : 'bg-white/50 hover:bg-white'
                }`}
                style={index === activeIndex ? { borderColor: convenio.colorPrimario } : {}}
              >
                <img
                  src={testimonio.foto || `https://ui-avatars.com/api/?name=${testimonio.nombre}&background=4654CD&color=fff`}
                  alt={testimonio.nombre}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${testimonio.nombre}&background=4654CD&color=fff`;
                  }}
                />
                <div className="text-left">
                  <p className="font-semibold text-sm text-neutral-800">{testimonio.nombre}</p>
                  <p className="text-xs text-neutral-500">{testimonio.carrera}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConvenioTestimonialsV3;
