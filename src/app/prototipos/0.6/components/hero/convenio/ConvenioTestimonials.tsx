'use client';

/**
 * ConvenioTestimonials - Cards Grid 3 columnas para convenio
 * Adaptado de v0.5 al sistema API-driven de v0.6
 * - Sin Framer Motion (opcional, usa CSS transitions)
 * - Colores via CSS variables
 * - Datos desde API (testimonials)
 */

import React from 'react';
import { Star, Quote } from 'lucide-react';
import type { Testimonial, AgreementData } from '../../../types/hero';

interface ConvenioTestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  agreementData: AgreementData;
}

export const ConvenioTestimonials: React.FC<ConvenioTestimonialsProps> = ({
  testimonials,
  title,
  agreementData,
}) => {
  const institutionShortName = agreementData.institution_short_name || agreementData.institution_name || '';
  const visibleTestimonials = testimonials
    .filter((t) => t.is_visible !== false)
    .slice(0, 3);

  if (visibleTestimonials.length === 0) return null;

  return (
    // No `id` here — the wrapper <section> in HeroSection.tsx already provides
    // id="testimonios", and duplicating it would make the HTML invalid.
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 font-['Baloo_2',_sans-serif] leading-tight"
            style={{ color: 'var(--color-primary, #4654CD)' }}
          >
            {title}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
            Estudiantes de {institutionShortName} ya financiaron su equipo con nosotros.
          </p>
        </div>

        {/* Testimonials Grid - up to 3 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {visibleTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-neutral-50 rounded-2xl p-5 sm:p-6 relative hover:shadow-md transition-shadow"
            >
              {/* Quote icon */}
              <Quote
                className="absolute top-4 right-4 w-7 h-7 sm:w-8 sm:h-8 opacity-10"
                style={{ color: 'var(--color-primary, #4654CD)' }}
              />

              {/* Rating */}
              {testimonial.rating && testimonial.rating > 0 && (
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              )}

              {/* Testimonial text */}
              <p className="text-sm sm:text-base text-neutral-700 mb-5 sm:mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=4654CD&color=fff`}
                  alt={testimonial.name}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=4654CD&color=fff`;
                  }}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-800 text-sm sm:text-base truncate">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-neutral-500 truncate">{testimonial.institution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConvenioTestimonials;
