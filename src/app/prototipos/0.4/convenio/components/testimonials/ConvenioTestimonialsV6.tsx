'use client';

/**
 * ConvenioTestimonialsV6 - Masonry layout
 * Version: V6 - Testimonios en layout tipo masonry/Pinterest
 */

import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { Star, Quote, CheckCircle } from 'lucide-react';
import { ConvenioTestimonialsProps } from '../../types/convenio';
import { getTestimoniosByConvenio, testimonios as allTestimonios } from '../../data/mockConvenioData';

export const ConvenioTestimonialsV6: React.FC<ConvenioTestimonialsProps> = ({
  convenio,
  testimonios,
}) => {
  let testimoniosList = testimonios || getTestimoniosByConvenio(convenio.slug);
  if (testimoniosList.length === 0) {
    testimoniosList = allTestimonios.slice(0, 6);
  }

  // Vary card heights based on content length
  const getCardSize = (index: number) => {
    const sizes = ['short', 'medium', 'tall'] as const;
    return sizes[index % 3];
  };

  return (
    <section id="testimonios" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
              Experiencias reales
            </h2>
            <p className="text-neutral-600">
              Lo que dicen los estudiantes de {convenio.nombreCorto} sobre BaldeCash.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <CheckCircle className="w-5 h-5 text-[#22c55e]" />
            <span className="text-sm text-neutral-500">Testimonios verificados</span>
          </div>
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {testimoniosList.map((testimonio, index) => {
            const cardSize = getCardSize(index);
            const isLong = cardSize === 'tall';

            return (
              <Card
                key={testimonio.id}
                className="break-inside-avoid border border-neutral-200 hover:shadow-lg transition-shadow"
              >
                <CardBody className="p-5">
                  {/* Header with avatar */}
                  <div className="flex items-center gap-3 mb-4">
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
                      <p className="text-xs text-neutral-500">{testimonio.carrera}</p>
                    </div>
                    {/* Verified badge */}
                    <Chip
                      size="sm"
                      radius="sm"
                      classNames={{
                        base: 'bg-[#22c55e]/10 px-2 py-0.5 h-auto',
                        content: 'text-[#22c55e] text-xs font-medium',
                      }}
                      startContent={<CheckCircle className="w-3 h-3" />}
                    >
                      Verificado
                    </Chip>
                  </div>

                  {/* Quote */}
                  <div className="relative mb-4">
                    <Quote
                      className="absolute -top-1 -left-1 w-6 h-6 opacity-10"
                      style={{ color: convenio.colorPrimario }}
                    />
                    <p className={`text-neutral-600 text-sm pl-4 ${isLong ? '' : 'line-clamp-4'}`}>
                      {testimonio.testimonio}
                    </p>
                  </div>

                  {/* Rating */}
                  {testimonio.rating && (
                    <div className="flex items-center gap-1 mb-3">
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
                    </div>
                  )}

                  {/* Equipment tag */}
                  {testimonio.equipoComprado && (
                    <Chip
                      size="sm"
                      radius="sm"
                      classNames={{
                        base: 'px-2 py-0.5 h-auto',
                        content: 'text-xs font-medium',
                      }}
                      style={{
                        backgroundColor: `${convenio.colorPrimario}15`,
                        color: convenio.colorPrimario,
                      }}
                    >
                      {testimonio.equipoComprado}
                    </Chip>
                  )}

                  {/* University logo (subtle) */}
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <img
                      src={convenio.logo}
                      alt={convenio.nombre}
                      className="h-5 object-contain opacity-40"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {testimonio.fechaCompra && (
                      <span className="text-xs text-neutral-400">
                        {new Date(testimonio.fechaCompra).toLocaleDateString('es-PE', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ConvenioTestimonialsV6;
