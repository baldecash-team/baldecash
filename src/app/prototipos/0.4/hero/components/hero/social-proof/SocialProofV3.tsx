'use client';

/**
 * SocialProofV3 - Carrusel de Testimonios
 *
 * Concepto: Carrusel con 2 testimonios por pantalla, 8 en total
 * Estilo: Cards con foto, nombre, institución y quote
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { SocialProofProps } from '../../../types/hero';
import { mockTestimonials, mockInstitutions } from '../../../data/mockHeroData';
import { UnderlinedText } from '../common/UnderlinedText';

export const SocialProofV3: React.FC<SocialProofProps> = ({ data, underlineStyle = 4 }) => {
  const [page, setPage] = useState(0);
  const testimonialsPerPage = 2;
  const totalPages = Math.ceil(mockTestimonials.length / testimonialsPerPage);

  const visibleTestimonials = mockTestimonials.slice(
    page * testimonialsPerPage,
    (page + 1) * testimonialsPerPage
  );

  const nextPage = () => setPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  const getInstitutionLogo = (institutionCode: string) => {
    const institution = mockInstitutions.find((inst) => inst.code === institutionCode);
    return institution?.logo || '';
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3 font-['Baloo_2']">
            Lo que dicen nuestros estudiantes
          </h2>
          <p className="text-neutral-600">
            +{data.studentCount.toLocaleString()} estudiantes ya confían en nosotros
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            isIconOnly
            radius="full"
            variant="flat"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg border border-neutral-100 cursor-pointer hover:bg-neutral-50 hidden md:flex"
            onPress={prevPage}
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </Button>

          <Button
            isIconOnly
            radius="full"
            variant="flat"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg border border-neutral-100 cursor-pointer hover:bg-neutral-50 hidden md:flex"
            onPress={nextPage}
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </Button>

          {/* Testimonials Grid */}
          <div className="overflow-hidden px-4 md:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {visibleTestimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-100 hover:shadow-xl hover:border-[#4654CD]/20 transition-all"
                  >
                    {/* Quote Icon */}
                    <div className="flex justify-between items-start mb-4">
                      <Quote className="w-8 h-8 text-[#4654CD]/20" />
                      {/* Institution Logo - Highlighted */}
                      <div className="w-16 h-10 bg-[#4654CD]/5 rounded-lg p-2 flex items-center justify-center border border-[#4654CD]/10">
                        <img
                          src={getInstitutionLogo(testimonial.institution)}
                          alt={testimonial.institution}
                          className="max-h-6 max-w-12 object-contain"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>

                    {/* Quote Text */}
                    <p className="text-neutral-700 text-lg leading-relaxed mb-6">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#4654CD]/10"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=4654CD&color=fff`;
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-800">{testimonial.name}</p>
                        <p className="text-sm text-[#4654CD] font-medium">
                          Estudiante de {testimonial.institution}
                        </p>
                      </div>
                      {/* Rating */}
                      <div className="flex gap-0.5">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Page Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  page === index
                    ? 'bg-[#4654CD] w-8'
                    : 'bg-neutral-300 hover:bg-neutral-400'
                }`}
              />
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-4 mt-6 md:hidden">
            <Button
              isIconOnly
              radius="full"
              variant="flat"
              className="bg-white shadow-md border border-neutral-100 cursor-pointer"
              onPress={prevPage}
            >
              <ChevronLeft className="w-5 h-5 text-neutral-600" />
            </Button>
            <Button
              isIconOnly
              radius="full"
              variant="flat"
              className="bg-white shadow-md border border-neutral-100 cursor-pointer"
              onPress={nextPage}
            >
              <ChevronRight className="w-5 h-5 text-neutral-600" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofV3;
