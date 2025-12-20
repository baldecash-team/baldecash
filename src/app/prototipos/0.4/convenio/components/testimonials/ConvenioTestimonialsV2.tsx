'use client';

/**
 * ConvenioTestimonialsV2 - Carrusel deslizable
 * Version: V2 - Testimonios en carrusel horizontal
 */

import React, { useState, useRef } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { ConvenioTestimonialsProps } from '../../types/convenio';
import { getTestimoniosByConvenio, testimonios as allTestimonios } from '../../data/mockConvenioData';

export const ConvenioTestimonialsV2: React.FC<ConvenioTestimonialsProps> = ({
  convenio,
  testimonios,
}) => {
  let testimoniosList = testimonios || getTestimoniosByConvenio(convenio.slug);
  if (testimoniosList.length === 0) {
    testimoniosList = allTestimonios.slice(0, 5);
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section id="testimonios" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2 font-['Baloo_2']">
              Lo que dicen nuestros estudiantes
            </h2>
            <p className="text-neutral-600">
              Historias reales de estudiantes {convenio.nombreCorto}
            </p>
          </div>

          {/* Navigation arrows */}
          <div className="hidden md:flex gap-2">
            <Button
              isIconOnly
              variant="bordered"
              className="rounded-full cursor-pointer"
              isDisabled={!canScrollLeft}
              onPress={() => scroll('left')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              isIconOnly
              variant="bordered"
              className="rounded-full cursor-pointer"
              isDisabled={!canScrollRight}
              onPress={() => scroll('right')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          onScroll={checkScroll}
        >
          {testimoniosList.map((testimonio) => (
            <Card
              key={testimonio.id}
              className="flex-shrink-0 w-[320px] border border-neutral-200"
            >
              <CardBody className="p-5">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (testimonio.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-neutral-600 text-sm mb-4 line-clamp-4">
                  "{testimonio.testimonio}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                  <img
                    src={testimonio.foto || `https://ui-avatars.com/api/?name=${testimonio.nombre}&background=4654CD&color=fff`}
                    alt={testimonio.nombre}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${testimonio.nombre}&background=4654CD&color=fff`;
                    }}
                  />
                  <div>
                    <p className="font-semibold text-neutral-800 text-sm">{testimonio.nombre}</p>
                    <p className="text-xs text-neutral-500">{testimonio.carrera}</p>
                  </div>
                </div>

                {/* Equipment purchased */}
                {testimonio.equipoComprado && (
                  <div
                    className="mt-3 px-3 py-1.5 rounded-lg text-xs"
                    style={{ backgroundColor: `${convenio.colorPrimario}10`, color: convenio.colorPrimario }}
                  >
                    Compró: {testimonio.equipoComprado}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Mobile navigation dots */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {testimoniosList.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-neutral-300"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConvenioTestimonialsV2;
