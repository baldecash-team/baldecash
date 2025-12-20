'use client';

/**
 * ConvenioTestimonialsV4 - Video testimonials style
 * Version: V4 - Cards con estilo de video testimonial (thumbnails)
 */

import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { Star, Play, Quote } from 'lucide-react';
import { ConvenioTestimonialsProps } from '../../types/convenio';
import { getTestimoniosByConvenio, testimonios as allTestimonios } from '../../data/mockConvenioData';

export const ConvenioTestimonialsV4: React.FC<ConvenioTestimonialsProps> = ({
  convenio,
  testimonios,
}) => {
  let testimoniosList = testimonios || getTestimoniosByConvenio(convenio.slug);
  if (testimoniosList.length === 0) {
    testimoniosList = allTestimonios.slice(0, 3);
  }

  return (
    <section id="testimonios" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Chip
            radius="sm"
            classNames={{
              base: 'px-3 py-1 h-auto mb-4',
              content: 'text-white text-xs font-medium',
            }}
            style={{ backgroundColor: convenio.colorPrimario }}
          >
            Testimonios verificados
          </Chip>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            Conoce a nuestros estudiantes
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Historias reales de estudiantes de {convenio.nombreCorto} que ya tienen su equipo.
          </p>
        </div>

        {/* Video-style testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimoniosList.slice(0, 3).map((testimonio) => (
            <Card
              key={testimonio.id}
              className="overflow-hidden border border-neutral-200 group cursor-pointer"
              isPressable
            >
              {/* Video thumbnail style */}
              <div className="relative h-48 bg-neutral-100">
                <img
                  src={testimonio.foto || `https://ui-avatars.com/api/?name=${testimonio.nombre}&background=4654CD&color=fff&size=300`}
                  alt={testimonio.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${testimonio.nombre}&background=4654CD&color=fff&size=300`;
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: convenio.colorPrimario }}
                  >
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  1:30
                </div>

                {/* University badge */}
                <div className="absolute top-3 left-3 bg-white rounded-lg p-2 shadow-sm">
                  <img
                    src={convenio.logo}
                    alt={convenio.nombre}
                    className="h-5 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.parentElement!.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              <CardBody className="p-4">
                {/* Quote preview */}
                <div className="flex items-start gap-2 mb-3">
                  <Quote className="w-4 h-4 text-neutral-300 flex-shrink-0 mt-1" />
                  <p className="text-neutral-600 text-sm line-clamp-2">
                    {testimonio.testimonio}
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-800">{testimonio.nombre}</p>
                    <p className="text-xs text-neutral-500">{testimonio.carrera}</p>
                  </div>
                  {testimonio.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{testimonio.rating}.0</span>
                    </div>
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

export default ConvenioTestimonialsV4;
